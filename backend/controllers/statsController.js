const { getStats } = require("../services/statsService");

// GET /api/v1/stats
const stats = (req, res) => {
    res.status(200).json({ success: true, data: getStats() });
};

module.exports = { stats };
