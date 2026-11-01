const { body } = require("express-validator");
const config = require("../config");
const { cleanEmail, mongoIdParam } = require("./common");

const studentIdParam = mongoIdParam("id", "student ID");

const createStudentValidation = [
    body("name").isString().withMessage("Name is required").bail().trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name is too long"),
    body("email").isString().withMessage("Valid email is required").bail().customSanitizer(cleanEmail).isEmail().withMessage("Valid email is required"),
    body("password")
        .isString()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: config.PASSWORD_MIN, max: config.PASSWORD_MAX })
        .withMessage(`Password must be between ${config.PASSWORD_MIN} and ${config.PASSWORD_MAX} characters`),
    body("department").optional().isString().bail().trim().isLength({ max: 100 }).withMessage("Department is too long"),
];

// Every field is optional on update, but the ones that ARE sent must be valid
const updateStudentValidation = [
    body("name").optional().isString().withMessage("Invalid name").bail().trim().notEmpty().withMessage("Invalid name").isLength({ max: 100 }).withMessage("Name is too long"),
    body("email").optional().isString().withMessage("Invalid email").bail().customSanitizer(cleanEmail).isEmail().withMessage("Invalid email"),
    body("department").optional().isString().withMessage("Invalid department").bail().trim().isLength({ max: 100 }).withMessage("Department is too long"),
];

const updateProfileValidation = [
    body("name").isString().withMessage("Valid name is required").bail().trim().notEmpty().withMessage("Valid name is required").isLength({ max: 100 }).withMessage("Name is too long"),
    body("department").optional().isString().withMessage("Invalid department").bail().trim().isLength({ max: 100 }).withMessage("Department is too long"),
];

module.exports = { studentIdParam, createStudentValidation, updateStudentValidation, updateProfileValidation };
