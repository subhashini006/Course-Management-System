const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const { sha256 } = require("../utils/helpers");
const { hashPassword, verifyPassword, DUMMY_HASH } = require("../utils/passwordHash");
const { safeNotify } = require("./notificationService");

// What the API may show about a user — never the password hash or reset token
const publicUser = (user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || "",
    createdAt: user.createdAt,
});

// Task 9.4 — registration ALWAYS creates a student; nobody can make
// themselves an admin through this route.
async function registerStudent({ name, email, password, department }) {
    if (await User.exists({ email })) throw new HttpError(409, "Email already registered");

    const user = await User.create({
        name,
        email,
        password: await hashPassword(password),
        role: "student",
        department: department || "",
    });

    safeNotify(user._id, {
        title: "Welcome to StudyVerse!",
        message: "Browse the course catalog and enroll to start tracking your learning journey here.",
        type: "system",
        icon: "hand-sparkles",
        link: "/courses",
    });

    return publicUser(user);
}

// Task 10.2 — checks email + password and answers with the user. The same
// message is used for "no such email" and "wrong password" so the API does not
// reveal which emails are registered.
async function authenticate(email, password, { requireRole } = {}) {
    const user = await User.findOne({ email }).select("+password");
    const valid = await verifyPassword(password, user ? user.password : DUMMY_HASH);
    if (!user || !valid || (requireRole && user.role !== requireRole)) {
        throw new HttpError(401, "Invalid credentials");
    }
    return user;
}

// The secret never goes inside the token, and a JWT is signed, not encrypted,
// so only non-sensitive facts (email, role) are put in it.
function issueToken(user) {
    if (!config.JWT_SECRET) throw new Error("JWT_SECRET is missing");
    return {
        token: jwt.sign({ email: user.email, role: user.role }, config.JWT_SECRET, {
            subject: String(user._id),
            expiresIn: config.JWT_EXPIRES_IN,
            algorithm: "HS256",
        }),
        tokenType: "Bearer",
        expiresIn: config.JWT_EXPIRES_IN,
    };
}

// No email service is wired up, so the reset link is printed in the backend
// terminal (and returned to the app outside production) instead of mailed.
async function forgotPassword(email) {
    const result = { message: "If an account exists for that email, a password reset link has been generated." };
    const user = await User.findOne({ email });
    if (user) {
        const token = crypto.randomBytes(24).toString("hex");
        user.resetTokenHash = sha256(token);
        user.resetExpires = new Date(Date.now() + config.RESET_MS);
        await user.save();
        const link = `${config.CLIENT_URL}/reset-password?token=${token}`;
        console.log(`\n  Password reset link for ${user.email}:\n  ${link}\n`);
        if (!config.IS_PRODUCTION) result.resetLink = link;
    }
    return result;
}

async function resetPassword(token, password) {
    const user = await User.findOne({ resetTokenHash: sha256(token), resetExpires: { $gt: new Date() } }).select(
        "+resetTokenHash +resetExpires"
    );
    if (!user) throw new HttpError(400, "This reset link is invalid or has expired.");

    user.password = await hashPassword(password);
    user.resetTokenHash = undefined;
    user.resetExpires = undefined;
    await user.save();
}

module.exports = { publicUser, registerStudent, authenticate, issueToken, forgotPassword, resetPassword };
