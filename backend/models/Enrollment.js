const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

const enrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        // "withdrawn" keeps the history instead of deleting the record (Task 11.3)
        status: { type: String, enum: ["active", "completed", "withdrawn"], default: "active" },
        enrolledAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        // Details the student types into the enrol form (already part of this project)
        name: { type: String, trim: true, maxlength: 100 },
        roll: { type: String, trim: true, maxlength: 50 },
    },
    baseOptions
);

// A student can be enrolled in a course only once (re-enrolling reactivates the old record)
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
