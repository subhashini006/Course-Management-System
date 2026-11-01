const express = require("express");
const router = express.Router();

const controller = require("../controllers/meController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Everything here belongs to the logged-in student
router.use(authMiddleware, authorizeRoles("student"));

router.get("/enrollments", controller.myEnrollments);

module.exports = router;
