const { readDB } = require("../models/db");

const getStats = () => {
    const db = readDB();
    const stats = {};
    Object.keys(db).forEach((name) => {
        stats[name] = db[name].length;
    });
    stats.completedEnrollments = db.enrollments.filter((e) => e.status === "completed").length;
    return stats;
};

module.exports = { getStats };
