const mongoose = require("mongoose");
const config = require("./index");

// Connects to MongoDB (local or Atlas). server.js calls this BEFORE it starts
// listening, so the API never accepts requests it cannot answer.
async function connectDB() {
    if (!config.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`MongoDB connected successfully (${mongoose.connection.name})`);
}

module.exports = connectDB;
