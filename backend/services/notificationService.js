const Notification = require("../models/Notification");
const User = require("../models/User");
const { getIO } = require("../config/socket"); // the socket server, once started

// Saves a notification in MongoDB and, if the recipient is online, pushes it
// to them instantly over Socket.IO ("new_notification"). A failure to push
// never breaks the request that triggered it — the notification is saved anyway.
async function notify(recipientId, { title = "", message, type = "system", icon = "bell", link = "" }) {
    const notification = await Notification.create({ recipient: recipientId, title, message, type, icon, link });
    pushToUser(recipientId, "new_notification", notification.toJSON());
    return notification;
}

// One notification for every student (e.g. "New course added")
async function notifyAllStudents(payload) {
    const students = await User.find({ role: "student" }).select("_id").lean();
    if (!students.length) return 0;
    const docs = await Notification.insertMany(
        students.map((s) => ({ recipient: s._id, ...payload })),
        { ordered: false }
    );
    docs.forEach((doc) => pushToUser(doc.recipient, "new_notification", doc.toJSON()));
    return docs.length;
}

function pushToUser(userId, event, payload) {
    const io = getIO();
    if (io) io.to(`user:${userId}`).emit(event, payload);
}

// Fire-and-forget wrapper: notification problems are logged, not thrown
const safeNotify = (...args) =>
    notify(...args).catch((error) => console.error("Could not create notification:", error.message));
const safeNotifyAll = (...args) =>
    notifyAllStudents(...args).catch((error) => console.error("Could not create notifications:", error.message));

module.exports = { notify, notifyAllStudents, safeNotify, safeNotifyAll, pushToUser };
