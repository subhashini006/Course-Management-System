const { readDB, writeDB } = require("./db");

// Generic data access for one collection (e.g. "courses") in db.json.
// Every model below is built on this.
function collection(name) {
    const sameId = (id) => (item) => String(item.id) === String(id);

    return {
        all: () => readDB()[name],
        count: () => readDB()[name].length,
        findById: (id) => readDB()[name].find(sameId(id)),
        findOne: (predicate) => readDB()[name].find(predicate),
        filter: (predicate) => readDB()[name].filter(predicate),

        // Next free numeric id (used by students and enrollments)
        nextId() {
            return (
                readDB()[name].reduce((max, i) => (typeof i.id === "number" && i.id > max ? i.id : max), 0) + 1
            );
        },

        insert(item) {
            const db = readDB();
            db[name].push(item);
            writeDB(db);
            return item;
        },

        // Merges `changes` into the item with this id; returns it, or null
        update(id, changes) {
            const db = readDB();
            const item = db[name].find(sameId(id));
            if (!item) return null;
            Object.assign(item, changes);
            writeDB(db);
            return item;
        },

        // Returns the removed item, or null
        remove(id) {
            const db = readDB();
            const index = db[name].findIndex(sameId(id));
            if (index < 0) return null;
            const [removed] = db[name].splice(index, 1);
            writeDB(db);
            return removed;
        },

        // Removes everything matching the predicate; returns how many
        removeWhere(predicate) {
            const db = readDB();
            const before = db[name].length;
            db[name] = db[name].filter((item) => !predicate(item));
            writeDB(db);
            return before - db[name].length;
        },
    };
}

module.exports = collection;
