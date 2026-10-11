const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

router.get("/me", controller.me);
router.post("/login", controller.login);
router.post("/admin-login", controller.adminLogin);
router.post("/logout", controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

module.exports = router;
