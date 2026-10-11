// Central place for every setting. Values come from .env (via dotenv),
// with safe development defaults.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const DATA_DIR = path.join(__dirname, "..", "data");

module.exports = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 5000,

    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    // Extra allowed origins, comma separated (localhost is always allowed)
    CORS_ORIGIN: (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),

    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@institute.edu",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "password123",

    SESSION_SECRET: process.env.SESSION_SECRET || "",
    COOKIE_NAME: "sv_session",
    SESSION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
    RESET_MS: 30 * 60 * 1000, // password-reset links last 30 minutes

    DATA_DIR,
    DB_PATH: path.join(DATA_DIR, "db.json"),
    SECRET_PATH: path.join(DATA_DIR, "secret.key"),
};
