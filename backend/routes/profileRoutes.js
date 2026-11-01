const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getProfile, updateProfile } = require("../controllers/profileController");
const { updateProfileValidation } = require("../validators/studentValidators");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfileValidation, validateRequest, updateProfile);

module.exports = router;
