const crypto = require("crypto");
const config = require("../config");
const studentModel = require("../models/studentModel");
const HttpError = require("../utils/HttpError");
const { str, sha256, safeEqual } = require("../utils/helpers");
const { hashPassword, checkPassword } = require("../utils/password");

// Who is the current session? (always succeeds; role is null when logged out)
const getCurrentUser = (session) => {
    if (session && session.role === "admin") return { role: "admin", student: null };
    if (session && session.role === "student") {
        const student = studentModel.findById(session.id);
        if (student) return { role: "student", student: studentModel.toPublic(student) };
    }
    return { role: null, student: null };
};

const loginStudent = (email, password) => {
    const e = str(email).toLowerCase();
    const p = str(password);
    if (!e || !p) throw new HttpError(400, "Please enter your email and password.");

    const student = studentModel.findByEmail(e);
    if (!student || !checkPassword(p, student.passwordHash)) {
        throw new HttpError(401, "Invalid email or password.");
    }
    return student;
};

const checkAdminLogin = (email, password) => {
    const ok =
        safeEqual(str(email).toLowerCase(), config.ADMIN_EMAIL.toLowerCase()) &&
        safeEqual(String(password || ""), config.ADMIN_PASSWORD);
    if (!ok) throw new HttpError(401, "Invalid credentials. Please try again.");
};

// No email service is wired up, so the reset link is printed in the backend
// terminal (and returned to the app outside production) instead of mailed.
const forgotPassword = (email) => {
    const e = str(email).toLowerCase();
    if (!e) throw new HttpError(400, "Please enter your email address.");

    const result = { message: "If an account exists for that email, a password reset link has been generated." };
    const student = studentModel.findByEmail(e);
    if (student) {
        const token = crypto.randomBytes(24).toString("hex");
        studentModel.update(student.id, {
            resetTokenHash: sha256(token),
            resetExpires: Date.now() + config.RESET_MS,
        });
        const link = `${config.FRONTEND_URL}/reset-password?token=${token}`;
        console.log(`\n  Password reset link for ${student.email}:\n  ${link}\n`);
        if (config.NODE_ENV !== "production") result.resetLink = link;
    }
    return result;
};

const resetPassword = (token, password) => {
    const t = str(token);
    const p = String(password || "");
    if (p.length < 6) throw new HttpError(400, "Password must be at least 6 characters.");

    const student = t && studentModel.findOne((s) => s.resetTokenHash === sha256(t));
    if (!student || !student.resetExpires || student.resetExpires < Date.now()) {
        throw new HttpError(400, "This reset link is invalid or has expired.");
    }
    studentModel.update(student.id, {
        passwordHash: hashPassword(p),
        resetTokenHash: undefined, // removed from db.json when saved
        resetExpires: undefined,
    });
};

module.exports = { getCurrentUser, loginStudent, checkAdminLogin, forgotPassword, resetPassword };
