const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { courseIdParam, createCourseValidation, updateCourseValidation } = require("../validators/courseValidators");

// Access policy
//   Public ........ GET  /api/v1/courses, /:id, /:id/module
//   Admin only .... POST / PUT / DELETE  (401 without a token, 403 for a student)
router.get("/", courseController.getAllCourses);
router.get("/:id", courseIdParam, validateRequest, courseController.getCourseById);
router.get("/:id/module", courseIdParam, validateRequest, courseController.getCourseModule);

router.post("/", authMiddleware, authorizeRoles("admin"), createCourseValidation, validateRequest, courseController.createCourse);
router.put("/:id", authMiddleware, authorizeRoles("admin"), courseIdParam, updateCourseValidation, validateRequest, courseController.updateCourse);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), courseIdParam, validateRequest, courseController.deleteCourse);

module.exports = router;
