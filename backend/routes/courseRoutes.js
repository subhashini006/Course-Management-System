const express = require("express");
const {
    getCourses,
    getCourse,
    getModule,
    addCourse,
    editCourse,
    removeCourse,
} = require("../controllers/courseController");
const validateCourse = require("../middleware/courseValidation");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET all courses
router.get("/", getCourses);

// GET one course
router.get("/:id", getCourse);

// GET the learning content of one course
router.get("/:id/module", getModule);

// CREATE course (admin)
router.post("/", requireAdmin, validateCourse, addCourse);

// UPDATE course (admin)
router.put("/:id", requireAdmin, editCourse);

// DELETE course (admin)
router.delete("/:id", requireAdmin, removeCourse);

module.exports = router;
