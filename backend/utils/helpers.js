const crypto = require("crypto");

// Any value -> trimmed string ("" for null / undefined)
function str(value) {
    return value === undefined || value === null ? "" : String(value).trim();
}

// "Cloud Computing" -> "cloud-computing"
function slugify(text, fallback = "course") {
    return (
        str(text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || fallback
    );
}

// Adds -2, -3 ... until the id is not in `existing` (a Set)
function uniqueId(base, existing) {
    if (!existing.has(base)) return base;
    let n = 2;
    while (existing.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
}

function sha256(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

// Constant-time string comparison
function safeEqual(a, b) {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { str, slugify, uniqueId, sha256, safeEqual };
