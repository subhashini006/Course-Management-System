const service = require("../services/enrollmentService");

// GET /api/v1/enrollments?courseId=&email=
const getEnrollments = (req, res) => {
    const list = service.getAllEnrollments(req.query);
    res.status(200).json({ success: true, count: list.length, data: list });
};

// GET /api/v1/enrollments/:id
const getEnrollment = (req, res) => {
    res.status(200).json({ success: true, data: service.getEnrollmentById(req.params.id) });
};

// POST /api/v1/enrollments   (logged-in student)
const addEnrollment = (req, res) => {
    res.status(201).json({
        success: true,
        message: "Enrolled successfully",
        data: service.createEnrollment(req.session.id, req.body),
    });
};

// PATCH /api/v1/enrollments/:id   (owner or admin)
const editEnrollment = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Enrollment updated successfully",
        data: service.updateEnrollment(req.params.id, req.body || {}, req.session),
    });
};

// DELETE /api/v1/enrollments/:id   (owner or admin)
const removeEnrollment = (req, res) => {
    service.deleteEnrollment(req.params.id, req.session);
    res.status(200).json({ success: true, message: "Enrollment deleted successfully" });
};

// DELETE /api/v1/enrollments   (admin: clear all)
const removeAllEnrollments = (req, res) => {
    const removed = service.clearEnrollments();
    res.status(200).json({ success: true, message: "All enrollments cleared", data: { removed } });
};

module.exports = {
    getEnrollments,
    getEnrollment,
    addEnrollment,
    editEnrollment,
    removeEnrollment,
    removeAllEnrollments,
};
