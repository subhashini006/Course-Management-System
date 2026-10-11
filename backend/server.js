const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ quiet: true });

const config = require("./config");
const corsOptions = require("./config/corsOptions");
const { ensureDB, readDB } = require("./models/db");

const { attachSession } = require("./middleware/authMiddleware");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");

const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const studentRoutes = require("./routes/studentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const meRoutes = require("./routes/meRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// -------------------------
// Middleware
// -------------------------
app.set("json spaces", 2); // JSON is sent indented, readable in the browser
app.use(cors(corsOptions)); // credentials enabled so the login cookie works
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {}; // Express 5: no body -> undefined
    next();
});
app.use(morgan("dev"));
app.use(attachSession); // reads the login cookie into req.session

// -------------------------
// Test Route
// -------------------------
app.get("/", (req, res) => {
    res.json({
        message: "Student Course Management API is running",
    });
});

// -------------------------
// Health Check
// -------------------------
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString(),
    });
});

// -------------------------
// API Routes (versioned)
// -------------------------
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/modules", moduleRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/stats", statsRoutes);

// -------------------------
// 404 + Error handling (must stay LAST, in this order)
// -------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------
// Server
// -------------------------
const PORT = process.env.PORT || config.PORT;

ensureDB();

app.listen(PORT, () => {
    const db = readDB();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("\n  Records in data/db.json:");
    Object.keys(db).forEach((name) => console.log(`    ${name.padEnd(12)} ${db[name].length}`));
    console.log(`\n  Health check: http://localhost:${PORT}/api/health`);
    console.log(`  Courses:      http://localhost:${PORT}/api/v1/courses`);
    console.log(`  Admin login:  ${config.ADMIN_EMAIL}`);
    console.log("  Demo student: demo@studyverse.com / demo1234\n");
});
