const studentService = require("../services/studentService");

// All student endpoints are admin-managed (see routes/studentRoutes.js).
// Express 5 forwards errors from async handlers to the error middleware by
// itself, so no try/catch is needed here.

// GET /api/v1/students
async function getStudents(req, res) {
    const { students, pagination } = await studentService.listStudents(req.query);
    res.json({ success: true, count: students.length, pagination, students });
}

// GET /api/v1/students/:id
async function getStudentById(req, res) {
    res.json({ success: true, student: await studentService.getStudent(req.params.id) });
}

// POST /api/v1/students
async function createStudent(req, res) {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, message: "Student created", student });
}

// PUT /api/v1/students/:id
async function updateStudent(req, res) {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.json({ success: true, message: "Student updated", student });
}

// DELETE /api/v1/students/:id
async function deleteStudent(req, res) {
    await studentService.deleteStudent(req.params.id);
    res.json({ success: true, message: "Student deleted" });
}

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
