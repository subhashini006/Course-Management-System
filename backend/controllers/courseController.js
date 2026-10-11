const {
    getAllCourses,
    getCourseById,
    getCourseModule,
    createCourse,
    updateCourse,
    deleteCourse,
} = require("../services/courseService");

// GET /api/v1/courses
const getCourses = (req, res) => {
    const courses = getAllCourses();

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
};

// GET /api/v1/courses/:id
const getCourse = (req, res) => {
    res.status(200).json({
        success: true,
        data: getCourseById(req.params.id),
    });
};

// GET /api/v1/courses/:id/module
const getModule = (req, res) => {
    res.status(200).json({
        success: true,
        data: getCourseModule(req.params.id),
    });
};

// POST /api/v1/courses
const addCourse = (req, res) => {
    const newCourse = createCourse(req.body);

    res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
    });
};

// PUT /api/v1/courses/:id
const editCourse = (req, res) => {
    const updatedCourse = updateCourse(req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
    });
};

// DELETE /api/v1/courses/:id
const removeCourse = (req, res) => {
    const result = deleteCourse(req.params.id);

    res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        data: result,
    });
};

module.exports = {
    getCourses,
    getCourse,
    getModule,
    addCourse,
    editCourse,
    removeCourse,
};
