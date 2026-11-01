const { validationResult } = require("express-validator");

// Task 14.2 — turns express-validator results into one tidy 400 response.
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }
    next();
}

module.exports = validateRequest;
