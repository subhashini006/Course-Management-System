const validateCourse = (req, res, next) => {
    const { title, instructor, duration, sectionLabel, category } = req.body || {};

    if (!title || !String(title).trim()) {
        return res.status(400).json({
            success: false,
            message: "Course title is required",
        });
    }

    if (!instructor || !String(instructor).trim()) {
        return res.status(400).json({
            success: false,
            message: "Instructor is required",
        });
    }

    if (!duration || !String(duration).trim()) {
        return res.status(400).json({
            success: false,
            message: "Duration is required",
        });
    }

    if (!(sectionLabel || category) || !String(sectionLabel || category).trim()) {
        return res.status(400).json({
            success: false,
            message: "Category is required",
        });
    }

    next();
};

module.exports = validateCourse;
