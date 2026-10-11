import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import useRequireAdmin from "../hooks/useRequireAdmin";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CourseContext";
import api, { errorMessage } from "../services/api";

function LevelBadge({ level }) {
    const cls = level === "Beginner" ? "beg" : level === "Intermediate" ? "int" : "adv";
    return <span className={`tbl-badge tbl-badge--${cls}`}>{level}</span>;
}

export default function AdminDashboard() {
    const ready = useRequireAdmin("/admin-login");
    const { logout } = useAuth();
    const { courses, refresh, deleteCourse } = useCourses();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [message, setMessage] = useState("");

    const loadEnrollments = useCallback(async () => {
        try {
            const { data } = await api.get("/api/v1/enrollments");
            setEnrollments(data.data);
        } catch (err) {
            setMessage(errorMessage(err));
        }
    }, []);

    useEffect(() => {
        if (!ready) return;
        refresh();
        loadEnrollments();
    }, [ready, refresh, loadEnrollments]);

    // A 401 means the admin session has ended — send them back to log in
    function handleFailure(err) {
        if (err.response && err.response.status === 401) navigate("/admin-login");
        else setMessage(errorMessage(err));
    }

    async function handleDelete(course) {
        if (!confirm("Delete this course? This cannot be undone.")) return;
        try {
            await deleteCourse(course.id);
            await loadEnrollments(); // its enrollments are removed with it
            setMessage("");
        } catch (err) {
            handleFailure(err);
        }
    }

    async function handleClearEnrollments() {
        if (!confirm("Clear all enrollment data? This cannot be undone.")) return;
        try {
            await api.delete("/api/v1/enrollments");
            await loadEnrollments();
            setMessage("");
        } catch (err) {
            handleFailure(err);
        }
    }

    async function handleLogout(e) {
        e.preventDefault();
        await logout();
        navigate("/courses");
    }

    if (!ready) return <PageMeta bodyClassName="" page="admin-dashboard" title="Admin Dashboard | StudyVerse" />;

    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter((e) => e.status === "completed").length;
    const pct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

    return (
        <>
            <PageMeta bodyClassName="" page="admin-dashboard" title="Admin Dashboard | StudyVerse" />
            {/* ================= NAVBAR ================= */}
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>
                        StudyVerse <span className="admin-tag">Admin</span>
                    </span>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/admin-dashboard" className="active-nav">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/courses">View Courses Page</Link>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="#" className="login-btn" id="logoutBtn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </a>
                </div>
            </nav>
            <main className="admin-main">
                <div className="admin-header">
                    <div>
                        <h1>Welcome back, Admin</h1>
                        <p>Here&apos;s what&apos;s happening across your course catalog.</p>
                    </div>
                    <Link to="/add-course" className="primary-btn admin-add-btn">
                        <i className="fa-solid fa-plus"></i> Add New Course
                    </Link>
                </div>
                {message && (
                    <p className="auth-error">
                        <i className="fa-solid fa-circle-exclamation"></i> {message}
                    </p>
                )}
                {/* ========== STATS ========== */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <div>
                            <h3>{courses.length}</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: "#f0fdf4" }}>
                            <i className="fa-solid fa-user-graduate" style={{ color: "#22c55e" }}></i>
                        </div>
                        <div>
                            <h3>{totalEnrolled}</h3>
                            <p>Total Enrolled</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: "#eff6ff" }}>
                            <i className="fa-solid fa-circle-check" style={{ color: "#3b82f6" }}></i>
                        </div>
                        <div>
                            <h3>{totalCompleted}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="admin-stat-card admin-stat-progress">
                        <div className="admin-stat-icon" style={{ background: "#f5ede4" }}>
                            <i className="fa-solid fa-chart-line" style={{ color: "#9a6f49" }}></i>
                        </div>
                        <div className="admin-stat-progress-body">
                            <p>Overall Progress</p>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{pct}%</span>
                        </div>
                    </div>
                </div>
                {/* ========== COURSES TABLE ========== */}
                <div className="admin-table-wrap">
                    <div className="admin-table-header">
                        <h2>All Courses</h2>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Duration</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td className="admin-table-empty" colSpan="7">
                                        No courses found.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <strong>{c.title}</strong>
                                        </td>
                                        <td>{c.sectionLabel}</td>
                                        <td>
                                            <LevelBadge level={c.level} />
                                        </td>
                                        <td>{c.duration}</td>
                                        <td>
                                            <i className="fa-solid fa-star" style={{ color: "var(--accent)", fontSize: "11px", marginRight: "3px" }}></i>
                                            {c.rating}
                                        </td>
                                        <td>
                                            <div className="tbl-actions">
                                                <Link to={`/edit-course-login?course=${encodeURIComponent(c.id)}`} className="tbl-edit-btn">
                                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                                </Link>
                                                <button className="tbl-delete-btn" onClick={() => handleDelete(c)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* ========== ENROLLMENTS TABLE ========== */}
                <div className="admin-table-wrap" style={{ marginTop: "30px" }}>
                    <div className="admin-table-header">
                        <h2>Enrollment Details</h2>
                        <button className="clear-all-btn" onClick={handleClearEnrollments}>
                            <i className="fa-solid fa-trash"></i> Clear All
                        </button>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td className="admin-table-empty" colSpan="4">
                                        No enrollments yet.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((en) => {
                                    const done = en.status === "completed";
                                    return (
                                        <tr key={en.id}>
                                            <td>
                                                <strong>{en.courseName}</strong>
                                            </td>
                                            <td>{en.name}</td>
                                            <td>{en.roll}</td>
                                            <td>
                                                <span className={`db-course-status ${done ? "db-status--done" : "db-status--progress"}`}>
                                                    {done ? "Completed" : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
