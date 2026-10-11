const studentModel = require("../models/studentModel");
const HttpError = require("../utils/HttpError");
const { str } = require("../utils/helpers");
const { hashPassword } = require("../utils/password");

const getAllStudents = () => studentModel.all().map(studentModel.toPublic);

const getStudentById = (id) => {
    const student = studentModel.findById(id);
    if (!student) throw new HttpError(404, "Student not found");
    return studentModel.toPublic(student);
};

// Registration (required fields are already checked by studentValidation)
const registerStudent = (body) => {
    const email = str(body.email).toLowerCase();
    const username = str(body.username);

    if (studentModel.findByEmail(email)) throw new HttpError(409, "An account with this email already exists.");
    if (studentModel.findByUsername(username)) throw new HttpError(409, "That username is already taken.");

    const student = studentModel.insert({
        id: studentModel.nextId(),
        username,
        name: str(body.name),
        email,
        department: str(body.department),
        passwordHash: hashPassword(String(body.password)),
        notificationsRead: [],
        createdAt: new Date().toISOString(),
    });
    return studentModel.toPublic(student);
};

module.exports = { getAllStudents, getStudentById, registerStudent };
