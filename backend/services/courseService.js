const courseModel = require("../models/courseModel");
const moduleModel = require("../models/moduleModel");
const enrollmentModel = require("../models/enrollmentModel");
const { getModule } = require("./moduleService");
const HttpError = require("../utils/HttpError");
const { str, slugify, uniqueId } = require("../utils/helpers");

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Picks the editable course fields out of a request body
function pickCourseFields(body) {
    const out = {};
    ["title", "instructor", "duration", "hours", "rating", "topics", "outcome", "prereqs", "image"].forEach((key) => {
        if (body[key] !== undefined) out[key] = str(body[key]);
    });
    if (body.level !== undefined) out.level = LEVELS.includes(body.level) ? body.level : "Beginner";
    const label = body.sectionLabel !== undefined ? body.sectionLabel : body.category;
    if (label !== undefined) out.sectionLabel = str(label);
    if (body.section !== undefined) out.section = slugify(body.section, "other");
    if (Array.isArray(body.learn)) out.learn = body.learn.map(str).filter(Boolean);
    return out;
}

// Get all courses
const getAllCourses = () => courseModel.all();

// Get one course
const getCourseById = (id) => {
    const course = courseModel.findById(id);
    if (!course) throw new HttpError(404, "Course not found");
    return course;
};

// Learning content for a course
const getCourseModule = (id) => getModule(getCourseById(id));

// Create course
const createCourse = (body) => {
    const fields = pickCourseFields(body || {});
    if (!fields.title) throw new HttpError(400, "Course title is required");

    const existing = new Set(courseModel.all().map((c) => String(c.id)));
    let id = str(body.id);
    if (!id) id = uniqueId(slugify(fields.title), existing);
    else if (existing.has(id)) throw new HttpError(409, `Course with id "${id}" already exists`);

    const sectionLabel = fields.sectionLabel || "Other";
    return courseModel.insert({
        id,
        title: fields.title,
        section: fields.section || slugify(sectionLabel, "other"),
        sectionLabel,
        level: fields.level || "Beginner",
        duration: fields.duration || "",
        hours: fields.hours || "",
        rating: fields.rating || "New",
        instructor: fields.instructor || "",
        topics: fields.topics || "",
        outcome: fields.outcome || "",
        prereqs: fields.prereqs || "",
        learn: fields.learn || (fields.outcome ? [fields.outcome] : []),
        image: fields.image || `https://picsum.photos/seed/${id}/400/220`,
        createdAt: new Date().toISOString(),
    });
};

// Update course (the id and createdAt can never change)
const updateCourse = (id, body) => {
    getCourseById(id);
    const fields = pickCourseFields(body || {});
    if (fields.title !== undefined && !fields.title) throw new HttpError(400, "Course title cannot be empty");
    return courseModel.update(id, fields);
};

// Delete course — its enrollments (and the progress stored on them) and its
// stored content go with it, so nothing is left orphaned.
const deleteCourse = (id) => {
    const course = getCourseById(id);
    courseModel.remove(course.id);
    const removedEnrollments = enrollmentModel.removeWhere((e) => e.courseId === course.id);
    moduleModel.removeWhere((m) => String(m.id) === String(course.id));
    return { id: course.id, removedEnrollments };
};

module.exports = {
    getAllCourses,
    getCourseById,
    getCourseModule,
    createCourse,
    updateCourse,
    deleteCourse,
};
