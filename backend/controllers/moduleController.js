const moduleModel = require("../models/moduleModel");
const HttpError = require("../utils/HttpError");

// GET /api/v1/modules — raw stored course content, keyed by course id
const getModules = (req, res) => {
    const modules = moduleModel.all();
    res.status(200).json({ success: true, count: modules.length, data: modules });
};

// GET /api/v1/modules/:id
const getStoredModule = (req, res) => {
    const mod = moduleModel.findById(req.params.id);
    if (!mod) throw new HttpError(404, "No stored content for that course");
    res.status(200).json({ success: true, data: mod });
};

module.exports = { getModules, getStoredModule };
