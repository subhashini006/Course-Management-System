// Load .env FIRST so every module below can read process.env
require("dotenv").config({ quiet: true });

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const config = require("./config");
const connectDB = require("./config/db");
const initializeSocket = require("./config/socket");
const { isOriginAllowed } = require("./config/origins");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const profileRoutes = require("./routes/profileRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const meRoutes = require("./routes/meRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// Render (and most hosts) put a proxy in front of the app. Trusting it makes
// req.ip the real visitor, which the login rate limiter depends on.
if (config.IS_PRODUCTION) app.set("trust proxy", 1);

// -------------------------
// Security, parsing, logging  (Task 14) — all BEFORE the routes
// -------------------------
app.use(helmet());
app.use(
    cors({
        origin(origin, callback) {
            if (isOriginAllowed(origin)) return callback(null, true);
            callback(Object.assign(new Error("Origin not allowed by CORS"), { status: 403 }));
        },
    })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {}; // Express 5: no body -> undefined
    next();
});
// Morgan logs the method, URL and status — never request bodies, passwords or tokens
app.use(morgan(config.IS_PRODUCTION ? "combined" : "dev"));

// -------------------------
// Root + health check
// -------------------------
app.get("/", (req, res) => {
    res.json({ message: "Student Course Management API is running" });
});

// Confirms Express is responding. It does not check MongoDB.
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "API is running" });
});

// -------------------------
// API routes (versioned)
// -------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/modules", moduleRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/learning-progress", learningProgressRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/stats", statsRoutes);

// -------------------------
// 404 + error handling (must stay LAST, in this order)
// -------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------
// Startup (Task 12.2 + 13.3): connect to MongoDB first, then listen
// -------------------------
const server = http.createServer(app);
let io;

function checkEnvironment() {
    const problems = [];
    if (!config.JWT_SECRET) problems.push("JWT_SECRET is missing");
    else if (config.IS_PRODUCTION && config.JWT_SECRET.length < 32) problems.push("JWT_SECRET must be at least 32 characters in production");
    if (!config.MONGO_URI) problems.push("MONGO_URI is missing");
    if (problems.length) throw new Error(`${problems.join("; ")}. Copy .env.example to .env and fill it in.`);
}

async function startServer() {
    try {
        checkEnvironment();
        await connectDB();
        io = initializeSocket(server);
        server.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
            console.log(`Health check: http://localhost:${config.PORT}/api/health`);
        });
    } catch (error) {
        console.error("Unable to start server:", error.message);
        process.exit(1);
    }
}

// Graceful shutdown: stop taking new connections, finish the open ones, close MongoDB
let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received — shutting down`);
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    try {
        if (io) await io.close();
        await mongoose.connection.close();
    } catch (error) {
        console.error("Error during shutdown:", error.message);
    }
    process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Task 14.10 — log, then exit; a process manager (Render) restarts the service
process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

startServer();
