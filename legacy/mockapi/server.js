// StudyVerse Mock API
// ---------------------------------------------------------------
// GET routes: read-only, serve whatever is currently in db.json.
// POST /courses: the one write route — appends a new course to
// db.json and saves it to disk, so it's real, persisted data (not
// just localStorage) and shows up for every browser that asks.
//
// Run with: npm start
// ---------------------------------------------------------------

const jsonServer = require("json-server");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, "db.json");

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Allow the Vite dev server (any localhost port) to call this API,
// including the preflight OPTIONS request browsers send before a
// cross-origin POST with a JSON body.
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

function readDb() {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
}

function writeDb(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getCollectionNames() {
    return Object.keys(readDb());
}

function slugify(text) {
    return (text || "course")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "course";
}

function uniqueId(baseSlug, existingIds) {
    if (!existingIds.has(baseSlug)) return baseSlug;
    let suffix = 2;
    while (existingIds.has(`${baseSlug}-${suffix}`)) suffix += 1;
    return `${baseSlug}-${suffix}`;
}

// ---- GET-only routes for every collection in db.json ----
getCollectionNames().forEach((collection) => {
    server.get(`/${collection}`, (req, res) => {
        const db = readDb();
        res.json(db[collection]);
    });

    server.get(`/${collection}/count`, (req, res) => {
        const db = readDb();
        res.json({ collection, count: db[collection].length });
    });

    server.get(`/${collection}/:id`, (req, res) => {
        const db = readDb();
        const record = db[collection].find((item) => String(item.id) === String(req.params.id));
        if (!record) {
            return res.status(404).json({ error: `${collection} with id "${req.params.id}" not found` });
        }
        res.json(record);
    });
});

// GET /stats -> counts for every collection in one response
server.get("/stats", (req, res) => {
    const db = readDb();
    const stats = {};
    Object.keys(db).forEach((collection) => {
        stats[collection] = db[collection].length;
    });
    res.json(stats);
});

// ---- POST /courses: the one write route ----
// Body: { title, level, duration, hours, rating, instructor, topics,
//         outcome, section, sectionLabel }  (id is generated if not
// given). Saves straight into db.json on disk.
server.post("/courses", (req, res) => {
    const body = req.body || {};

    if (!body.title || !body.title.toString().trim()) {
        return res.status(400).json({ error: "title is required" });
    }

    const db = readDb();
    const existingIds = new Set(db.courses.map((c) => String(c.id)));

    let id = body.id ? String(body.id).trim() : "";
    if (!id) {
        id = uniqueId(slugify(body.title), existingIds);
    } else if (existingIds.has(id)) {
        return res.status(409).json({ error: `course with id "${id}" already exists` });
    }

    const newCourse = {
        id,
        title: body.title,
        section: body.section || "other",
        sectionLabel: body.sectionLabel || body.category || "Other",
        level: body.level || "Beginner",
        duration: body.duration || "",
        hours: body.hours || "",
        rating: body.rating || "New",
        instructor: body.instructor || "",
        topics: body.topics || "",
        outcome: body.outcome || "",
    };

    db.courses.push(newCourse);
    writeDb(db);

    res.status(201).json(newCourse);
});

// Anything else: GET/POST on a known route is handled above; every
// other method is explicitly rejected for now.
server.all("*", (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({
            error: `Method ${req.method} is not supported. Only GET and POST /courses are available.`,
        });
    }
    res.status(404).json({ error: "Not found" });
});

server.listen(PORT, () => {
    const db = readDb();
    console.log("");
    console.log("  StudyVerse Mock API is running");
    console.log("  --------------------------------");
    console.log(`  Local:  http://localhost:${PORT}`);
    console.log("");
    console.log("  Record counts in db.json:");
    Object.keys(db).forEach((collection) => {
        console.log(`    ${collection.padEnd(14)} ${db[collection].length}`);
    });
    console.log("");
    console.log("  Try it:");
    console.log(`    GET  http://localhost:${PORT}/courses`);
    console.log(`    GET  http://localhost:${PORT}/courses/count`);
    console.log(`    GET  http://localhost:${PORT}/stats`);
    console.log(`    POST http://localhost:${PORT}/courses   (adds a course, saved to db.json)`);
    console.log("");
});
