const service = require("../services/enrollmentService");

// GET /api/v1/enrollments?courseId=&email=&status=   (admin)
async function getEnrollments(req, res) {
    const { enrollments, total } = await service.getAllEnrollments(req.query);
    res.status(200).json({ success: true, count: enrollments.length, total, data: enrollments });
}

// GET /api/v1/enrollments/:id   (owner or admin)
async function getEnrollment(req, res) {
    res.status(200).json({ success: true, data: await service.getEnrollmentById(req.params.id, req.user) });
}

// POST /api/v1/enrollments   (logged-in student)
async function addEnrollment(req, res) {
    const data = await service.createEnrollment(req.user, req.body);
    res.status(201).json({ success: true, message: "Enrolled successfully", data });
}

// PATCH /api/v1/enrollments/:id   (owner or admin) — progress, name, roll
async function editEnrollment(req, res) {
    const data = await service.updateEnrollment(req.params.id, req.body || {}, req.user);
    res.status(200).json({ success: true, message: "Enrollment updated successfully", data });
}

// DELETE /api/v1/enrollments/:id   (owner or admin) — withdraw; history is kept
async function withdrawEnrollment(req, res) {
    const data = await service.withdrawEnrollment(req.params.id, req.user);
    res.status(200).json({ success: true, message: "Enrollment withdrawn", data });
}

// DELETE /api/v1/enrollments   (admin: clear all)
async function removeAllEnrollments(req, res) {
    const removed = await service.clearEnrollments();
    res.status(200).json({ success: true, message: "All enrollments cleared", data: { removed } });
}

module.exports = { getEnrollments, getEnrollment, addEnrollment, editEnrollment, withdrawEnrollment, removeAllEnrollments };
