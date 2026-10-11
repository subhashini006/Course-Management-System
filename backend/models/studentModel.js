const collection = require("./collection");

const students = collection("students");

// What the API is allowed to show — never the password hash or reset token
function toPublic(s) {
    return {
        id: s.id,
        username: s.username,
        name: s.name,
        email: s.email,
        department: s.department,
        createdAt: s.createdAt,
    };
}

module.exports = {
    ...students,
    toPublic,
    findByEmail: (email) => students.findOne((s) => s.email.toLowerCase() === String(email).toLowerCase()),
    findByUsername: (username) =>
        students.findOne((s) => s.username.toLowerCase() === String(username).toLowerCase()),
};
