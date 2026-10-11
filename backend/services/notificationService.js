const courseModel = require("../models/courseModel");
const studentModel = require("../models/studentModel");
const { getStudentEnrollments } = require("./enrollmentService");

// Notifications are built on the fly from real data, per student
const buildNotifications = (student) => {
    const enrollments = getStudentEnrollments(student.id);
    const items = [];

    items.push({
        id: "welcome",
        type: "course",
        icon: "hand-sparkles",
        title: "Welcome to StudyVerse!",
        message: "Browse the course catalog and enroll to start tracking your learning journey here.",
        date: enrollments.length ? enrollments[0].date : null,
        link: "/courses",
    });

    courseModel
        .filter((c) => c.createdAt)
        .forEach((c) => {
            items.push({
                id: `course-${c.id}`,
                type: "course",
                icon: "circle-plus",
                title: `New Course Added: ${c.title}`,
                message:
                    `A new ${c.level || ""} course in ${c.sectionLabel || c.section || "Other"}` +
                    (c.instructor ? ` — taught by ${c.instructor}` : "") +
                    ".",
                date: c.createdAt,
                link: "/courses",
            });
        });

    enrollments.forEach((en) => {
        items.push({
            id: `enroll-${en.courseId}`,
            type: "enrollment",
            icon: "graduation-cap",
            title: `Enrolled in ${en.courseName}`,
            message: "You successfully enrolled in this course. Jump back in whenever you're ready.",
            date: en.date,
            link: "/courses",
        });
        if (en.status === "completed") {
            items.push({
                id: `complete-${en.courseId}`,
                type: "certificate",
                icon: "trophy",
                title: `Course Completed: ${en.courseName}`,
                message: "Great work! Your certificate is ready to view and download.",
                date: en.completedDate || en.date,
                link: `/certificate?course=${encodeURIComponent(en.courseId)}`,
            });
        }
    });

    // Newest first; items with no date count as "just now"
    const time = (i) => (i.date ? new Date(i.date).getTime() : Date.now());
    items.sort((a, b) => time(b) - time(a));

    const read = new Set(student.notificationsRead || []);
    return items.map((i) => ({ ...i, read: read.has(i.id) }));
};

const getNotifications = (studentId) => {
    const items = buildNotifications(studentModel.findById(studentId));
    return { items, unreadCount: items.filter((i) => !i.read).length };
};

// ids: ["welcome", ...]  or  all: true
const markRead = (studentId, { ids, all }) => {
    const student = studentModel.findById(studentId);
    const read = new Set(student.notificationsRead || []);
    if (all === true) buildNotifications(student).forEach((n) => read.add(n.id));
    else if (Array.isArray(ids)) ids.forEach((id) => read.add(String(id)));
    studentModel.update(studentId, { notificationsRead: [...read] });
};

module.exports = { getNotifications, markRead };
