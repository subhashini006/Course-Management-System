const CourseModule = require("../models/CourseModule");
const HttpError = require("../utils/HttpError");

// GET /api/v1/modules/:courseId — the stored content of one course
async function getStoredModule(req, res) {
    const mod = await CourseModule.findOne({ course: req.params.id }).lean();
    if (!mod) throw new HttpError(404, "No stored content for that course");
    res.status(200).json({ success: true, data: mod });
}

module.exports = { getStoredModule };
