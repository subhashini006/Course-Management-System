// One trusted-origin rule shared by Express (CORS) and Socket.IO (Task 14.1).
// In development any localhost port is accepted so Vite can move from 5173 to
// 5174 without breaking login; in production ONLY the origins listed in
// CLIENT_URL are accepted.
const config = require("./index");

const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin) {
    // Non-browser clients (Postman, curl, server-to-server) send no Origin
    if (!origin) return true;
    if (config.CLIENT_ORIGINS.includes(origin)) return true;
    return !config.IS_PRODUCTION && LOCALHOST.test(origin);
}

module.exports = { isOriginAllowed };
