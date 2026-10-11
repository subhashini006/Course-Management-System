const express = require("express");
const { getStudents, getStudent, addStudent } = require("../controllers/studentController");
const validateStudent = require("../middleware/studentValidation");

const router = express.Router();

router.get("/", getStudents);
router.get("/:id", getStudent);

// Register
router.post("/", validateStudent, addStudent);

module.exports = router;
