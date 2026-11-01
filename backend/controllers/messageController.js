const Message = require("../models/Message");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");

// GET /api/v1/messages/contacts — people I can chat with (id, name and role only;
// emails are never shared with other users)
async function getContacts(req, res) {
    const users = await User.find({ _id: { $ne: req.user.sub } })
        .select("name role")
        .sort({ role: 1, name: 1 })
        .limit(200)
        .lean();
    res.json({ success: true, contacts: users.map((u) => ({ id: String(u._id), _id: String(u._id), name: u.name, role: u.role })) });
}

// GET /api/v1/messages/:userId — my conversation with one user (newest 100).
// Both sides of the query include MY id from the token, so nobody can read a
// conversation they are not part of.
async function getHistory(req, res) {
    const myId = req.user.sub;
    const otherId = req.params.userId;

    if (!(await User.exists({ _id: otherId }))) throw new HttpError(404, "User not found");

    const messages = await Message.find({
        $or: [
            { sender: myId, recipient: otherId },
            { sender: otherId, recipient: myId },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    res.json({
        success: true,
        messages: messages.reverse().map((m) => ({ ...m, id: String(m._id), sender: String(m.sender), recipient: String(m.recipient) })),
    });
}

module.exports = { getContacts, getHistory };
