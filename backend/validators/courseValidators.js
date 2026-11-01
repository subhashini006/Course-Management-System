const { body } = require("express-validator");
const { mongoIdParam } = require("./common");
const Course = require("../models/Course");

const courseIdParam = mongoIdParam("id", "course ID");

const text = (field, max, label) =>
    body(field).optional().isString().withMessage(`${label} must be text`).bail().trim().isLength({ max }).withMessage(`${label} is too long (max ${max})`);

const optionalFields = [
    text("description", 2000, "Description"),
    text("hours", 50, "Hours"),
    text("rating", 10, "Rating"),
    text("topics", 1000, "Topics"),
    text("outcome", 1000, "Outcome"),
    text("prereqs", 1000, "Prerequisites"),
    text("image", 500, "Image"),
    text("section", 60, "Section"),
    body("level").optional().isIn(Course.LEVELS).withMessage(`Level must be one of: ${Course.LEVELS.join(", ")}`),
    body("learn").optional().isArray({ max: 30 }).withMessage("'learn' must be a list"),
    body("learn.*").optional().isString().withMessage("Each 'learn' item must be text").bail().isLength({ max: 300 }).withMessage("A 'learn' item is too long"),
];

// The course form calls the category "category"; the database calls it "sectionLabel"
const categoryRule = (required) => {
    const rule = body("sectionLabel").custom((value, { req }) => {
        const label = value !== undefined ? value : req.body.category;
        if (label === undefined) return !required || Promise.reject(new Error("Category is required"));
        if (typeof label !== "string" || !label.trim()) throw new Error("Category is required");
        if (label.trim().length > 100) throw new Error("Category is too long (max 100)");
        return true;
    });
    return rule;
};

const required = (field, max, label) =>
    body(field).isString().withMessage(`${label} is required`).bail().trim().notEmpty().withMessage(`${label} is required`).isLength({ max }).withMessage(`${label} is too long (max ${max})`);
const optionalNonEmpty = (field, max, label) =>
    body(field).optional().isString().withMessage(`${label} must be text`).bail().trim().notEmpty().withMessage(`${label} cannot be empty`).isLength({ max }).withMessage(`${label} is too long (max ${max})`);

const createCourseValidation = [
    required("title", 150, "Course title"),
    required("instructor", 100, "Instructor"),
    required("duration", 50, "Duration"),
    categoryRule(true),
    ...optionalFields,
];

const updateCourseValidation = [
    optionalNonEmpty("title", 150, "Course title"),
    optionalNonEmpty("instructor", 100, "Instructor"),
    optionalNonEmpty("duration", 50, "Duration"),
    categoryRule(false),
    ...optionalFields,
];

module.exports = { courseIdParam, createCourseValidation, updateCourseValidation };
