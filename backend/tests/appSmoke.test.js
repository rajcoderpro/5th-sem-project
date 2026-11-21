const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

test("API exposes health, security headers, and JSON 404 responses", async (t) => {
    const server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    t.after(() => new Promise((resolve) => server.close(resolve)));

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const healthResponse = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: "http://localhost:5173" },
    });
    const health = await healthResponse.json();

    assert.ok([200, 503].includes(healthResponse.status));
    assert.ok(["connected", "disconnected"].includes(health.database));
    assert.equal(healthResponse.headers.get("x-frame-options"), "DENY");
    assert.equal(healthResponse.headers.get("x-content-type-options"), "nosniff");

    const missingResponse = await fetch(`${baseUrl}/api/not-a-real-route`);
    const missing = await missingResponse.json();
    assert.equal(missingResponse.status, 404);
    assert.equal(missing.message, "API route not found");

    const blockedOriginResponse = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: "https://untrusted.example" },
    });
    assert.equal(blockedOriginResponse.status, 403);

    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unpaired user", email: "unpaired@example.test", password: "password123" }),
    });
    assert.equal(registerResponse.status, 403);

    const notificationsResponse = await fetch(`${baseUrl}/api/notifications`);
    assert.equal(notificationsResponse.status, 401);
});
