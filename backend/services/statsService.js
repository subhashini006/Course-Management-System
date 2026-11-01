const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const CourseModule = require("../models/CourseModule");

async function getStats() {
    const [students, courses, enrollments, modules, completedEnrollments] = await Promise.all([
        User.countDocuments({ role: "student" }),
        Course.countDocuments(),
        Enrollment.countDocuments({ status: { $ne: "withdrawn" } }),
        CourseModule.countDocuments(),
        Enrollment.countDocuments({ status: "completed" }),
    ]);
    return { students, courses, enrollments, modules, completedEnrollments };
}

module.exports = { getStats };
