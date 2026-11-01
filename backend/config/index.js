// Central place for every setting. Values come from .env (via dotenv) with
// safe development defaults. Secrets (JWT_SECRET, MONGO_URI) have NO default
// on purpose: the server refuses to start without them.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const NODE_ENV = process.env.NODE_ENV || "development";

// Comma-separated list of browser origins allowed to call the API and open
// WebSockets, e.g.  CLIENT_URL=https://my-app.vercel.app,http://localhost:5173
const CLIENT_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

module.exports = {
    NODE_ENV,
    IS_PRODUCTION: NODE_ENV === "production",
    PORT: Number(process.env.PORT) || 5000,

    MONGO_URI: process.env.MONGO_URI || "",

    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

    CLIENT_ORIGINS,
    // The first origin is the "main" frontend (used in password-reset links)
    CLIENT_URL: CLIENT_ORIGINS[0],

    BCRYPT_ROUNDS: 12,
    RESET_MS: 30 * 60 * 1000, // password-reset links last 30 minutes
    PASSWORD_MIN: 12, // Task 9 / 14: at least 12 characters
    PASSWORD_MAX: 72, // bcrypt only reads the first 72 bytes
};
