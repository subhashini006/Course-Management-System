const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/studentController");
const { studentIdParam, createStudentValidation, updateStudentValidation } = require("../validators/studentValidators");

// Everything here is admin-only: authenticate first, then authorise
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

router.get("/", controller.getStudents);
router.get("/:id", studentIdParam, validateRequest, controller.getStudentById);
router.post("/", createStudentValidation, validateRequest, controller.createStudent);
router.put("/:id", studentIdParam, updateStudentValidation, validateRequest, controller.updateStudent);
router.delete("/:id", studentIdParam, validateRequest, controller.deleteStudent);

module.exports = router;
