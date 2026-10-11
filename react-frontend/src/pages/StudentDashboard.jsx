import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";

function EmptyState({ icon, title, message, buttonText }) {
    return (
        <div className="db-empty-state">
            <div className="db-empty-icon">
                <i className={`fa-solid fa-${icon}`}></i>
            </div>
            <h3>{title}</h3>
            <p>{message}</p>
            <Link to="/courses" className="db-empty-btn">
                {buttonText}
            </Link>
        </div>
    );
}

// Small SVG ring showing overall completion percentage
function ProgressRing({ pct }) {
    const size = 108;
    const stroke = 12;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text
                x={size / 2}
                y={size / 2 + 7}
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="var(--navy)"
                fontFamily="Inter, sans-serif"
            >
                {pct}%
            </text>
        </svg>
    );
}

export default function StudentDashboard() {
    const { student, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!student) {
            navigate("/stu-login");
            return;
        }
        api.get("/api/v1/me/enrollments")
            .then(({ data }) => setEnrollments(data.data))
            .catch((err) => setError(errorMessage(err)));
    }, [authLoading, student, navigate]);

    if (!student) {
        return <PageMeta bodyClassName="" page="stu-dashboard" title="My Dashboard | StudyVerse" />;
    }

    const list = enrollments || [];
    const inProgress = list.filter((e) => e.status === "in-progress");
    const completed = list.filter((e) => e.status === "completed");
    const overallPct = list.length > 0 ? Math.round((completed.length / list.length) * 100) : 0;

    return (
        <>
            <PageMeta bodyClassName="" page="stu-dashboard" title="My Dashboard | StudyVerse" />
            <StudentNav />
            {/* ================= DASHBOARD HEADER ================= */}
            <div className="db-header">
                <div className="db-header-inner">
                    <div className="db-welcome">
                        <div className="db-avatar">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div>
                            <p className="db-greeting">Welcome back,</p>
                            <h1 className="db-name">{student.name}</h1>
                            <p className="db-meta">
                                <i className="fa-solid fa-envelope"></i>
                                <span>{student.email}</span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <Link to="/courses" className="db-explore-btn">
                            <i className="fa-solid fa-magnifying-glass"></i> Explore Courses
                        </Link>
                    </div>
                </div>
            </div>
            {/* ================= MAIN CONTENT ================= */}
            <main className="db-main">
                {error && (
                    <p className="auth-error">
                        <i className="fa-solid fa-circle-exclamation"></i> {error}
                    </p>
                )}
                {/* ===== OVERALL PROGRESS ===== */}
                <section className="db-section db-section--full" style={{ marginBottom: "24px" }}>
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-bullseye"></i> Overall Completion
                        </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", padding: "6px 2px" }}>
                        <div style={{ flexShrink: 0 }}>
                            <ProgressRing pct={overallPct} />
                        </div>
                        <div style={{ flex: 1, minWidth: "220px" }}>
                            <div className="course-progress-card" style={{ marginBottom: 0 }}>
                                <div className="course-progress-card-top">
                                    <span>
                                        {completed.length} of {list.length} courses completed
                                    </span>
                                    <small>{overallPct}%</small>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${overallPct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ===== STAT CARDS ===== */}
                <div className="db-stats-row">
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--blue">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Enrolled Courses</span>
                            <span className="db-stat-value">{list.length}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--green">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Completed</span>
                            <span className="db-stat-value">{completed.length}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--amber">
                            <i className="fa-solid fa-spinner"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">In Progress</span>
                            <span className="db-stat-value">{inProgress.length}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--accent">
                            <i className="fa-solid fa-certificate"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Certificates</span>
                            <span className="db-stat-value">{completed.length}</span>
                        </div>
                    </div>
                </div>
                {/* ===== TWO COLUMN LAYOUT ===== */}
                <div className="db-grid">
                    {/* LEFT: Learning Progress */}
                    <section className="db-section">
                        <div className="db-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h2>
                                <i className="fa-solid fa-chart-line"></i> Learning Progress
                            </h2>
                        </div>
                        <div>
                            {inProgress.length === 0 ? (
                                <EmptyState
                                    icon="chart-line"
                                    title="No courses in progress"
                                    message="Once you enrol in a course, your progress will appear here."
                                    buttonText="Browse Courses"
                                />
                            ) : (
                                inProgress.map((course) => (
                                    <div className="db-course-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }} key={course.id}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                            <div className="db-course-item-left">
                                                <div className="db-course-item-icon">
                                                    <i className="fa-solid fa-book-open"></i>
                                                </div>
                                                <div>
                                                    <p className="db-course-item-name">{course.courseName}</p>
                                                    <p className="db-course-item-meta">
                                                        <i className="fa-solid fa-user"></i> {course.name} &nbsp;·&nbsp;{" "}
                                                        <i className="fa-solid fa-id-card"></i> {course.roll}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/course?course=${encodeURIComponent(course.courseId)}`}
                                                className="db-complete-btn"
                                                style={{ textDecoration: "none" }}
                                            >
                                                <i className="fa-solid fa-play"></i> Continue
                                            </Link>
                                        </div>
                                        <div>
                                            <div className="progress-track">
                                                <div className="progress-fill" style={{ width: `${course.progressPercent}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{course.progressPercent}% complete</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                    {/* RIGHT: My Courses */}
                    <section className="db-section">
                        <div className="db-section-header">
                            <h2>
                                <i className="fa-solid fa-book-open"></i> My Courses
                            </h2>
                        </div>
                        <div>
                            {list.length === 0 ? (
                                <EmptyState
                                    icon="book-bookmark"
                                    title="No courses enrolled yet"
                                    message="Enrol in your first course to see it listed here."
                                    buttonText="Start Learning"
                                />
                            ) : (
                                list.map((course) => {
                                    const done = course.status === "completed";
                                    return (
                                        <div className="db-course-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }} key={course.id}>
                                            <div className="db-course-item-left">
                                                <div className={`db-course-item-icon ${done ? "db-course-item-icon--done" : ""}`}>
                                                    <i className={`fa-solid fa-${done ? "circle-check" : "book-open"}`}></i>
                                                </div>
                                                <div>
                                                    <p className="db-course-item-name">{course.courseName}</p>
                                                    <span className={`db-course-status ${done ? "db-status--done" : "db-status--progress"}`}>
                                                        {done ? "Completed" : "In Progress"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${course.progressPercent}%` }}></div>
                                                </div>
                                                <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{course.progressPercent}% complete</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
                {/* ===== COMPLETED COURSES ===== */}
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-trophy"></i> Completed Courses
                        </h2>
                    </div>
                    <div>
                        {completed.length === 0 ? (
                            <EmptyState
                                icon="trophy"
                                title="No completions yet"
                                message="Courses you finish will appear here along with your certificates."
                                buttonText="Explore Courses"
                            />
                        ) : (
                            completed.map((course) => (
                                <div className="db-course-item" key={course.id}>
                                    <div className="db-course-item-left">
                                        <div className="db-course-item-icon db-course-item-icon--done">
                                            <i className="fa-solid fa-circle-check"></i>
                                        </div>
                                        <div>
                                            <p className="db-course-item-name">{course.courseName}</p>
                                            <p className="db-course-item-meta">
                                                <i className="fa-solid fa-user"></i> {course.name} &nbsp;·&nbsp;{" "}
                                                <i className="fa-solid fa-id-card"></i> {course.roll}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/certificate?course=${encodeURIComponent(course.courseId)}`}
                                        className="db-cert-badge"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <i className="fa-solid fa-certificate"></i> View Certificate
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
