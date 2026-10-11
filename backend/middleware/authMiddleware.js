const { readSession } = require("../utils/session");
const studentModel = require("../models/studentModel");
const HttpError = require("../utils/HttpError");

// Runs on every request: reads the login cookie into req.session
// ({ role: "student", id } or { role: "admin" }, or null when logged out).
const attachSession = (req, res, next) => {
    req.session = readSession(req);
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session || req.session.role !== "admin") {
        return next(new HttpError(401, "Admin login required."));
    }
    next();
};

const requireStudent = (req, res, next) => {
    if (!req.session || req.session.role !== "student") {
        return next(new HttpError(401, "Please log in to continue."));
    }
    if (!studentModel.findById(req.session.id)) {
        return next(new HttpError(401, "This account no longer exists. Please log in again."));
    }
    next();
};

module.exports = { attachSession, requireAdmin, requireStudent };
