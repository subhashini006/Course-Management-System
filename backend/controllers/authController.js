const authService = require("../services/authService");
const HttpError = require("../utils/HttpError");
const User = require("../models/User");

// Task 10.2 — the answer to a successful login. (`student` is the key the task
// uses; it holds the logged-in user, whatever their role.)
function loginResponse(user, message) {
    const { token, tokenType, expiresIn } = authService.issueToken(user);
    const person = authService.publicUser(user);
    return { success: true, message, token, tokenType, expiresIn, role: user.role, student: person };
}

// POST /api/v1/auth/register
async function register(req, res) {
    const student = await authService.registerStudent(req.body);
    res.status(201).json({ success: true, message: "Registration successful", student });
}

// POST /api/v1/auth/login
async function login(req, res) {
    const user = await authService.authenticate(req.body.email, req.body.password);
    res.status(200).json(loginResponse(user, "Login successful"));
}

// POST /api/v1/auth/admin-login — same users, same hashing; admins only
async function adminLogin(req, res) {
    const user = await authService.authenticate(req.body.email, req.body.password, { requireRole: "admin" });
    res.status(200).json(loginResponse(user, "Admin verified"));
}

// GET /api/v1/auth/me   (valid token required)
async function me(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) throw new HttpError(401, "This account no longer exists. Please log in again.");
    const person = authService.publicUser(user);
    res.status(200).json({
        success: true,
        data: { role: user.role, student: user.role === "student" ? person : null, user: person },
    });
}

// POST /api/v1/auth/forgot-password
async function forgotPassword(req, res) {
    const { message, resetLink } = await authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, message, data: { resetLink } });
}

// POST /api/v1/auth/reset-password
async function resetPassword(req, res) {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ success: true, message: "Password updated. You can log in now." });
}

module.exports = { register, login, adminLogin, me, forgotPassword, resetPassword };
