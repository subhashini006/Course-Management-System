const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

// The learning content of one course (units to read, or a single video).
// One document per course; deleting the course deletes its module.
const moduleSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
        type: { type: String, enum: ["content", "video"], default: "content" },
        overview: { type: String, trim: true, maxlength: 4000, default: "" },
        topics: { type: [String], default: [] },
        videoSrc: { type: String, trim: true, maxlength: 1000 },
        units: [
            {
                _id: false,
                title: { type: String, trim: true, maxlength: 200 },
                icon: { type: String, trim: true, maxlength: 50 },
                paragraphs: { type: [String], default: [] },
                bullets: { type: [String], default: [] },
            },
        ],
    },
    baseOptions
);

module.exports = mongoose.model("CourseModule", moduleSchema, "modules");
