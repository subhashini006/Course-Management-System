const { getStats } = require("../services/statsService");

// GET /api/v1/stats   (admin)
async function stats(req, res) {
    res.status(200).json({ success: true, data: await getStats() });
}

module.exports = { stats };
