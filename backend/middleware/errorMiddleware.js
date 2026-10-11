const config = require("../config");

// Global error handler. It must be registered LAST in server.js, because
// Express runs middleware from top to bottom.
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
    let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message || "Internal Server Error";

    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Request body is not valid JSON.";
    }

    if (statusCode >= 500) {
        console.error(err.stack);
        if (config.NODE_ENV === "production") message = "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;
