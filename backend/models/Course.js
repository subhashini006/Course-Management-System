const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        // Short, URL-friendly name ("cloud-computing"). Unique; created from the title.
        slug: { type: String, trim: true, lowercase: true, maxlength: 160, unique: true, sparse: true },
        description: { type: String, required: true, trim: true, maxlength: 2000 },
        // Stored as text exactly as shown in the UI, e.g. "8 Weeks".
        // (The Task 9 example uses a number; this project's forms and seed data use text.)
        duration: { type: String, required: true, trim: true, maxlength: 50 },

        // ---- fields this project already used (preserved) ----
        section: { type: String, trim: true, lowercase: true, maxlength: 60, default: "other", index: true },
        sectionLabel: { type: String, trim: true, maxlength: 100, default: "Other" },
        level: { type: String, enum: LEVELS, default: "Beginner" },
        hours: { type: String, trim: true, maxlength: 50, default: "" },
        rating: { type: String, trim: true, maxlength: 10, default: "New" },
        instructor: { type: String, required: true, trim: true, maxlength: 100 },
        topics: { type: String, trim: true, maxlength: 1000, default: "" },
        outcome: { type: String, trim: true, maxlength: 1000, default: "" },
        prereqs: { type: String, trim: true, maxlength: 1000, default: "" },
        learn: { type: [String], default: [] },
        image: { type: String, trim: true, maxlength: 500, default: "" },
    },
    baseOptions
);

// The course form has no separate "description" box, so fall back to the outcome
courseSchema.pre("validate", function () {
    if (!this.description) this.description = this.outcome || this.title;
});

const Course = mongoose.model("Course", courseSchema);
Course.LEVELS = LEVELS;
module.exports = Course;
