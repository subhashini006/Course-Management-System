const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

// How far a student has got in one course. The counts are always worked out
// on the server from the course content, so they cannot be faked by the browser.
const learningProgressSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        // One true/false per unit of a "content" course, or the single flag of a "video" course
        units: { type: [Boolean], default: [] },
        video: { type: Boolean, default: false },
        completedLessons: { type: Number, default: 0, min: 0 },
        totalLessons: { type: Number, default: 0, min: 0 },
        progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    baseOptions
);

learningProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("LearningProgress", learningProgressSchema);
