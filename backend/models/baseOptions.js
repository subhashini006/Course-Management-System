// Shared schema options. Every document is serialised with BOTH `_id` (what
// MongoDB stores) and `id` (a string copy that the React pages already use),
// and without the internal `__v` version key.
module.exports = {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
};
