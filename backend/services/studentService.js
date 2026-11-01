const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const HttpError = require("../utils/HttpError");
const runInTransaction = require("../utils/transaction");
const { hashPassword } = require("../utils/passwordHash");
const { parsePagination } = require("../utils/helpers");

const PUBLIC_FIELDS = "name email role department createdAt updatedAt";
const toStudent = (doc) => ({ ...doc, id: String(doc._id) });

async function listStudents(query) {
    const { page, limit, skip } = parsePagination(query, { defaultLimit: 50, maxLimit: 100 });
    const filter = { role: "student" };
    const [students, total] = await Promise.all([
        User.find(filter).select(PUBLIC_FIELDS).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
    ]);
    return { students: students.map(toStudent), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getStudent(id) {
    const student = await User.findOne({ _id: id, role: "student" }).select(PUBLIC_FIELDS).lean();
    if (!student) throw new HttpError(404, "Student not found");
    return toStudent(student);
}

async function createStudent({ name, email, password, department }) {
    if (await User.exists({ email })) throw new HttpError(409, "Email already registered");
    const student = await User.create({
        name,
        email,
        password: await hashPassword(password),
        role: "student",
        department: department || "",
    });
    return toStudent(student.toObject());
}

async function updateStudent(id, body) {
    const updates = {};
    ["name", "email", "department"].forEach((key) => {
        if (body[key] !== undefined) updates[key] = body[key];
    });
    if (Object.keys(updates).length === 0) throw new HttpError(400, "No valid fields supplied");

    const student = await User.findOneAndUpdate({ _id: id, role: "student" }, { $set: updates }, { new: true, runValidators: true })
        .select(PUBLIC_FIELDS)
        .lean();
    if (!student) throw new HttpError(404, "Student not found");
    return toStudent(student);
}

// Deleting a student also removes everything that belongs to them, in one
// transaction, so no enrolment / progress / notification / chat message is
// left pointing at a user that no longer exists.
async function deleteStudent(id) {
    return runInTransaction(async (session) => {
        const opts = { session };
        const student = await User.findOneAndDelete({ _id: id, role: "student" }, opts);
        if (!student) throw new HttpError(404, "Student not found");

        await Promise.all([
            Enrollment.deleteMany({ student: id }, opts),
            LearningProgress.deleteMany({ student: id }, opts),
            Notification.deleteMany({ recipient: id }, opts),
            Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] }, opts),
        ]);
        return { id: String(id) };
    });
}

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent, PUBLIC_FIELDS };
