const bcrypt = require("bcryptjs");
const config = require("../config");

// The ONE place passwords are hashed and checked (Task 14.3). Registration,
// admin-created students, password reset and the createAdmin script all use
// these two functions, so every account has the same kind of hash.
const hashPassword = (plain) => bcrypt.hash(plain, config.BCRYPT_ROUNDS);
const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Stops timing attacks that reveal "this email exists": when no user was found
// we still run one bcrypt comparison against this throw-away hash.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", config.BCRYPT_ROUNDS);

module.exports = { hashPassword, verifyPassword, DUMMY_HASH };
