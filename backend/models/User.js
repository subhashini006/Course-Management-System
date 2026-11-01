const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

// One model for everybody who can log in: students AND admins (Task 9).
// Passwords are stored as bcrypt hashes only (hashed in the controllers /
// services with the single helper in utils/passwordHash.js).
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true, // creates the unique index (Task 14.7 — don't declare it twice)
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        password: {
            type: String,
            required: true,
            select: false, // never returned unless a query asks for "+password"
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        // Extra field this project already collects at registration
        department: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        // Password-reset flow: only a SHA-256 of the emailed token is stored
        resetTokenHash: { type: String, select: false },
        resetExpires: { type: Date, select: false },
    },
    {
        ...baseOptions,
        toJSON: {
            ...baseOptions.toJSON,
            // Belt and braces: even if a query selected them, never serialise secrets
            transform(doc, ret) {
                delete ret.password;
                delete ret.resetTokenHash;
                delete ret.resetExpires;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model("User", userSchema);
