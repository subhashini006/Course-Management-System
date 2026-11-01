// End-to-end tests for Tasks 9-14 against a real MongoDB.
//   npm test          (needs MongoDB running; set TEST_MONGO_URI if it is not on localhost)
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { io } = require("socket.io-client");
const { ADMIN, JWT_SECRET, MONGO_BASE, prepareDatabase, startServer, request, dropDatabase } = require("./helpers");

const DB = `studyverse_test_${crypto.randomBytes(4).toString("hex")}`;
const PASSWORD = "CorrectHorse#Battery9";
const studentA = { name: "Student A", email: "a@test.local", password: PASSWORD, department: "CSE" };
const studentB = { name: "Student B", email: "b@test.local", password: PASSWORD, department: "ECE" };

let server, api;
let adminToken, tokenA, tokenB, idA, idB, courseId, enrollmentId;
const mongo = () => mongoose.connection.db;

before(async () => {
    prepareDatabase(DB);
    server = await startServer(DB);
    api = server.api;
    await mongoose.connect(`${MONGO_BASE}/${DB}`);
});

after(async () => {
    await mongoose.disconnect();
    await server.stop();
    await dropDatabase(DB);
});

const login = async (creds) => (await request(`${api}/auth/login`, { method: "POST", body: creds })).body;

describe("Task 9 + 14 — registration and validation", () => {
    it("registers a student (201) and never returns the password", async () => {
        const res = await request(`${api}/auth/register`, { method: "POST", body: studentA });
        assert.equal(res.status, 201);
        assert.equal(res.body.student.role, "student");
        assert.equal(res.body.student.email, "a@test.local");
        assert.equal(res.body.student.password, undefined);
        idA = res.body.student.id;
    });

    it("registers a second student", async () => {
        const res = await request(`${api}/auth/register`, { method: "POST", body: studentB });
        assert.equal(res.status, 201);
        idB = res.body.student.id;
    });

    it("rejects a duplicate email with 409 (even in a different case)", async () => {
        const res = await request(`${api}/auth/register`, { method: "POST", body: { ...studentA, email: "A@Test.Local" } });
        assert.equal(res.status, 409);
    });

    it("rejects an invalid email, a short password and missing fields with 400", async () => {
        for (const body of [
            { ...studentA, email: "not-an-email" },
            { ...studentA, email: "x@test.local", password: "short" },
            { name: "No Email", password: PASSWORD },
            {},
        ]) {
            const res = await request(`${api}/auth/register`, { method: "POST", body });
            assert.equal(res.status, 400, JSON.stringify(body));
            assert.equal(res.body.message, "Validation failed");
        }
    });

    it("cannot register as admin by sending role in the body", async () => {
        const res = await request(`${api}/auth/register`, { method: "POST", body: { name: "Sneaky", email: "sneaky@test.local", password: PASSWORD, role: "admin" } });
        assert.equal(res.status, 201);
        assert.equal(res.body.student.role, "student");
    });

    it("stores a bcrypt hash, not the plain password (Task 14.3)", async () => {
        const doc = await mongo().collection("users").findOne({ email: "a@test.local" });
        assert.match(doc.password, /^\$2[aby]\$12\$/);
        assert.notEqual(doc.password, PASSWORD);
    });

    it("rejects malformed JSON with 400", async () => {
        const res = await fetch(`${api}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad json" });
        assert.equal(res.status, 400);
    });
});

describe("Task 10 — JWT login and protected routes", () => {
    it("logs in and returns a Bearer token", async () => {
        const body = await login({ email: studentA.email, password: PASSWORD });
        assert.equal(body.tokenType, "Bearer");
        assert.ok(body.token);
        assert.equal(body.student.role, "student");
        tokenA = body.token;
        const decoded = jwt.verify(tokenA, JWT_SECRET);
        assert.equal(decoded.sub, idA);
        assert.equal(decoded.password, undefined);
    });

    it("logs in the second student and the admin", async () => {
        tokenB = (await login({ email: studentB.email, password: PASSWORD })).token;
        const res = await request(`${api}/auth/admin-login`, { method: "POST", body: ADMIN });
        assert.equal(res.status, 200);
        assert.equal(res.body.role, "admin");
        adminToken = res.body.token;
    });

    it("wrong password -> 401, unknown email -> 401 with the same message", async () => {
        const wrong = await request(`${api}/auth/login`, { method: "POST", body: { email: studentA.email, password: "WrongPassword#123" } });
        const unknown = await request(`${api}/auth/login`, { method: "POST", body: { email: "nobody@test.local", password: "WrongPassword#123" } });
        assert.equal(wrong.status, 401);
        assert.equal(unknown.status, 401);
        assert.equal(wrong.body.message, unknown.body.message);
    });

    it("a student cannot use the admin login", async () => {
        const res = await request(`${api}/auth/admin-login`, { method: "POST", body: { email: studentA.email, password: PASSWORD } });
        assert.equal(res.status, 401);
    });

    it("GET /auth/me works with a token and 401s without one", async () => {
        const ok = await request(`${api}/auth/me`, { token: tokenA });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.data.role, "student");
        assert.equal(ok.body.data.student.email, studentA.email);
        assert.equal((await request(`${api}/auth/me`)).status, 401);
    });

    it("rejects invalid and expired tokens with 401", async () => {
        assert.equal((await request(`${api}/auth/me`, { token: "not.a.jwt" })).status, 401);
        const expired = jwt.sign({ email: studentA.email, role: "student" }, JWT_SECRET, { subject: idA, expiresIn: -10 });
        assert.equal((await request(`${api}/auth/me`, { token: expired })).status, 401);
        const wrongSecret = jwt.sign({ role: "admin" }, "some-other-secret", { subject: idA });
        assert.equal((await request(`${api}/auth/me`, { token: wrongSecret })).status, 401);
    });

    it("a role claim forged inside a token is ignored: the role comes from the database", async () => {
        const forged = jwt.sign({ email: studentA.email, role: "admin" }, JWT_SECRET, { subject: idA, expiresIn: "1h" });
        const res = await request(`${api}/students`, { token: forged });
        assert.equal(res.status, 403);
    });
});

describe("Task 9 — student CRUD (admin only)", () => {
    let createdId;
    it("401 without a token, 403 for a student, 200 for the admin", async () => {
        assert.equal((await request(`${api}/students`)).status, 401);
        assert.equal((await request(`${api}/students`, { token: tokenA })).status, 403);
        const res = await request(`${api}/students`, { token: adminToken });
        assert.equal(res.status, 200);
        assert.ok(res.body.students.length >= 3);
        assert.ok(res.body.students.every((s) => s.role === "student" && s.password === undefined));
    });

    it("creates a student", async () => {
        const res = await request(`${api}/students`, { method: "POST", token: adminToken, body: { name: "Created", email: "created@test.local", password: PASSWORD } });
        assert.equal(res.status, 201);
        createdId = res.body.student.id;
        assert.equal((await request(`${api}/students`, { method: "POST", token: adminToken, body: { name: "Dup", email: "created@test.local", password: PASSWORD } })).status, 409);
        assert.equal((await request(`${api}/students`, { method: "POST", token: adminToken, body: { name: "", email: "x", password: "1" } })).status, 400);
    });

    it("reads one student; invalid id -> 400; unknown id -> 404", async () => {
        assert.equal((await request(`${api}/students/${createdId}`, { token: adminToken })).body.student.name, "Created");
        assert.equal((await request(`${api}/students/not-an-id`, { token: adminToken })).status, 400);
        assert.equal((await request(`${api}/students/${new mongoose.Types.ObjectId()}`, { token: adminToken })).status, 404);
    });

    it("updates a student; empty update -> 400; duplicate email -> 409", async () => {
        const res = await request(`${api}/students/${createdId}`, { method: "PUT", token: adminToken, body: { name: "Renamed" } });
        assert.equal(res.status, 200);
        assert.equal(res.body.student.name, "Renamed");
        assert.equal((await request(`${api}/students/${createdId}`, { method: "PUT", token: adminToken, body: {} })).status, 400);
        assert.equal((await request(`${api}/students/${createdId}`, { method: "PUT", token: adminToken, body: { email: studentA.email } })).status, 409);
    });

    it("deletes a student (404 afterwards)", async () => {
        assert.equal((await request(`${api}/students/${createdId}`, { method: "DELETE", token: adminToken })).status, 200);
        assert.equal((await request(`${api}/students/${createdId}`, { token: adminToken })).status, 404);
    });

    it("the admin account is not reachable through the student endpoints", async () => {
        const admin = await mongo().collection("users").findOne({ email: ADMIN.email });
        assert.equal((await request(`${api}/students/${admin._id}`, { token: adminToken })).status, 404);
        assert.equal((await request(`${api}/students/${admin._id}`, { method: "DELETE", token: adminToken })).status, 404);
    });
});

describe("Task 9 + 12 — course CRUD stored in MongoDB", () => {
    const newCourse = { title: "Test Driven Development", instructor: "Kent B.", duration: "4 Weeks", category: "Software Engineering", level: "Intermediate", outcome: "Write tests first." };

    it("the seeded catalog is public and complete", async () => {
        const res = await request(`${api}/courses`);
        assert.equal(res.status, 200);
        assert.equal(res.body.count, 11);
        assert.ok(res.body.data.every((c) => c.id && c.title));
    });

    it("pagination is validated and capped", async () => {
        const res = await request(`${api}/courses?page=2&limit=5`);
        assert.equal(res.body.data.length, 5);
        assert.equal(res.body.pagination.total, 11);
        assert.equal((await request(`${api}/courses?page=-4&limit=100000`)).body.pagination.limit, 100);
    });

    it("401 / 403 / 201 for creating a course", async () => {
        assert.equal((await request(`${api}/courses`, { method: "POST", body: newCourse })).status, 401);
        assert.equal((await request(`${api}/courses`, { method: "POST", token: tokenA, body: newCourse })).status, 403);
        const res = await request(`${api}/courses`, { method: "POST", token: adminToken, body: newCourse });
        assert.equal(res.status, 201);
        assert.equal(res.body.data.title, newCourse.title);
        assert.equal(res.body.data.sectionLabel, "Software Engineering");
        courseId = res.body.data.id;
    });

    it("missing / invalid course fields -> 400", async () => {
        for (const body of [{}, { ...newCourse, title: "" }, { ...newCourse, instructor: undefined }, { ...newCourse, level: "Godlike" }, { ...newCourse, title: "x".repeat(500) }]) {
            const res = await request(`${api}/courses`, { method: "POST", token: adminToken, body });
            assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80));
        }
    });

    it("reads, updates and persists the course", async () => {
        assert.equal((await request(`${api}/courses/${courseId}`)).body.data.instructor, "Kent B.");
        const res = await request(`${api}/courses/${courseId}`, { method: "PUT", token: adminToken, body: { instructor: "Kent Beck" } });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.instructor, "Kent Beck");
        assert.equal((await mongo().collection("courses").findOne({ title: newCourse.title })).instructor, "Kent Beck");
        assert.equal((await request(`${api}/courses/${courseId}`, { method: "PUT", token: adminToken, body: { title: "  " } })).status, 400);
        assert.equal((await request(`${api}/courses/${courseId}`, { method: "PUT", token: tokenA, body: { title: "Hack" } })).status, 403);
    });

    it("invalid id -> 400, unknown id -> 404", async () => {
        assert.equal((await request(`${api}/courses/123`)).status, 400);
        assert.equal((await request(`${api}/courses/${new mongoose.Types.ObjectId()}`)).status, 404);
    });

    it("serves the stored module, or a generated one for a new course", async () => {
        const seeded = (await request(`${api}/courses`)).body.data.find((c) => c.slug === "ai2");
        const stored = await request(`${api}/courses/${seeded.id}/module`);
        assert.equal(stored.body.data.type, "content");
        assert.equal(stored.body.data.units.length, 5);
        const generated = await request(`${api}/courses/${courseId}/module`);
        assert.equal(generated.body.data.units.length, 5);
    });
});

describe("Task 11/12 — enrollment, learning progress, notifications", () => {
    let seededContentCourse, videoCourse;
    before(async () => {
        const courses = (await request(`${api}/courses`)).body.data;
        seededContentCourse = courses.find((c) => c.slug === "ai2");
        videoCourse = courses.find((c) => c.slug === "ai1");
    });

    it("only a student may enrol; the roll number is required", async () => {
        assert.equal((await request(`${api}/enrollments`, { method: "POST", body: { courseId: videoCourse.id, roll: "1" } })).status, 401);
        assert.equal((await request(`${api}/enrollments`, { method: "POST", token: adminToken, body: { courseId: videoCourse.id, roll: "1" } })).status, 403);
        assert.equal((await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: videoCourse.id } })).status, 400);
        assert.equal((await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: "bad", roll: "1" } })).status, 400);
        assert.equal((await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: String(new mongoose.Types.ObjectId()), roll: "1" } })).status, 404);
    });

    it("enrols, and a second enrolment is a 409", async () => {
        const res = await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: seededContentCourse.id, roll: "CS-01" } });
        assert.equal(res.status, 201);
        assert.equal(res.body.data.status, "active");
        assert.equal(res.body.data.progressPercent, 0);
        assert.equal(res.body.data.progress.units.length, 5);
        enrollmentId = res.body.data.id;
        assert.equal((await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: seededContentCourse.id, roll: "CS-01" } })).status, 409);
    });

    it("lists my enrollments; another student sees none of them", async () => {
        const mine = await request(`${api}/me/enrollments`, { token: tokenA });
        assert.equal(mine.body.count, 1);
        assert.equal(mine.body.data[0].courseName, seededContentCourse.title);
        assert.equal((await request(`${api}/me/enrollments`, { token: tokenB })).body.count, 0);
    });

    it("the enrollment list is admin-only; one enrollment is owner-or-admin", async () => {
        assert.equal((await request(`${api}/enrollments`)).status, 401);
        assert.equal((await request(`${api}/enrollments`, { token: tokenA })).status, 403);
        assert.equal((await request(`${api}/enrollments`, { token: adminToken })).body.count, 1);
        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { token: tokenB })).status, 403);
        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { token: tokenA })).status, 200);
        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { token: adminToken })).status, 200);
    });

    it("another student cannot change my progress", async () => {
        const res = await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenB, body: { progress: { units: [true, true, true, true, true] } } });
        assert.equal(res.status, 403);
    });

    it("progress is computed on the server and the course completes at 100%", async () => {
        let res = await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { units: [true, true] } } });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.progressPercent, 40);
        assert.equal(res.body.data.status, "active");
        assert.equal(res.body.data.completedLessons, 2);

        res = await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { units: [true, true, true, true, true] } } });
        assert.equal(res.body.data.progressPercent, 100);
        assert.equal(res.body.data.status, "completed");
        assert.ok(res.body.data.completedDate);

        res = await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { units: [true, false, true, true, true] } } });
        assert.equal(res.body.data.status, "active");

        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { units: "nope" } } })).status, 400);
        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { video: "yes" } } })).status, 400);
    });

    it("the learning-progress endpoints report the same numbers", async () => {
        const one = await request(`${api}/learning-progress/${seededContentCourse.id}`, { token: tokenA });
        assert.equal(one.status, 200);
        assert.equal(one.body.progress.progressPercentage, 80);
        const saved = await mongo().collection("learningprogresses").findOne({ student: new mongoose.Types.ObjectId(idA) });
        assert.equal(saved.completedLessons, 4);
        assert.equal(saved.totalLessons, 5);
        const put = await request(`${api}/learning-progress/${seededContentCourse.id}`, { method: "PUT", token: tokenA, body: { units: [true, true, true, true, true] } });
        assert.equal(put.body.progress.status, "completed");
        assert.equal((await request(`${api}/learning-progress`, { token: tokenA })).body.count, 1);
        assert.equal((await request(`${api}/learning-progress/${seededContentCourse.id}`, { token: tokenB })).status, 404);
    });

    it("a video course completes when the video is marked watched", async () => {
        const enrol = await request(`${api}/enrollments`, { method: "POST", token: tokenB, body: { courseId: videoCourse.id, roll: "EC-02" } });
        const res = await request(`${api}/enrollments/${enrol.body.data.id}`, { method: "PATCH", token: tokenB, body: { progress: { video: true } } });
        assert.equal(res.body.data.progressPercent, 100);
        assert.equal(res.body.data.status, "completed");
    });

    it("withdrawing keeps the record; re-enrolling reactivates it (no duplicate)", async () => {
        const w = await request(`${api}/enrollments/${enrollmentId}`, { method: "DELETE", token: tokenA });
        assert.equal(w.status, 200);
        assert.equal(w.body.data.status, "withdrawn");
        assert.equal((await request(`${api}/me/enrollments`, { token: tokenA })).body.count, 0);
        assert.equal((await request(`${api}/enrollments/${enrollmentId}`, { method: "PATCH", token: tokenA, body: { progress: { units: [true] } } })).status, 409);
        assert.equal(await mongo().collection("enrollments").countDocuments({ student: new mongoose.Types.ObjectId(idA) }), 1);

        const again = await request(`${api}/enrollments`, { method: "POST", token: tokenA, body: { courseId: seededContentCourse.id, roll: "CS-01" } });
        assert.equal(again.status, 201);
        assert.equal(again.body.data.id, enrollmentId);
        assert.equal(again.body.data.status, "completed"); // earlier progress was kept (100% before withdrawing)
        assert.equal(await mongo().collection("enrollments").countDocuments({ student: new mongoose.Types.ObjectId(idA) }), 1);
    });

    it("notifications were stored: welcome, new course, enrolled, completed", async () => {
        const res = await request(`${api}/notifications`, { token: tokenA });
        assert.equal(res.status, 200);
        const titles = res.body.notifications.map((n) => n.title).join(" | ");
        assert.match(titles, /Welcome/);
        assert.match(titles, /New Course Added: Test Driven Development/);
        assert.match(titles, /Enrolled in/);
        assert.match(titles, /Course Completed/);
        assert.ok(res.body.unreadCount >= 4);
    });

    it("marks one / all notifications read — only my own", async () => {
        const mine = (await request(`${api}/notifications`, { token: tokenA })).body.notifications;
        const others = (await request(`${api}/notifications`, { token: tokenB })).body.notifications;
        assert.equal((await request(`${api}/notifications/${others[0].id}/read`, { method: "PATCH", token: tokenA })).status, 404);
        const one = await request(`${api}/notifications/${mine[0].id}/read`, { method: "PATCH", token: tokenA });
        assert.equal(one.body.notification.isRead, true);
        assert.equal((await request(`${api}/notifications/xyz/read`, { method: "PATCH", token: tokenA })).status, 400);
        await request(`${api}/notifications/read-all`, { method: "PATCH", token: tokenA });
        assert.equal((await request(`${api}/notifications`, { token: tokenA })).body.unreadCount, 0);
        assert.equal((await request(`${api}/notifications`, { token: tokenB })).body.unreadCount > 0, true);
        assert.equal((await request(`${api}/notifications`)).status, 401);
    });

    it("deleting a course removes its enrollments, progress and content (cascade)", async () => {
        const tdd = await request(`${api}/enrollments`, { method: "POST", token: tokenB, body: { courseId, roll: "EC-02" } });
        assert.equal(tdd.status, 201);
        const res = await request(`${api}/courses/${courseId}`, { method: "DELETE", token: adminToken });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.removedEnrollments, 1);
        assert.equal((await request(`${api}/courses/${courseId}`)).status, 404);
        assert.equal(await mongo().collection("enrollments").countDocuments({ course: new mongoose.Types.ObjectId(courseId) }), 0);
        assert.equal(await mongo().collection("learningprogresses").countDocuments({ course: new mongoose.Types.ObjectId(courseId) }), 0);
    });
});

describe("Task 12 — profile", () => {
    it("reads and updates only my own profile", async () => {
        const res = await request(`${api}/profile`, { token: tokenA });
        assert.equal(res.body.user.email, studentA.email);
        assert.equal(res.body.user.password, undefined);
        const upd = await request(`${api}/profile`, { method: "PUT", token: tokenA, body: { name: "Student A Renamed", email: "hijack@test.local", role: "admin" } });
        assert.equal(upd.status, 200);
        assert.equal(upd.body.user.name, "Student A Renamed");
        assert.equal(upd.body.user.email, studentA.email); // email and role cannot be changed here
        assert.equal(upd.body.user.role, "student");
        assert.equal((await request(`${api}/profile`, { token: tokenB })).body.user.name, "Student B");
        assert.equal((await request(`${api}/profile`, { method: "PUT", token: tokenA, body: { name: "  " } })).status, 400);
        assert.equal((await request(`${api}/profile`)).status, 401);
    });

    it("the updated name persists in MongoDB", async () => {
        assert.equal((await mongo().collection("users").findOne({ email: studentA.email })).name, "Student A Renamed");
    });
});

describe("Task 13 — real-time chat and notifications (Socket.IO)", () => {
    const connect = (token) => io(server.base, { auth: { token }, transports: ["websocket"], reconnection: false });
    const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));
    const emitAck = (socket, event, data) => new Promise((resolve) => socket.emit(event, data, resolve));
    let sockA, sockB;

    after(() => { sockA && sockA.close(); sockB && sockB.close(); });

    it("rejects a connection without a token or with a bad one", async () => {
        const none = connect(undefined);
        assert.equal((await once(none, "connect_error")).message, "Authentication required");
        none.close();
        const bad = connect("garbage");
        assert.equal((await once(bad, "connect_error")).message, "Invalid authentication token");
        bad.close();
    });

    it("rejects a token whose user was deleted", async () => {
        const ghost = jwt.sign({ role: "student" }, JWT_SECRET, { subject: String(new mongoose.Types.ObjectId()), expiresIn: "1h" });
        const s = connect(ghost);
        assert.equal((await once(s, "connect_error")).message, "User not found");
        s.close();
    });

    it("A sends a message and B receives it instantly, plus a notification", async () => {
        sockA = connect(tokenA);
        sockB = connect(tokenB);
        await Promise.all([once(sockA, "connect"), once(sockB, "connect")]);

        const gotMessage = once(sockB, "receive_message");
        const gotNotification = once(sockB, "new_notification");
        const echoToSender = once(sockA, "receive_message");
        const ack = await emitAck(sockA, "send_message", { recipientId: idB, text: "  Hello B!  " });
        assert.equal(ack.success, true);

        const msg = await gotMessage;
        assert.equal(msg.text, "Hello B!");
        assert.equal(msg.sender, idA); // sender comes from the verified token
        assert.equal(msg.recipient, idB);
        assert.equal((await echoToSender).text, "Hello B!");
        const note = await gotNotification;
        assert.equal(note.type, "message");
        assert.match(note.message, /New message from Student A Renamed/);
    });

    it("the client cannot fake the sender", async () => {
        const gotMessage = once(sockB, "receive_message");
        await emitAck(sockA, "send_message", { recipientId: idB, text: "spoof?", sender: idB });
        assert.equal((await gotMessage).sender, idA);
    });

    it("rejects bad messages: empty, too long, self, unknown recipient, bad id", async () => {
        for (const data of [
            { recipientId: idB, text: "   " },
            { recipientId: idB, text: "x".repeat(2001) },
            { recipientId: idA, text: "to myself" },
            { recipientId: String(new mongoose.Types.ObjectId()), text: "ghost" },
            { recipientId: "nope", text: "hi" },
            undefined,
        ]) {
            const ack = await emitAck(sockA, "send_message", data);
            assert.equal(ack.success, false, JSON.stringify(data)?.slice(0, 60));
        }
    });

    it("persists messages; history API returns the conversation to its two members only", async () => {
        const res = await request(`${api}/messages/${idB}`, { token: tokenA });
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.messages.map((m) => m.text), ["Hello B!", "spoof?"]);
        const fromB = await request(`${api}/messages/${idA}`, { token: tokenB });
        assert.equal(fromB.body.messages.length, 2);

        // A third user sees an empty conversation with A — never A and B's messages
        const third = await request(`${api}/auth/register`, { method: "POST", body: { name: "Third", email: "c@test.local", password: PASSWORD } });
        const tokenC = (await login({ email: "c@test.local", password: PASSWORD })).token;
        assert.equal((await request(`${api}/messages/${idA}`, { token: tokenC })).body.messages.length, 0);
        assert.equal((await request(`${api}/messages/${idB}`, { token: tokenC })).body.messages.length, 0);
        assert.ok(third.body.student.id);

        assert.equal((await request(`${api}/messages/${idB}`)).status, 401);
        assert.equal((await request(`${api}/messages/bad-id`, { token: tokenA })).status, 400);
        assert.equal((await request(`${api}/messages/${new mongoose.Types.ObjectId()}`, { token: tokenA })).status, 404);
    });

    it("lists contacts without email addresses", async () => {
        const res = await request(`${api}/messages/contacts`, { token: tokenA });
        assert.equal(res.status, 200);
        assert.ok(res.body.contacts.length >= 3);
        assert.ok(res.body.contacts.every((c) => c.email === undefined && c.id && c.name));
        assert.ok(!res.body.contacts.some((c) => c.id === idA));
    });

    it("rate-limits message flooding on one connection", async () => {
        let blocked = 0;
        for (let i = 0; i < 30; i++) {
            const ack = await emitAck(sockA, "send_message", { recipientId: idB, text: `flood ${i}` });
            if (!ack.success && /too quickly/.test(ack.message)) blocked += 1;
        }
        assert.ok(blocked > 0);
    });
});

describe("Task 14 — security and error handling", () => {
    it("unknown route -> 404 JSON", async () => {
        const res = await request(`${api}/does-not-exist`);
        assert.equal(res.status, 404);
        assert.equal(res.body.message, "API endpoint not found");
    });

    it("health check", async () => {
        const res = await request(`${server.base}/api/health`);
        assert.deepEqual(res.body, { status: "ok", message: "API is running" });
    });

    it("sends security headers (helmet) and hides the framework", async () => {
        const res = await request(`${api}/courses`);
        assert.ok(res.headers.get("x-content-type-options"));
        assert.ok(res.headers.get("strict-transport-security"));
        assert.equal(res.headers.get("x-powered-by"), null);
    });

    it("CORS: the configured origin is allowed, an unknown one is refused (403)", async () => {
        const ok = await request(`${api}/courses`, { headers: { Origin: "http://localhost:5173" } });
        assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
        const evil = await request(`${api}/courses`, { headers: { Origin: "https://evil.example.com" } });
        assert.equal(evil.status, 403);
        assert.equal(evil.headers.get("access-control-allow-origin"), null);
    });

    it("password-reset: a link is created and works once; the new password is hashed", async () => {
        const forgot = await request(`${api}/auth/forgot-password`, { method: "POST", body: { email: studentB.email } });
        assert.equal(forgot.status, 200);
        const token = new URL(forgot.body.data.resetLink).searchParams.get("token");
        assert.equal((await request(`${api}/auth/reset-password`, { method: "POST", body: { token, password: "short" } })).status, 400);
        const reset = await request(`${api}/auth/reset-password`, { method: "POST", body: { token, password: "BrandNewPassword#77" } });
        assert.equal(reset.status, 200);
        assert.equal((await request(`${api}/auth/reset-password`, { method: "POST", body: { token, password: "BrandNewPassword#88" } })).status, 400);
        assert.equal((await request(`${api}/auth/login`, { method: "POST", body: { email: studentB.email, password: "BrandNewPassword#77" } })).status, 200);
        const doc = await mongo().collection("users").findOne({ email: studentB.email });
        assert.match(doc.password, /^\$2[aby]\$12\$/);
        assert.equal(doc.resetTokenHash, undefined);
    });

    it("forgot-password does not reveal whether an email exists", async () => {
        const known = await request(`${api}/auth/forgot-password`, { method: "POST", body: { email: studentA.email } });
        const unknown = await request(`${api}/auth/forgot-password`, { method: "POST", body: { email: "ghost@test.local" } });
        assert.equal(known.body.message, unknown.body.message);
    });

    it("a controlled 500 hides internals", async () => {
        // A well-formed id of the wrong kind of value reaches the DB layer; force a real server error
        // by sending a token whose subject is not an ObjectId (CastError -> 400, never a stack trace)
        const odd = jwt.sign({ role: "student" }, JWT_SECRET, { subject: "not-an-object-id", expiresIn: "1h" });
        const res = await request(`${api}/auth/me`, { token: odd });
        assert.ok([400, 401].includes(res.status));
        assert.ok(!JSON.stringify(res.body).includes("node_modules"));
    });
});

describe("Task 12 — deleting a student cleans up everything that belongs to them", () => {
    it("removes enrollments, progress, notifications and messages", async () => {
        const oid = new mongoose.Types.ObjectId(idB);
        assert.ok((await mongo().collection("enrollments").countDocuments({ student: oid })) > 0);
        assert.ok((await mongo().collection("messages").countDocuments({ $or: [{ sender: oid }, { recipient: oid }] })) > 0);

        assert.equal((await request(`${api}/students/${idB}`, { method: "DELETE", token: adminToken })).status, 200);

        for (const [name, filter] of [
            ["users", { _id: oid }],
            ["enrollments", { student: oid }],
            ["learningprogresses", { student: oid }],
            ["notifications", { recipient: oid }],
            ["messages", { $or: [{ sender: oid }, { recipient: oid }] }],
        ]) {
            assert.equal(await mongo().collection(name).countDocuments(filter), 0, name);
        }
    });

    it("the deleted student's token stops working immediately", async () => {
        assert.equal((await request(`${api}/auth/me`, { token: tokenB })).status, 401);
    });
});

describe("Task 14.6 — login rate limiting (fresh server)", () => {
    it("returns 429 after 10 login attempts from one IP", async () => {
        const limited = await startServer(DB);
        try {
            const statuses = [];
            for (let i = 0; i < 12; i++) {
                const res = await request(`${limited.api}/auth/login`, { method: "POST", body: { email: "a@test.local", password: "Wrong#Password1" } });
                statuses.push(res.status);
            }
            assert.deepEqual(statuses.slice(0, 10), Array(10).fill(401));
            assert.equal(statuses[10], 429);
            assert.equal(statuses[11], 429);
        } finally {
            await limited.stop();
        }
    });
});
