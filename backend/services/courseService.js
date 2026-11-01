const Course = require("../models/Course");
const CourseModule = require("../models/CourseModule");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const { getModule } = require("./moduleService");
const { safeNotifyAll } = require("./notificationService");
const HttpError = require("../utils/HttpError");
const runInTransaction = require("../utils/transaction");
const { str, slugify, withId, parsePagination } = require("../utils/helpers");

const TEXT_FIELDS = ["title", "description", "instructor", "duration", "hours", "rating", "topics", "outcome", "prereqs", "image"];

// Picks the editable course fields out of a request body
function pickCourseFields(body) {
    const out = {};
    TEXT_FIELDS.forEach((key) => {
        if (body[key] !== undefined) out[key] = str(body[key]);
    });
    if (body.level !== undefined) out.level = body.level;
    const label = body.sectionLabel !== undefined ? body.sectionLabel : body.category;
    if (label !== undefined) out.sectionLabel = str(label);
    if (body.section !== undefined) out.section = slugify(body.section, "other");
    if (Array.isArray(body.learn)) out.learn = body.learn.map(str).filter(Boolean);
    return out;
}

// GET /courses — everything by default (the catalog page needs it all);
// pass ?page= / ?limit= to page through it (limit is capped at 100).
async function listCourses(query) {
    const sort = { createdAt: 1, _id: 1 };
    const paged = query.page !== undefined || query.limit !== undefined;

    if (!paged) {
        const courses = await Course.find().sort(sort).limit(500).lean();
        return { courses: courses.map(withId) };
    }

    const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });
    const [courses, total] = await Promise.all([
        Course.find().sort(sort).skip(skip).limit(limit).lean(),
        Course.countDocuments(),
    ]);
    return { courses: courses.map(withId), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function findCourseOrFail(id) {
    const course = await Course.findById(id).lean();
    if (!course) throw new HttpError(404, "Course not found");
    return course;
}

const getCourseById = async (id) => withId(await findCourseOrFail(id));

// Learning content for a course
const getCourseModule = async (id) => getModule(await findCourseOrFail(id));

async function uniqueSlug(title) {
    const base = slugify(title);
    let slug = base;
    let n = 2;
    while (await Course.exists({ slug })) slug = `${base}-${n++}`;
    return slug;
}

// Create course (admin)
async function createCourse(body) {
    const fields = pickCourseFields(body);
    const slug = await uniqueSlug(fields.title);
    const sectionLabel = fields.sectionLabel || "Other";

    const course = await Course.create({
        ...fields,
        slug,
        sectionLabel,
        section: fields.section || slugify(sectionLabel, "other"),
        rating: fields.rating || "New",
        learn: fields.learn || (fields.outcome ? [fields.outcome] : []),
        image: fields.image || `https://picsum.photos/seed/${slug}/400/220`,
    });

    safeNotifyAll({
        title: `New Course Added: ${course.title}`,
        message:
            `A new ${course.level} course in ${course.sectionLabel}` +
            (course.instructor ? ` — taught by ${course.instructor}` : "") +
            ".",
        type: "course",
        icon: "circle-plus",
        link: "/courses",
    });

    return withId(course.toObject());
}

// Update course (admin). The id and createdAt can never change.
async function updateCourse(id, body) {
    const fields = pickCourseFields(body);
    if (Object.keys(fields).length === 0) throw new HttpError(400, "No valid fields supplied");

    const course = await Course.findByIdAndUpdate(id, { $set: fields }, { new: true, runValidators: true }).lean();
    if (!course) throw new HttpError(404, "Course not found");
    return withId(course);
}

// Delete course (admin) — its enrollments, progress records and stored content
// go with it in one transaction, so nothing is left orphaned.
async function deleteCourse(id) {
    return runInTransaction(async (session) => {
        const opts = { session };
        const course = await Course.findByIdAndDelete(id, opts);
        if (!course) throw new HttpError(404, "Course not found");

        const removed = await Enrollment.deleteMany({ course: course._id }, opts);
        await LearningProgress.deleteMany({ course: course._id }, opts);
        await CourseModule.deleteMany({ course: course._id }, opts);
        return { id: String(course._id), removedEnrollments: removed.deletedCount };
    });
}

module.exports = {
    listCourses,
    findCourseOrFail,
    getCourseById,
    getCourseModule,
    createCourse,
    updateCourse,
    deleteCourse,
};
