const express = require("express");
const router = express.Router();

const { stats } = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, authorizeRoles("admin"), stats);

module.exports = router;
