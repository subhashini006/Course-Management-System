// Storage engine: one JSON file (data/db.json) read and written with Node's fs.
// Swap this file for a real database driver later and the rest of the app
// (models -> services -> controllers) does not need to change.
const fs = require("fs");
const config = require("../config");

const EMPTY_DB = { courses: [], students: [], enrollments: [], modules: [] };

function ensureDB() {
    if (!fs.existsSync(config.DATA_DIR)) fs.mkdirSync(config.DATA_DIR, { recursive: true });
    if (!fs.existsSync(config.DB_PATH)) {
        fs.writeFileSync(config.DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
        console.warn("  ! data/db.json was missing, so an empty one was created.");
    }
}

function readDB() {
    const db = JSON.parse(fs.readFileSync(config.DB_PATH, "utf-8"));
    Object.keys(EMPTY_DB).forEach((key) => {
        if (!Array.isArray(db[key])) db[key] = [];
    });
    return db;
}

function writeDB(db) {
    fs.writeFileSync(config.DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = { ensureDB, readDB, writeDB };
