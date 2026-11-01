const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const loginLimiter = require("../middleware/loginLimiter");
const { accountLimiter } = loginLimiter;
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require("../validators/authValidators");

// Task 9 — registration (students only) and login
router.post("/register", accountLimiter, registerValidation, validateRequest, authController.register);
router.post("/login", loginLimiter, loginValidation, validateRequest, authController.login);

// Admin sign-in for the admin screens — same users, same hashing, role must be "admin"
router.post("/admin-login", loginLimiter, loginValidation, validateRequest, authController.adminLogin);

// Task 10 — who does my token belong to?
router.get("/me", authMiddleware, authController.me);

router.post("/forgot-password", accountLimiter, forgotPasswordValidation, validateRequest, authController.forgotPassword);
router.post("/reset-password", accountLimiter, resetPasswordValidation, validateRequest, authController.resetPassword);

module.exports = router;
