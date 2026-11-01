const User = require("../models/User");
const HttpError = require("../utils/HttpError");

const PUBLIC = "name email role department createdAt";

// GET /api/v1/profile — the logged-in user's own profile
async function getProfile(req, res) {
    const user = await User.findById(req.user.sub).select(PUBLIC);
    if (!user) throw new HttpError(404, "Profile not found");
    res.json({ success: true, user });
}

// PUT /api/v1/profile — a user can change their OWN name / department only.
// The id comes from the verified token, never from the request body, so nobody
// can edit another person's profile (and email / role can never be changed here).
async function updateProfile(req, res) {
    const updates = { name: req.body.name };
    if (req.body.department !== undefined) updates.department = req.body.department;

    const user = await User.findByIdAndUpdate(req.user.sub, { $set: updates }, { new: true, runValidators: true }).select(PUBLIC);
    if (!user) throw new HttpError(404, "Profile not found");
    res.json({ success: true, message: "Profile updated", user });
}

module.exports = { getProfile, updateProfile };
