const { getAllStudents, getStudentById, registerStudent } = require("../services/studentService");

// GET /api/v1/students
const getStudents = (req, res) => {
    const students = getAllStudents();
    res.status(200).json({ success: true, count: students.length, data: students });
};

// GET /api/v1/students/:id
const getStudent = (req, res) => {
    res.status(200).json({ success: true, data: getStudentById(req.params.id) });
};

// POST /api/v1/students  (registration)
const addStudent = (req, res) => {
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: registerStudent(req.body),
    });
};

module.exports = { getStudents, getStudent, addStudent };
