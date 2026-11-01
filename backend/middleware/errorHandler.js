// Task 12.5 + 14.4 — the LAST middleware. Turns every error (database errors,
// validation errors, thrown HttpErrors, bad JSON, CORS refusals) into a clean
// JSON response and never leaks internals for unexpected (500) errors.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    // MongoDB duplicate key (e.g. same email twice)
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Duplicate value already exists" });
    }

    // Mongoose schema validation
    if (err.name === "ValidationError" && err.errors) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: Object.values(err.errors).map((item) => item.message),
        });
    }

    // Malformed ObjectId etc.
    if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: "Invalid identifier" });
    }

    // express.json() could not parse the body
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Request body is not valid JSON" });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Request body is too large" });
    }

    const candidate = err.status || err.statusCode;
    const status = Number.isInteger(candidate) && candidate >= 400 && candidate < 600 ? candidate : 500;

    if (status >= 500) console.error(err);

    res.status(status).json({
        success: false,
        message: status === 500 ? "Internal server error" : err.message,
    });
}

module.exports = errorHandler;
