const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("../middlewares/rateLimit.middleware");

function invoke(middleware, ip) {
    let nextCalled = false;
    let statusCode = 200;
    const headers = {};
    const body = {};

    const req = { ip };
    const res = {
        setHeader(name, value) { headers[name] = value; },
        status(code) {
            statusCode = code;
            return this;
        },
        json(value) {
            Object.assign(body, value);
            return this;
        },
    };

    middleware(req, res, () => { nextCalled = true; });
    return { nextCalled, statusCode, headers, body };
}

test("rate limiter allows requests up to the configured maximum", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2, now: () => 100 });

    assert.equal(invoke(limiter, "192.0.2.1").nextCalled, true);
    assert.equal(invoke(limiter, "192.0.2.1").nextCalled, true);

    const blocked = invoke(limiter, "192.0.2.1");
    assert.equal(blocked.nextCalled, false);
    assert.equal(blocked.statusCode, 429);
    assert.equal(blocked.headers["Retry-After"], "1");
});

test("rate limiter counts IP addresses independently", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1, now: () => 100 });

    assert.equal(invoke(limiter, "192.0.2.1").nextCalled, true);
    assert.equal(invoke(limiter, "192.0.2.2").nextCalled, true);
    assert.equal(invoke(limiter, "192.0.2.1").statusCode, 429);
});

test("rate limiter resets after the time window", () => {
    let currentTime = 100;
    const limiter = createRateLimiter({ windowMs: 1000, max: 1, now: () => currentTime });

    assert.equal(invoke(limiter, "192.0.2.1").nextCalled, true);
    assert.equal(invoke(limiter, "192.0.2.1").statusCode, 429);

    currentTime = 1101;
    assert.equal(invoke(limiter, "192.0.2.1").nextCalled, true);
});
