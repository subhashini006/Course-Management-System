const mongoose = require("mongoose");

// Runs `work(session)` as one all-or-nothing MongoDB transaction (Atlas and any
// replica set support this). A plain standalone local mongod does NOT support
// transactions; there the work simply runs step by step with no session, so
// development still works. Pass `{ session }` to every query inside `work`.
async function runInTransaction(work) {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (error) {
        const unsupported =
            error && (error.code === 20 || /replica set|Transaction numbers|retryable writes/i.test(error.message || ""));
        if (unsupported) return work(undefined);
        throw error;
    } finally {
        await session.endSession();
    }
}

module.exports = runInTransaction;
