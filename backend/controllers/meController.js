const { getStudentEnrollments } = require("../services/enrollmentService");

// GET /api/v1/me/enrollments
async function myEnrollments(req, res) {
    const list = await getStudentEnrollments(req.user.id, { includeWithdrawn: req.query.includeWithdrawn === "true" });
    res.status(200).json({ success: true, count: list.length, data: list });
}

module.exports = { myEnrollments };
