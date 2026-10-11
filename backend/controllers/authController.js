const authService = require("../services/authService");
const studentModel = require("../models/studentModel");
const { setSessionCookie, clearSessionCookie } = require("../utils/session");

// GET /api/v1/auth/me
const me = (req, res) => {
    res.status(200).json({ success: true, data: authService.getCurrentUser(req.session) });
};

// POST /api/v1/auth/login
const login = (req, res) => {
    const student = authService.loginStudent(req.body.email, req.body.password);
    setSessionCookie(res, { role: "student", id: student.id });
    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: { role: "student", student: studentModel.toPublic(student) },
    });
};

// POST /api/v1/auth/admin-login
const adminLogin = (req, res) => {
    authService.checkAdminLogin(req.body.email, req.body.password);
    setSessionCookie(res, { role: "admin" });
    res.status(200).json({
        success: true,
        message: "Admin verified",
        data: { role: "admin", student: null },
    });
};

// POST /api/v1/auth/logout
const logout = (req, res) => {
    clearSessionCookie(res);
    res.status(200).json({ success: true, message: "Logged out" });
};

// POST /api/v1/auth/forgot-password
const forgotPassword = (req, res) => {
    const { message, resetLink } = authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, message, data: { resetLink } });
};

// POST /api/v1/auth/reset-password
const resetPassword = (req, res) => {
    authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ success: true, message: "Password updated. You can log in now." });
};

module.exports = { me, login, adminLogin, logout, forgotPassword, resetPassword };
