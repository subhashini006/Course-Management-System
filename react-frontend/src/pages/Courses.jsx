import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import Footer from "../components/Footer";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";

const SECTION_META = {
    ai: { label: "Artificial Intelligence", tag: "AI", icon: "fa-robot" },
    ml: { label: "Machine Learning", tag: "ML", icon: "fa-brain" },
};

function badgeClass(level) {
    if (level === "Intermediate") return "c-badge c-badge-inter";
    if (level === "Advanced") return "c-badge c-badge-adv";
    return "c-badge";
}

// Groups courses under their "section" (e.g. "ai", "ml"), keeping the order
// in which sections first appear. A brand-new category gets its own section.
function groupBySection(courses) {
    const order = [];
    const groups = {};
    courses.forEach((course) => {
        const key = course.section || "other";
        if (!groups[key]) {
            groups[key] = [];
            order.push(key);
        }
        groups[key].push(course);
    });
    return order.map((key) => ({ section: key, items: groups[key] }));
}

export default function Courses() {
    const { courses, loading, error, refresh } = useCourses();
    const { student, logout } = useAuth();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    // Enrollment modal: which course, which step, and the form state
    const [enrolling, setEnrolling] = useState(null);
    const [step, setStep] = useState("form");
    const [roll, setRoll] = useState("");
    const [formError, setFormError] = useState("");
    const [busy, setBusy] = useState(false);
    const [startLink, setStartLink] = useState("#");

    // Pick up changes made elsewhere (e.g. another admin adding a course)
    useEffect(() => {
        refresh();
    }, [refresh]);

    const sections = useMemo(() => {
        const q = query.trim().toLowerCase();
        const visible = q
            ? courses.filter((c) =>
                  [c.title, c.instructor, c.topics, c.sectionLabel, c.level].some((v) =>
                      String(v || "").toLowerCase().includes(q)
                  )
              )
            : courses;
        return groupBySection(visible);
    }, [courses, query]);

    const modalOpen = enrolling !== null;

    // Lock page scroll and allow Escape to close while the modal is open
    useEffect(() => {
        if (!modalOpen) return undefined;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape") setEnrolling(null);
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKey);
        };
    }, [modalOpen]);

    // After a successful enrollment, take the student into the course
    useEffect(() => {
        if (step !== "success") return undefined;
        const timer = setTimeout(() => navigate(startLink), 1800);
        return () => clearTimeout(timer);
    }, [step, startLink, navigate]);

    function openEnrollModal(course) {
        if (!student) {
            if (confirm("Please log in to enroll in a course. Go to the login page now?")) {
                navigate("/stu-login");
            }
            return;
        }
        setRoll("");
        setFormError("");
        setStep("form");
        setEnrolling(course);
    }

    async function submitEnrollment(e) {
        e.preventDefault();
        if (!roll.trim()) {
            setFormError("Please fill in both your name and roll number.");
            return;
        }
        setFormError("");
        setBusy(true);
        try {
            await api.post("/api/v1/enrollments", { courseId: enrolling.id, name: student.name, roll: roll.trim() });
            setStartLink(`/course?course=${encodeURIComponent(enrolling.id)}`);
            setStep("success");
        } catch (err) {
            setFormError(errorMessage(err));
        }
        setBusy(false);
    }

    async function handleLogout(e) {
        e.preventDefault();
        await logout();
        navigate("/stu-login");
    }

    return (
        <>
            <PageMeta bodyClassName="" page="courses" title="Courses | StudyVerse" />
            {/* ================= NAVBAR ================= */}
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>StudyVerse</span>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/courses" className="active-nav">
                            Courses
                        </Link>
                    </li>
                    <li id="notifNavItem">
                        {student ? <Link to="/stu-dashboard">Student Dashboard</Link> : <Link to="/notifications">Notifications</Link>}
                    </li>
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                    <li>
                        <Link to="/add-course-edit">Add Course</Link>
                    </li>
                </ul>
                <div className="nav-buttons" id="navAuthArea">
                    {student ? (
                        <a href="#" className="login-btn" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout ({student.name})
                        </a>
                    ) : (
                        <Link to="/login-choice" className="login-btn">
                            Login / Register
                        </Link>
                    )}
                </div>
            </nav>
            {/* ================= PAGE HEADER ================= */}
            <section className="courses-hero">
                <h1>Explore Our Courses</h1>
                <p>Handpicked courses across the most in-demand tech domains — start learning today.</p>
                <div className="courses-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        id="courseSearch"
                        placeholder="Search courses..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </section>
            {/* ================= COURSES CONTENT (from the backend) ================= */}
            <main className="courses-main">
                {error && (
                    <div className="course-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p style={{ color: "#c0392b", fontWeight: 600 }}>Couldn&apos;t load courses ({error}).</p>
                        <p style={{ color: "var(--text-muted)" }}>
                            Make sure the backend is running — open a terminal in the <code>backend</code> folder and run{" "}
                            <code>npm start</code>, then refresh this page.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="course-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p>Loading courses…</p>
                    </div>
                )}

                {!loading && !error && sections.length === 0 && (
                    <div className="course-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p>{query ? "No courses match your search." : "No courses available yet."}</p>
                    </div>
                )}

                {sections.map(({ section, items }) => {
                    const meta = SECTION_META[section] || {
                        label: items[0].sectionLabel || section,
                        tag: (items[0].sectionLabel || section).slice(0, 12).toUpperCase(),
                        icon: "fa-layer-group",
                    };
                    return (
                        <section className="course-section" data-section={section} key={section}>
                            <div className="section-header">
                                <div className="section-title-group">
                                    <div className="section-icon">
                                        <i className={`fa-solid ${meta.icon}`}></i>
                                    </div>
                                    <div>
                                        <h2>
                                            {meta.label} {SECTION_META[section] && <span className="section-tag">{meta.tag}</span>}
                                        </h2>
                                        <p className="section-count">
                                            {items.length} {items.length === 1 ? "Course" : "Courses"}
                                        </p>
                                    </div>
                                </div>
                                <Link to="/add-course-edit" className="admin-section-btn">
                                    <i className="fa-solid fa-plus"></i> Add Course
                                </Link>
                            </div>
                            <div className="courses-grid">
                                {items.map((course) => (
                                    <div className="c-card" data-id={course.id} data-name={course.title} key={course.id}>
                                        <div className="c-card-body">
                                            <span className={badgeClass(course.level)}>{course.level}</span>
                                            <h3>{course.title}</h3>
                                            <div className="c-duration">
                                                <i className="fa-regular fa-clock"></i> {course.duration}
                                            </div>
                                            <div className="c-meta">
                                                <span>
                                                    <i className="fa-solid fa-star"></i> {course.rating}
                                                </span>
                                            </div>
                                            <div className="c-card-actions">
                                                <button type="button" className="enroll-btn" onClick={() => openEnrollModal(course)}>
                                                    <i className="fa-solid fa-graduation-cap"></i> Enroll
                                                </button>
                                                <Link
                                                    to={`/edit-course-login?course=${encodeURIComponent(course.id)}`}
                                                    className="admin-edit-btn"
                                                    title="Edit Course"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </Link>
                                            </div>
                                            <details className="c-details">
                                                <summary className="view-details-btn">
                                                    <i className="fa-solid fa-chevron-down"></i> View Details
                                                </summary>
                                                <div className="c-details-body">
                                                    <p>
                                                        <strong>Instructor:</strong> {course.instructor}
                                                    </p>
                                                    <p>
                                                        <strong>Duration:</strong> {course.duration}
                                                        {course.hours && <> &middot; {course.hours}</>}
                                                    </p>
                                                    <p>
                                                        <strong>Topics:</strong> {course.topics}
                                                    </p>
                                                    <p>
                                                        <strong>Outcome:</strong> {course.outcome}
                                                    </p>
                                                    {course.prereqs && (
                                                        <p>
                                                            <strong>Prerequisites:</strong> {course.prereqs}
                                                        </p>
                                                    )}
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </main>
            <Footer />
            {/* ================= ENROLLMENT MODAL ================= */}
            <div
                className={`enroll-modal-overlay${modalOpen ? " active" : ""}`}
                id="enrollModalOverlay"
                onClick={(e) => {
                    if (e.target === e.currentTarget) setEnrolling(null);
                }}
            >
                <div className="enroll-modal">
                    <button type="button" className="enroll-modal-close" onClick={() => setEnrolling(null)} aria-label="Close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    {modalOpen && step === "form" && (
                        <div className="enroll-modal-step" id="enrollFormStep">
                            <div className="enroll-modal-icon">
                                <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <h2>Enroll in Course</h2>
                            <p className="enroll-modal-course-name" id="enrollCourseName">
                                {enrolling.title}
                            </p>
                            <form id="enrollForm" onSubmit={submitEnrollment}>
                                <div className="form-group">
                                    <label htmlFor="enrollStudentName">Full Name</label>
                                    <input type="text" id="enrollStudentName" value={student ? student.name : ""} readOnly />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="enrollRollNo">Roll Number</label>
                                    <input
                                        type="text"
                                        id="enrollRollNo"
                                        placeholder="Enter your roll number"
                                        required
                                        value={roll}
                                        onChange={(e) => setRoll(e.target.value)}
                                    />
                                </div>
                                <p className="enroll-modal-error" id="enrollFormError">
                                    {formError}
                                </p>
                                <button type="submit" className="enroll-submit-btn" disabled={busy}>
                                    <i className="fa-solid fa-paper-plane"></i> {busy ? "Submitting…" : "Submit"}
                                </button>
                            </form>
                        </div>
                    )}
                    {modalOpen && step === "success" && (
                        <div className="enroll-modal-step" id="enrollSuccessStep">
                            <div className="enroll-modal-icon enroll-modal-icon-success">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <h2>Enrolled Successfully!</h2>
                            <p className="enroll-modal-success-text">
                                Thanks, <span>{student ? student.name : ""}</span> — you&apos;re now enrolled in{" "}
                                <strong>{enrolling.title}</strong>.
                            </p>
                            <div className="enroll-modal-actions">
                                <Link to={startLink} className="enroll-modal-btn enroll-modal-btn-primary">
                                    <i className="fa-solid fa-book"></i> Start Learning Now
                                </Link>
                                <Link to="/stu-dashboard" className="enroll-modal-btn enroll-modal-btn-secondary">
                                    <i className="fa-solid fa-gauge"></i> View Dashboard
                                </Link>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                                Taking you to the course in a couple of seconds...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
