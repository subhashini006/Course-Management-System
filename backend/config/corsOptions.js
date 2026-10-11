const config = require("./index");

// The React dev server (any localhost port) may call this API and send the
// login cookie along, so a fixed list is used instead of a wildcard.
module.exports = {
    origin(origin, callback) {
        const ok =
            !origin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            config.CORS_ORIGIN.includes(origin);
        callback(null, ok);
    },
    credentials: true,
};
