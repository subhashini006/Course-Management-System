// Loads the starter course catalog (11 courses + 9 learning modules) into
// MongoDB. Safe to run more than once: courses are matched by slug, so nothing
// is duplicated and your own edits are not overwritten.
//
//   npm run seed                       courses + modules
//   npm run seed -- --demo-student     also create demo@studyverse.com
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const CourseModule = require("../models/CourseModule");
const User = require("../models/User");
const { hashPassword } = require("../utils/passwordHash");

const DEMO_EMAIL = "demo@studyverse.com";
const DEMO_PASSWORD = "DemoStudent#2026"; // 16 chars — meets the 12-character rule

async function main() {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "seed", "courses.json"), "utf-8"));
    await connectDB();

    let created = 0;
    let modules = 0;
    for (const item of data.courses) {
        const { id: slug, ...fields } = item;
        let course = await Course.findOne({ slug });
        if (!course) {
            course = await Course.create({ ...fields, slug });
            created += 1;
        }
        const stored = data.modules.find((m) => m.id === slug);
        if (stored && !(await CourseModule.exists({ course: course._id }))) {
            const { id: _id, ...content } = stored; // eslint-disable-line no-unused-vars
            await CourseModule.create({ ...content, course: course._id });
            modules += 1;
        }
    }
    console.log(`Courses: ${created} added, ${data.courses.length - created} already there. Modules added: ${modules}.`);

    if (process.argv.includes("--demo-student")) {
        if (await User.exists({ email: DEMO_EMAIL })) {
            console.log(`Demo student ${DEMO_EMAIL} already exists.`);
        } else {
            await User.create({
                name: "Demo Student",
                email: DEMO_EMAIL,
                password: await hashPassword(DEMO_PASSWORD),
                role: "student",
                department: "Computer Science",
            });
            console.log(`Demo student created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
        }
    }
}

main()
    .catch((error) => {
        console.error("Seed failed:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
