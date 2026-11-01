// Task 10.4 — use AFTER authMiddleware. A valid token only proves WHO you are;
// this decides WHAT you may do (401 = not logged in, 403 = not allowed).
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        next();
    };
}

module.exports = authorizeRoles;
