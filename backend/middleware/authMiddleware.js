const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Task 10.3 — verifies "Authorization: Bearer <token>".
//
// The signature and expiry are checked first. Then (the "higher-security"
// option from the task) the user is looked up in MongoDB, so:
//   * a deleted account stops working immediately, and
//   * the role always comes from the database, never from an old token.
// On success req.user = { sub, id, email, role, name }.
async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = header.slice(7).trim();
    if (!token) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is missing"));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    try {
        const user = await User.findById(decoded.sub).select("name email role").lean();
        if (!user) {
            return res.status(401).json({ success: false, message: "This account no longer exists. Please log in again." });
        }
        const id = String(user._id);
        req.user = { sub: id, id, email: user.email, role: user.role, name: user.name };
        next();
    } catch (error) {
        // A malformed "sub" (CastError) or a database failure is handled centrally
        next(error);
    }
}

module.exports = authMiddleware;
