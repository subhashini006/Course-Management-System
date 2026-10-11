const express = require("express");
const controller = require("../controllers/meController");
const { requireStudent } = require("../middleware/authMiddleware");

const router = express.Router();

// Everything here belongs to the logged-in student
router.use(requireStudent);

router.get("/enrollments", controller.myEnrollments);
router.get("/notifications", controller.myNotifications);
router.post("/notifications/read", controller.readNotifications);

module.exports = router;
