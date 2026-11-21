function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, message = "Too many requests. Please try again later.", now = Date.now } = {}) {
    const attempts = new Map();
    let lastCleanup = 0;

    return function rateLimiter(req, res, next) {
        const currentTime = now();
        const key = req.ip || req.socket?.remoteAddress || "unknown";
        const record = attempts.get(key);

        if (!record || currentTime - record.startedAt >= windowMs) {
            attempts.set(key, { startedAt: currentTime, count: 1 });
        } else {
            record.count += 1;

            if (record.count > max) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((windowMs - (currentTime - record.startedAt)) / 1000)
                );

                res.setHeader("Retry-After", String(retryAfterSeconds));
                return res.status(429).json({ message, retryAfterSeconds });
            }
        }

        // Opportunistic cleanup avoids a timer that would keep the process alive.
        if (currentTime - lastCleanup > windowMs) {
            for (const [entryKey, entry] of attempts) {
                if (currentTime - entry.startedAt >= windowMs) {
                    attempts.delete(entryKey);
                }
            }
            lastCleanup = currentTime;
        }

        return next();
    };
}

module.exports = { createRateLimiter };
