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

function sha256(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

// Escape user text before it goes into a RegExp
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Read ?page= and ?limit= safely. Both are capped so nobody can ask for
// the whole collection (or a negative page) in one request.
function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}

// Lean documents (plain objects) have no `id` virtual, so add it by hand
const withId = (doc) => (doc ? { ...doc, id: String(doc._id) } : doc);

module.exports = { str, slugify, sha256, escapeRegex, parsePagination, withId };
