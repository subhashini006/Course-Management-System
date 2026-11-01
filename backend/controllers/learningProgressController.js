const service = require("../services/enrollmentService");

// GET /api/v1/learning-progress — my progress in every course I'm enrolled in
async function getMyProgressList(req, res) {
    const progress = await service.getMyProgressList(req.user.id);
    res.json({ success: true, count: progress.length, progress });
}

// GET /api/v1/learning-progress/:courseId
async function getMyProgress(req, res) {
    res.json({ success: true, progress: await service.getMyProgress(req.user.id, req.params.courseId) });
}

// PUT /api/v1/learning-progress/:courseId   body: { units: [true,false,...] } or { video: true }
async function updateMyProgress(req, res) {
    const progress = await service.updateMyProgress(req.user.id, req.params.courseId, req.body || {});
    res.json({ success: true, message: "Progress updated", progress });
}

module.exports = { getMyProgressList, getMyProgress, updateMyProgress };
