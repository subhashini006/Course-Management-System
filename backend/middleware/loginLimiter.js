const { rateLimit } = require("express-rate-limit");

// Task 14.6 — at most 10 attempts per IP per 15 minutes on the login routes.
// (This counter lives in this server's memory. If you ever run several server
// instances, switch to a shared store such as Redis.)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again later.",
    },
});

// A gentler limit for registration and password-reset requests
const accountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Try again later.",
    },
});

module.exports = loginLimiter;
module.exports.accountLimiter = accountLimiter;
