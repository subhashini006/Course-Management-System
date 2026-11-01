const { body } = require("express-validator");
const config = require("../config");
const { cleanEmail } = require("./common");

const passwordRule = (field = "password") =>
    body(field)
        .isString()
        .withMessage("Password is required")
        .bail()
        .isLength({ min: config.PASSWORD_MIN, max: config.PASSWORD_MAX })
        .withMessage(`Password must be between ${config.PASSWORD_MIN} and ${config.PASSWORD_MAX} characters`);

const registerValidation = [
    body("name").isString().withMessage("Name is required").bail().trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name is too long"),
    body("email").isString().withMessage("Valid email is required").bail().customSanitizer(cleanEmail).isEmail().withMessage("Valid email is required").isLength({ max: 254 }),
    passwordRule(),
    body("department").optional().isString().withMessage("Department must be text").bail().trim().isLength({ max: 100 }).withMessage("Department is too long"),
];

const loginValidation = [
    body("email").isString().withMessage("Valid email is required").bail().customSanitizer(cleanEmail).isEmail().withMessage("Valid email is required"),
    body("password").isString().withMessage("Password is required").bail().notEmpty().withMessage("Password is required").isLength({ max: config.PASSWORD_MAX }).withMessage("Password is too long"),
];

const forgotPasswordValidation = [
    body("email").isString().withMessage("Please enter your email address.").bail().customSanitizer(cleanEmail).isEmail().withMessage("Please enter a valid email address."),
];

const resetPasswordValidation = [
    body("token").isString().withMessage("Reset token is required").bail().trim().notEmpty().withMessage("Reset token is required").isLength({ max: 200 }),
    passwordRule("password"),
];

module.exports = { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation };
