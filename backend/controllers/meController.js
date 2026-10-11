const { getStudentEnrollments } = require("../services/enrollmentService");
const { getNotifications, markRead } = require("../services/notificationService");

// GET /api/v1/me/enrollments
const myEnrollments = (req, res) => {
    const list = getStudentEnrollments(req.session.id);
    res.status(200).json({ success: true, count: list.length, data: list });
};

// GET /api/v1/me/notifications
const myNotifications = (req, res) => {
    res.status(200).json({ success: true, data: getNotifications(req.session.id) });
};

// POST /api/v1/me/notifications/read   body: { ids: [...] } or { all: true }
const readNotifications = (req, res) => {
    markRead(req.session.id, req.body || {});
    res.status(200).json({ success: true, message: "Notifications marked as read" });
};

module.exports = { myEnrollments, myNotifications, readNotifications };
