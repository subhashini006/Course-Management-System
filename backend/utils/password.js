const crypto = require("crypto");

// Passwords are hashed with scrypt (built into Node) and never stored in plain text.
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
    const [salt, hash] = String(stored || "").split(":");
    if (!salt || !hash) return false;
    const known = Buffer.from(hash, "hex");
    const test = crypto.scryptSync(String(password), salt, 64);
    return known.length === test.length && crypto.timingSafeEqual(known, test);
}

module.exports = { hashPassword, checkPassword };
