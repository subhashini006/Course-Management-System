const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const controller = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mongoIdParam } = require("../validators/common");

const idParam = mongoIdParam("id", "enrollment ID");

// Every enrollment route needs a logged-in user
router.use(authMiddleware);

// Admin: list everything / clear everything
router.get("/", authorizeRoles("admin"), controller.getEnrollments);
router.delete("/", authorizeRoles("admin"), controller.removeAllEnrollments);

// Enrol (students only)
router.post(
    "/",
    authorizeRoles("student"),
    body("courseId").isMongoId().withMessage("A valid courseId is required"),
    body("roll").isString().withMessage("Roll number is required").bail().trim().notEmpty().withMessage("Roll number is required").isLength({ max: 50 }).withMessage("Roll number is too long"),
    body("name").optional().isString().bail().trim().isLength({ max: 100 }).withMessage("Name is too long"),
    validateRequest,
    controller.addEnrollment
);

// One enrollment: owner or admin (checked in the service)
router.get("/:id", idParam, validateRequest, controller.getEnrollment);
router.patch("/:id", idParam, validateRequest, controller.editEnrollment);
router.delete("/:id", idParam, validateRequest, controller.withdrawEnrollment);

module.exports = router;
