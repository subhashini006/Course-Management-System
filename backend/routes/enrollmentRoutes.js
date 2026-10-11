const express = require("express");
const controller = require("../controllers/enrollmentController");
const { requireAdmin, requireStudent } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.getEnrollments);
router.get("/:id", controller.getEnrollment);

// Enroll (logged-in student)
router.post("/", requireStudent, controller.addEnrollment);

// Update progress / delete (owner or admin — checked in the service)
router.patch("/:id", controller.editEnrollment);
router.delete("/:id", controller.removeEnrollment);

// Clear every enrollment (admin)
router.delete("/", requireAdmin, controller.removeAllEnrollments);

module.exports = router;
