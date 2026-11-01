const courseService = require("../services/courseService");

// GET /api/v1/courses
async function getAllCourses(req, res) {
    const { courses, pagination } = await courseService.listCourses(req.query);
    res.status(200).json({ success: true, count: courses.length, pagination, data: courses });
}

// GET /api/v1/courses/:id
async function getCourseById(req, res) {
    res.status(200).json({ success: true, data: await courseService.getCourseById(req.params.id) });
}

// GET /api/v1/courses/:id/module
async function getCourseModule(req, res) {
    res.status(200).json({ success: true, data: await courseService.getCourseModule(req.params.id) });
}

// POST /api/v1/courses
async function createCourse(req, res) {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({ success: true, message: "Course created successfully", data: course });
}

// PUT /api/v1/courses/:id
async function updateCourse(req, res) {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Course updated successfully", data: course });
}

// DELETE /api/v1/courses/:id
async function deleteCourse(req, res) {
    const result = await courseService.deleteCourse(req.params.id);
    res.status(200).json({ success: true, message: "Course deleted successfully", data: result });
}

module.exports = { getAllCourses, getCourseById, getCourseModule, createCourse, updateCourse, deleteCourse };
