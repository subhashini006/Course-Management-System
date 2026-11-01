// Creates (or promotes) the admin account in MongoDB.
//
//   npm run create-admin
//
// Reads the details from the environment so no password is ever typed on the
// command line or stored in code:
//   ADMIN_NAME      (optional, default "Administrator")
//   ADMIN_EMAIL     (required)
//   ADMIN_PASSWORD  (required, 12-72 characters)
//
// It uses the SAME User model and the SAME bcrypt helper as normal
// registration, so the admin logs in through the normal login flow.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const config = require("../config");
const User = require("../models/User");
const { hashPassword } = require("../utils/passwordHash");

async function main() {
    const name = (process.env.ADMIN_NAME || "Administrator").trim();
    const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email address");
    if (password.length < config.PASSWORD_MIN || password.length > config.PASSWORD_MAX) {
        throw new Error(`Set ADMIN_PASSWORD (${config.PASSWORD_MIN}-${config.PASSWORD_MAX} characters)`);
    }

    await connectDB();

    const existing = await User.findOne({ email }).select("+password");
    if (existing) {
        if (existing.role === "admin") {
            console.log(`Admin ${email} already exists — nothing changed.`);
            return;
        }
        // Never silently turn a student into an admin
        if (!process.argv.includes("--promote")) {
            throw new Error(`${email} is already registered as a ${existing.role}. Re-run with --promote to make it an admin.`);
        }
        existing.role = "admin";
        await existing.save();
        console.log(`Promoted ${email} to admin.`);
        return;
    }

    await User.create({ name, email, password: await hashPassword(password), role: "admin" });
    console.log(`Admin created: ${email}`);
}

main()
    .catch((error) => {
        console.error("Could not create admin:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
