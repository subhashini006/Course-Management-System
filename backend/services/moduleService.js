const CourseModule = require("../models/CourseModule");
const { str } = require("../utils/helpers");

// What a student sees on the learning page: either a multi-unit "content"
// module or a single "video" module.

function genericUnits() {
    return [
        {
            title: "Introduction & Overview",
            icon: "book-open",
            paragraphs: [
                "This unit lays the groundwork for the course, introducing the key terminology, real-world motivation, and the roadmap for what's ahead.",
                "By the end of this unit you should be able to explain, in your own words, why this topic matters and where it's used in industry.",
            ],
            bullets: ["Course roadmap and expectations", "Key terminology", "Why this topic matters"],
        },
        {
            title: "Core Concepts",
            icon: "lightbulb",
            paragraphs: [
                "Here we dig into the foundational ideas that everything else in the course builds on.",
                "Expect a mix of theory and small worked examples so the concepts stick before we move on to anything more advanced.",
            ],
            bullets: ["Foundational theory", "Worked examples", "Common misconceptions"],
        },
        {
            title: "Practical Applications",
            icon: "flask",
            paragraphs: [
                "This unit shifts focus to hands-on, real-world use cases, connecting the concepts from earlier units to problems you might actually encounter.",
                "You'll walk through applied examples and see how the underlying ideas translate into practice.",
            ],
            bullets: ["Case studies", "Applied walkthroughs", "Tools commonly used in practice"],
        },
        {
            title: "Advanced Techniques",
            icon: "chart-line",
            paragraphs: [
                "With the basics in place, this unit introduces more advanced techniques and nuances that separate a beginner's understanding from a practitioner's.",
                "This is typically the most challenging unit in the course, so take your time working through it.",
            ],
            bullets: ["Advanced methods", "Edge cases and pitfalls", "Performance and optimization considerations"],
        },
        {
            title: "Final Project & Review",
            icon: "flag-checkered",
            paragraphs: [
                "The closing unit ties everything together with a review of the full course and a capstone-style project to apply what you've learned.",
                "Once you've completed this unit, you'll have covered everything needed to mark this course complete.",
            ],
            bullets: ["Full course recap", "Capstone project brief", "Next steps after this course"],
        },
    ];
}

// Pure function: the module for one course, given the stored document (or null).
// Courses with hand-written content come from the "modules" collection; courses
// an admin adds later get a sensible generic module built from their own details.
function buildModule(course, stored) {
    if (stored) {
        const { _id, course: _course, createdAt, updatedAt, __v, ...rest } = stored; // eslint-disable-line no-unused-vars
        return rest;
    }
    return {
        type: "content",
        overview: course.outcome || course.description || "A course overview will be added here soon.",
        topics: str(course.topics)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        units: genericUnits(),
    };
}

// `course` is a plain (lean) course object
async function getModule(course) {
    const stored = await CourseModule.findOne({ course: course._id }).lean();
    return buildModule(course, stored);
}

// One query for many courses -> Map(courseId string -> module)
async function getModulesFor(courses) {
    const stored = await CourseModule.find({ course: { $in: courses.map((c) => c._id) } }).lean();
    const byCourse = new Map(stored.map((m) => [String(m.course), m]));
    return new Map(courses.map((c) => [String(c._id), buildModule(c, byCourse.get(String(c._id)))]));
}

// Number of things a student can tick off in this module
const countLessons = (mod) => (mod.type === "video" ? 1 : Array.isArray(mod.units) ? mod.units.length : 0);

// Works out percentage complete from the saved flags and the course content
function computeProgress(mod, saved = {}) {
    if (mod.type === "video") {
        const video = saved.video === true;
        return { units: [], video, completedLessons: video ? 1 : 0, totalLessons: 1, percent: video ? 100 : 0 };
    }
    const total = countLessons(mod);
    const savedUnits = Array.isArray(saved.units) ? saved.units : [];
    const units = Array.from({ length: total }, (_, i) => savedUnits[i] === true);
    const done = units.filter(Boolean).length;
    return {
        units,
        video: false,
        completedLessons: done,
        totalLessons: total,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
}

module.exports = { buildModule, getModule, getModulesFor, computeProgress, countLessons };
