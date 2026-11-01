const Notification = require("../models/Notification");
const HttpError = require("../utils/HttpError");

// GET /api/v1/notifications — my 50 newest notifications
async function getNotifications(req, res) {
    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ recipient: req.user.sub }).sort({ createdAt: -1 }).limit(50),
        Notification.countDocuments({ recipient: req.user.sub, isRead: false }),
    ]);
    res.json({ success: true, unreadCount, notifications });
}

// PATCH /api/v1/notifications/:id/read — only MY notification can be marked
async function markRead(req, res) {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.sub },
        { $set: { isRead: true } },
        { new: true }
    );
    if (!notification) throw new HttpError(404, "Notification not found");
    res.json({ success: true, notification });
}

// PATCH /api/v1/notifications/read-all
async function markAllRead(req, res) {
    const result = await Notification.updateMany({ recipient: req.user.sub, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true, message: "Notifications marked as read", modified: result.modifiedCount });
}

module.exports = { getNotifications, markRead, markAllRead };
