const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const studentModel = require("../models/studentModel");
const { getModule, computeProgress } = require("./moduleService");
const HttpError = require("../utils/HttpError");
const { str } = require("../utils/helpers");

// What the API returns for an enrollment: the stored record plus the live
// course title and a progress percentage worked out from the course content.
const shape = (en) => {
    const course = courseModel.findById(en.courseId);
    const mod = course ? getModule(course) : { type: "content", units: [] };
    const { units, video, percent } = computeProgress(mod, en.progress);
    return {
        ...en,
        courseName: course ? course.title : en.courseId,
        progress: { units, video },
        progressPercent: percent,
    };
};

const getEnrollmentOrFail = (id) => {
    const en = enrollmentModel.findById(id);
    if (!en) throw new HttpError(404, "Enrollment not found");
    return en;
};

// Only the owning student or an admin may change an enrollment
const assertCanTouch = (session, en) => {
    if (!session) throw new HttpError(401, "Please log in to continue.");
    const allowed = session.role === "admin" || (session.role === "student" && session.id === en.studentId);
    if (!allowed) throw new HttpError(403, "Not allowed.");
};

const getAllEnrollments = ({ courseId, email } = {}) => {
    let list = enrollmentModel.all();
    if (courseId) list = list.filter((e) => e.courseId === courseId);
    if (email) list = list.filter((e) => e.email.toLowerCase() === String(email).toLowerCase());
    return list.map(shape);
};

const getEnrollmentById = (id) => shape(getEnrollmentOrFail(id));

const getStudentEnrollments = (studentId) =>
    enrollmentModel.filter((e) => e.studentId === studentId).map(shape);

// Enroll the logged-in student in a course
const createEnrollment = (studentId, body) => {
    const student = studentModel.findById(studentId);
    const course = courseModel.findById(str(body.courseId));
    if (!course) throw new HttpError(404, "That course no longer exists.");

    const name = str(body.name) || student.name;
    const roll = str(body.roll);
    if (!roll) throw new HttpError(400, "Please fill in both your name and roll number.");

    if (enrollmentModel.findOne((e) => e.courseId === course.id && e.studentId === student.id)) {
        throw new HttpError(409, "You are already enrolled in this course.");
    }

    const enrollment = enrollmentModel.insert({
        id: enrollmentModel.nextId(),
        courseId: course.id,
        studentId: student.id,
        email: student.email,
        name,
        roll,
        status: "in-progress",
        date: new Date().toISOString(),
        progress: { units: [], video: false },
    });
    return shape(enrollment);
};

// Update progress (and name / roll). Completion is worked out here from the
// course content, so the status can't be faked from the browser.
const updateEnrollment = (id, body, session) => {
    const en = getEnrollmentOrFail(id);
    assertCanTouch(session, en);

    const changes = {};
    if (str(body.name)) changes.name = str(body.name);
    if (str(body.roll)) changes.roll = str(body.roll);

    const progress = { units: [], video: false, ...(en.progress || {}) };
    if (body.progress && typeof body.progress === "object") {
        if (Array.isArray(body.progress.units)) progress.units = body.progress.units.map((v) => v === true);
        if (typeof body.progress.video === "boolean") progress.video = body.progress.video;
    }
    changes.progress = progress;

    const course = courseModel.findById(en.courseId);
    const { percent } = computeProgress(course ? getModule(course) : { type: "content", units: [] }, progress);
    if (percent === 100) {
        changes.status = "completed";
        changes.completedDate = en.completedDate || new Date().toISOString();
    } else {
        changes.status = "in-progress";
        changes.completedDate = undefined; // removed from db.json when saved
    }

    return shape(enrollmentModel.update(id, changes));
};

const deleteEnrollment = (id, session) => {
    assertCanTouch(session, getEnrollmentOrFail(id));
    enrollmentModel.remove(id);
};

// Admin dashboard's "Clear All"
const clearEnrollments = () => enrollmentModel.removeWhere(() => true);

module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    getStudentEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    clearEnrollments,
};
