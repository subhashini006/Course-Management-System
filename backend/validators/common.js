const { param } = require("express-validator");

// Reusable rule: a route parameter must be a valid MongoDB ObjectId
const mongoIdParam = (name = "id", label = "ID") =>
    param(name).isMongoId().withMessage(`Invalid ${label}`);

// Lower-cases and trims an email BEFORE it is validated and stored.
// (express-validator's normalizeEmail() is deliberately not used: it rewrites
// Gmail addresses — removes dots, strips "+tags" — so a user could register as
// "a.b@gmail.com", be stored as "ab@gmail.com", and then fail to log in.)
const cleanEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : value);

module.exports = { mongoIdParam, cleanEmail };
