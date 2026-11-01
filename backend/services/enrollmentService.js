const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const { getModulesFor, getModule, computeProgress } = require("./moduleService");
const { safeNotify } = require("./notificationService");
const HttpError = require("../utils/HttpError");
const { str, parsePagination } = require("../utils/helpers");

// ---------------------------------------------------------------------------
// Shaping: the stored enrollment + the live course title + the student's
// learning progress, in the form the React pages already expect.
// ---------------------------------------------------------------------------
async function toDTOs(enrollments) {
    if (!enrollments.length) return [];

    const courseIds = [...new Set(enrollments.map((e) => String(e.course._id || e.course)))];
    const studentIds = [...new Set(enrollments.map((e) => String(e.student._id || e.student)))];

    const [courses, progressDocs] = await Promise.all([
        Course.find({ _id: { $in: courseIds } }).lean(),
        LearningProgress.find({ course: { $in: courseIds }, student: { $in: studentIds } }).lean(),
    ]);
    const modules = await getModulesFor(courses);
    const courseById = new Map(courses.map((c) => [String(c._id), c]));
    const progressByKey = new Map(progressDocs.map((p) => [`${p.student}:${p.course}`, p]));

    return enrollments.map((en) => {
        const courseId = String(en.course._id || en.course);
        const studentId = String(en.student._id || en.student);
        const course = courseById.get(courseId);
        const mod = course ? modules.get(courseId) : { type: "content", units: [] };
        const { units, video, completedLessons, totalLessons, percent } = computeProgress(
            mod,
            progressByKey.get(`${studentId}:${courseId}`)
        );
        return {
            id: String(en._id),
            _id: String(en._id),
            courseId,
            studentId,
            email: en.student.email || "",
            name: en.name,
            roll: en.roll,
            status: en.status,
            date: en.enrolledAt,
            completedDate: en.completedAt || undefined,
            courseName: course ? course.title : courseId,
            progress: { units, video },
            progressPercent: percent,
            completedLessons,
            totalLessons,
        };
    });
}

const loadForDTO = (filter) => Enrollment.find(filter).populate("student", "email").sort({ enrolledAt: 1, _id: 1 });

// Only the owning student or an admin may change an enrollment
function assertCanTouch(user, enrollment) {
    const allowed = user.role === "admin" || String(enrollment.student) === String(user.id);
    if (!allowed) throw new HttpError(403, "Not allowed.");
}

async function getEnrollmentOrFail(id) {
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) throw new HttpError(404, "Enrollment not found");
    return enrollment;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

// Admin: every enrollment (withdrawn ones are hidden unless asked for)
async function getAllEnrollments(query = {}) {
    const filter = {};
    if (query.courseId) {
        if (!mongoose.isValidObjectId(query.courseId)) throw new HttpError(400, "Invalid course ID");
        filter.course = query.courseId;
    }
    if (query.email) {
        const user = await User.findOne({ email: str(query.email).toLowerCase() }).select("_id").lean();
        if (!user) return { enrollments: [], total: 0 };
        filter.student = user._id;
    }
    if (query.status === "withdrawn" || query.status === "all") {
        if (query.status === "withdrawn") filter.status = "withdrawn";
    } else {
        filter.status = { $ne: "withdrawn" };
    }

    const { limit, skip } = parsePagination(query, { defaultLimit: 500, maxLimit: 500 });
    const [list, total] = await Promise.all([
        loadForDTO(filter).skip(skip).limit(limit).lean(),
        Enrollment.countDocuments(filter),
    ]);
    return { enrollments: await toDTOs(list), total };
}

async function getEnrollmentById(id, user) {
    const enrollment = await Enrollment.findById(id).populate("student", "email").lean();
    if (!enrollment) throw new HttpError(404, "Enrollment not found");
    assertCanTouch(user, { student: enrollment.student._id });
    return (await toDTOs([enrollment]))[0];
}

// A student's own enrollments (withdrawn ones hidden unless asked for)
async function getStudentEnrollments(studentId, { includeWithdrawn = false } = {}) {
    const filter = { student: studentId };
    if (!includeWithdrawn) filter.status = { $ne: "withdrawn" };
    return toDTOs(await loadForDTO(filter).lean());
}

// ---------------------------------------------------------------------------
// Enrol / withdraw
// ---------------------------------------------------------------------------

// Enrol the logged-in student in a course. If they enrolled before and
// withdrew, the old record is reactivated (the unique index forbids a second one).
async function createEnrollment(student, body) {
    const course = await Course.findById(body.courseId).lean();
    if (!course) throw new HttpError(404, "That course no longer exists.");

    const roll = str(body.roll);
    if (!roll) throw new HttpError(400, "Please fill in both your name and roll number.");
    const name = str(body.name) || student.name;

    let enrollment = await Enrollment.findOne({ student: student.id, course: course._id });
    if (enrollment && enrollment.status !== "withdrawn") {
        throw new HttpError(409, "You are already enrolled in this course.");
    }

    try {
        if (enrollment) {
            // Re-enrolment: keep the learning progress that was already earned
            const saved = await LearningProgress.findOne({ student: student.id, course: course._id }).lean();
            enrollment.status = saved && saved.progressPercentage === 100 ? "completed" : "active";
            enrollment.enrolledAt = new Date();
            enrollment.name = name;
            enrollment.roll = roll;
            await enrollment.save();
        } else {
            enrollment = await Enrollment.create({ student: student.id, course: course._id, name, roll });
            await LearningProgress.findOneAndUpdate(
                { student: student.id, course: course._id },
                { $setOnInsert: { units: [], video: false, completedLessons: 0, totalLessons: 0, progressPercentage: 0 } },
                { upsert: true }
            );
        }
    } catch (error) {
        // Two clicks at once: the unique index stops the second record
        if (error.code === 11000) throw new HttpError(409, "You are already enrolled in this course.");
        throw error;
    }

    safeNotify(student.id, {
        title: `Enrolled in ${course.title}`,
        message: "You successfully enrolled in this course. Jump back in whenever you're ready.",
        type: "enrollment",
        icon: "graduation-cap",
        link: `/course?course=${course._id}`,
    });

    return getEnrollmentById(enrollment._id, student);
}

// Unenrol = mark as "withdrawn" (history and progress are kept)
async function withdrawEnrollment(id, user) {
    const enrollment = await getEnrollmentOrFail(id);
    assertCanTouch(user, enrollment);
    if (enrollment.status !== "withdrawn") {
        enrollment.status = "withdrawn";
        await enrollment.save();
    }
    return getEnrollmentById(id, user);
}

// Admin dashboard's "Clear All" — a hard delete of every enrollment and its progress
async function clearEnrollments() {
    const removed = await Enrollment.deleteMany({});
    await LearningProgress.deleteMany({});
    return removed.deletedCount;
}

// ---------------------------------------------------------------------------
// Learning progress
// ---------------------------------------------------------------------------

// Saves the ticked units / watched video for one student + course, works out the
// totals on the server and keeps the enrollment status in step (a course is
// "completed" only when the server says it is 100% done).
async function saveProgress(enrollment, { units, video }) {
    const course = await Course.findById(enrollment.course).lean();
    if (!course) throw new HttpError(404, "That course no longer exists.");
    if (enrollment.status === "withdrawn") {
        throw new HttpError(409, "You have withdrawn from this course. Enrol again to continue.");
    }

    const mod = await getModule(course);
    const existing = await LearningProgress.findOne({ student: enrollment.student, course: enrollment.course }).lean();
    const merged = {
        units: Array.isArray(units) ? units : existing ? existing.units : [],
        video: typeof video === "boolean" ? video : existing ? existing.video : false,
    };
    const calc = computeProgress(mod, merged);

    const progress = await LearningProgress.findOneAndUpdate(
        { student: enrollment.student, course: enrollment.course },
        {
            $set: {
                units: calc.units,
                video: calc.video,
                completedLessons: calc.completedLessons,
                totalLessons: calc.totalLessons,
                progressPercentage: calc.percent,
            },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    if (calc.percent === 100 && enrollment.status !== "completed") {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();
        await enrollment.save();
        safeNotify(enrollment.student, {
            title: `Course Completed: ${course.title}`,
            message: "Great work! Your certificate is ready to view and download.",
            type: "certificate",
            icon: "trophy",
            link: `/certificate?course=${course._id}`,
        });
    } else if (calc.percent < 100 && enrollment.status === "completed") {
        enrollment.status = "active";
        enrollment.completedAt = undefined;
        await enrollment.save();
    }

    return progress;
}

// PATCH /enrollments/:id — progress (and name / roll) from the course page
async function updateEnrollment(id, body, user) {
    const enrollment = await getEnrollmentOrFail(id);
    assertCanTouch(user, enrollment);

    if (str(body.name)) enrollment.name = str(body.name).slice(0, 100);
    if (str(body.roll)) enrollment.roll = str(body.roll).slice(0, 50);

    const p = body.progress && typeof body.progress === "object" ? body.progress : {};
    if (p.units !== undefined && (!Array.isArray(p.units) || p.units.length > 100)) {
        throw new HttpError(400, "progress.units must be a list of true/false values");
    }
    if (p.video !== undefined && typeof p.video !== "boolean") {
        throw new HttpError(400, "progress.video must be true or false");
    }

    await enrollment.save(); // name / roll changes (no-op when nothing changed)
    await saveProgress(enrollment, {
        units: p.units ? p.units.map((v) => v === true) : undefined,
        video: p.video,
    });
    return getEnrollmentById(id, user);
}

// ---- Task 13/15 "learning progress" endpoints (by course id) ----

const progressDTO = (dto) => ({
    courseId: dto.courseId,
    courseName: dto.courseName,
    status: dto.status,
    units: dto.progress.units,
    video: dto.progress.video,
    completedLessons: dto.completedLessons,
    totalLessons: dto.totalLessons,
    progressPercentage: dto.progressPercent,
});

async function getMyProgressList(studentId) {
    return (await getStudentEnrollments(studentId)).map(progressDTO);
}

async function findMyEnrollmentForCourse(studentId, courseId) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment || enrollment.status === "withdrawn") throw new HttpError(404, "You are not enrolled in this course");
    return enrollment;
}

async function getMyProgress(studentId, courseId) {
    const enrollment = await findMyEnrollmentForCourse(studentId, courseId);
    return progressDTO(await getEnrollmentById(enrollment._id, { id: studentId, role: "student" }));
}

async function updateMyProgress(studentId, courseId, body) {
    const enrollment = await findMyEnrollmentForCourse(studentId, courseId);
    return progressDTO(await updateEnrollment(enrollment._id, { progress: body }, { id: studentId, role: "student" }));
}

module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    getStudentEnrollments,
    createEnrollment,
    updateEnrollment,
    withdrawEnrollment,
    clearEnrollments,
    getMyProgressList,
    getMyProgress,
    updateMyProgress,
};
