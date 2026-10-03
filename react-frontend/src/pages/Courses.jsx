import { useEffect, useState } from "react";
import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";
import { API_BASE } from "../api";

const SECTION_META = {
    ai: { label: "Artificial Intelligence", tag: "AI", icon: "fa-robot" },
    ml: { label: "Machine Learning", tag: "ML", icon: "fa-brain" },
};

function badgeClass(level) {
    if (level === "Intermediate") return "c-badge c-badge-inter";
    if (level === "Advanced") return "c-badge c-badge-adv";
    return "c-badge";
}

// Preserves the order sections first appear in the API response,
// grouping courses under their "section" field (e.g. "ai", "ml").
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
    // null = still loading, [] / [...] = loaded, error set = fetch failed
    const [courses, setCourses] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`${API_BASE}/courses`)
            .then((res) => {
                if (!res.ok) throw new Error(`API returned ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setCourses(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || "Network error");
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const sections = courses ? groupBySection(courses) : [];

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
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="/courses" className="active-nav">Courses</a>
                    </li>
                    <li id="notifNavItem">
                        <a href="notifications.html">Notifications</a>
                    </li>
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                    <li>
                        <a href="/add-course-edit">Add Course</a>
                    </li>
                </ul>
                <div className="nav-buttons" id="navAuthArea">
                    <a href="/login-choice" className="login-btn">Login / Register</a>
                </div>
            </nav>
            {/* ================= PAGE HEADER ================= */}
            <section className="courses-hero">
                <h1>Explore Our Courses</h1>
                <p>Handpicked courses across the most in-demand tech domains — start learning today.</p>
                <div className="courses-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="courseSearch" placeholder="Search courses..." />
                </div>
            </section>
            {/* ================= COURSES CONTENT (fetched from the mock API) ================= */}
            <main className="courses-main">
                {error && (
                    <div className="course-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p style={{ color: "#c0392b", fontWeight: 600 }}>
                            Couldn&apos;t load courses from the API ({error}).
                        </p>
                        <p style={{ color: "var(--text-muted)" }}>
                            Make sure the mock API is running — open a terminal in the <code>mockapi</code> folder
                            and run <code>npm start</code>, then refresh this page.
                        </p>
                    </div>
                )}

                {!error && !courses && (
                    <div className="course-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p>Loading courses…</p>
                    </div>
                )}

                {sections.map(({ section, items }) => {
                    const meta = SECTION_META[section] || {
                        label: section,
                        tag: section.toUpperCase(),
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
                                            {meta.label} <span className="section-tag">{meta.tag}</span>
                                        </h2>
                                        <p className="section-count">{items.length} Courses</p>
                                    </div>
                                </div>
                                <a href="/add-course-edit" className="admin-section-btn">
                                    <i className="fa-solid fa-plus"></i> Add Course
                                </a>
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
                                                <button
                                                    type="button"
                                                    className="enroll-btn"
                                                    onClick={(e) => window.openEnrollModal(e.currentTarget)}
                                                >
                                                    <i className="fa-solid fa-graduation-cap"></i> Enroll
                                                </button>
                                                <a
                                                    href={`/edit-course-login?course=${course.id}`}
                                                    className="admin-edit-btn"
                                                    title="Edit Course"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </a>
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
                                                        <strong>Duration:</strong> {course.duration} &middot; {course.hours}
                                                    </p>
                                                    <p>
                                                        <strong>Topics:</strong> {course.topics}
                                                    </p>
                                                    <p>
                                                        <strong>Outcome:</strong> {course.outcome}
                                                    </p>
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
            {/* ================= FOOTER ================= */}
            <footer>
                <div className="footer-content">
                    <div>
                        <h2>StudyVerse</h2>
                        <p>Your trusted online learning platform.</p>
                    </div>
                    <div>
                        <h3>Quick Links</h3>
                        <p>Home</p>
                        <p>Courses</p>
                        <p>About</p>
                        <p>Contact</p>
                    </div>
                    <div>
                        <h3>Contact</h3>
                        <p>Email : support@StudyVerse.com</p>
                        <p>Phone : +91 9876543210</p>
                    </div>
                    <div>
                        <h3>Follow Us</h3>
                        <i className="fab fa-facebook"></i>
                        <i className="fab fa-instagram"></i>
                        <i className="fab fa-linkedin"></i>
                        <i className="fab fa-github"></i>
                    </div>
                </div>
                <hr />
                <p className="copyright">© 2026 StudyVerse | Student Course Management System</p>
            </footer>
            {/* ================= ENROLLMENT MODAL ================= */}
            <div className="enroll-modal-overlay" id="enrollModalOverlay">
                <div className="enroll-modal">
                    <button type="button" className="enroll-modal-close" onClick={() => window.closeEnrollModal()} aria-label="Close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    {/* Step 1 : Enrollment form */}
                    <div className="enroll-modal-step" id="enrollFormStep">
                        <div className="enroll-modal-icon">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h2>Enroll in Course</h2>
                        <p className="enroll-modal-course-name" id="enrollCourseName">Course Name</p>
                        <form id="enrollForm" onSubmit={(e) => { const keepGoing = window.submitEnrollment(e); if (keepGoing === false) e.preventDefault(); }}>
                            <div className="form-group">
                                <label htmlFor="enrollStudentName">Full Name</label>
                                <input type="text" id="enrollStudentName" placeholder="Enter your full name" required="" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="enrollRollNo">Roll Number</label>
                                <input type="text" id="enrollRollNo" placeholder="Enter your roll number" required="" />
                            </div>
                            <p className="enroll-modal-error" id="enrollFormError"></p>
                            <button type="submit" className="enroll-submit-btn">
                                <i className="fa-solid fa-paper-plane"></i>
                                 Submit
                    
                            </button>
                        </form>
                    </div>
                    {/* Step 2 : Success */}
                    <div className="enroll-modal-step" id="enrollSuccessStep" style={{display: "none"}}>
                        <div className="enroll-modal-icon enroll-modal-icon-success">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <h2>Enrolled Successfully!</h2>
                        <p className="enroll-modal-success-text">
                                                Thanks, 
                            <span id="enrollSuccessName"></span>
                             — you're now enrolled in
                    
                            <strong id="enrollSuccessCourse"></strong>
                            .
                
                        </p>
                        <div className="enroll-modal-actions">
                            <a href="#" id="startLearningBtn" className="enroll-modal-btn enroll-modal-btn-primary">
                                <i className="fa-solid fa-book"></i>
                                 Start Learning Now
                    
                            </a>
                            <a href="/stu-dashboard" className="enroll-modal-btn enroll-modal-btn-secondary">
                                <i className="fa-solid fa-gauge"></i>
                                 View Dashboard
                    
                            </a>
                        </div>
                        <p id="autoRedirectNote" style={{fontSize: "12px", color: "var(--text-muted)", marginTop: "12px"}}></p>
                    </div>
                </div>
            </div>
            {courses && <LegacyScript />}
        </>
    );
}
