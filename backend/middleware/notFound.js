// Task 14.4 — after all routes, before the error handler.
function notFound(req, res) {
    res.status(404).json({ success: false, message: "API endpoint not found" });
}

module.exports = notFound;
