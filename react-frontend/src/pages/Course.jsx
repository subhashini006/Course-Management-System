import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";

export default function Course() {
    const [params] = useSearchParams();
    const courseId = params.get("course");
    const { student, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [loadState, setState] = useState("loading"); // loading | notfound | ready
    const [course, setCourse] = useState(null);
    const [module, setModule] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [openUnit, setOpenUnit] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // Load the course, its content, and (if logged in) this student's enrollment
    useEffect(() => {
        if (authLoading) return undefined;
        if (!courseId) return undefined;
        let cancelled = false;

        const requests = [api.get(`/api/v1/courses/${encodeURIComponent(courseId)}`), api.get(`/api/v1/courses/${encodeURIComponent(courseId)}/module`)];
        if (student) requests.push(api.get("/api/v1/me/enrollments"));

        Promise.all(requests)
            .then(([courseRes, moduleRes, enrollRes]) => {
                if (cancelled) return;
                setCourse(courseRes.data.data);
                setModule(moduleRes.data.data);
                setEnrollment(enrollRes ? enrollRes.data.data.find((e) => e.courseId === courseId) || null : null);
                setState("ready");
            })
            .catch(() => {
                if (!cancelled) setState("notfound");
            });

        return () => {
            cancelled = true;
        };
    }, [courseId, authLoading, student]);

    // Saves progress on the backend; the backend works out the new status.
    // The tick shows instantly and is rolled back if the save fails.
    async function saveProgress(progress) {
        if (!enrollment || saving) return;
        const previous = enrollment;
        setEnrollment({ ...enrollment, progress: { ...enrollment.progress, ...progress } });
        setSaving(true);
        setSaveError("");
        try {
            const { data } = await api.patch(`/api/v1/enrollments/${enrollment.id}`, { progress });
            setEnrollment(data.data);
        } catch (err) {
            setEnrollment(previous);
            setSaveError(errorMessage(err, "Couldn't save your progress."));
        }
        setSaving(false);
    }

    function toggleUnit(index) {
        const units = [...enrollment.progress.units];
        units[index] = !units[index];
        saveProgress({ units });
    }

    function toggleVideo(e) {
        saveProgress({ video: e.target.checked });
    }

    async function handleLogout(e) {
        e.preventDefault();
        await logout();
        navigate("/stu-login");
    }

    const state = courseId ? loadState : "notfound";
    const isContent = module && module.type === "content";
    const canTrack = !!enrollment;
    const percent = enrollment ? enrollment.progressPercent : 0;
    const units = isContent ? module.units || [] : [];
    const doneUnits = enrollment ? enrollment.progress.units.filter(Boolean).length : 0;
    const completed = canTrack && enrollment.status === "completed";

    return (
        <>
            <PageMeta bodyClassName="" page="course" title={course ? `${course.title} | StudyVerse` : "Course | StudyVerse"} />
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
                        <Link to="/courses">Courses</Link>
                    </li>
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    {student ? (
                        <a href="#" className="login-btn" onClick={handleLogout}>
                            Logout
                        </a>
                    ) : (
                        <Link to="/login-choice" className="login-btn">
                            Login / Register
                        </Link>
                    )}
                </div>
            </nav>

            {state === "loading" && (
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <p>Loading course…</p>
                </div>
            )}

            {state === "notfound" && (
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-circle-question"></i>
                    </div>
                    <h3>Course not found</h3>
                    <p>We couldn&apos;t find that course. It may have been removed by an admin.</p>
                    <Link to="/courses" className="db-empty-btn">
                        Browse Courses
                    </Link>
                </div>
            )}

            {state === "ready" && (
                <div id="courseContent">
                    {/* ================= HERO HEADER ================= */}
                    <section className="course-page-hero">
                        <Link to="/stu-dashboard" className="course-back-link">
                            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                        </Link>
                        <span className="course-page-category">
                            {course.sectionLabel} &middot; {course.level}
                        </span>
                        <h1>{course.title}</h1>
                        <p>
                            <i className="fa-regular fa-clock"></i> {course.duration} &nbsp;&middot;&nbsp;{" "}
                            {isContent ? `${units.length} Units · Self-paced content course` : "Video course"}
                        </p>
                    </section>
                    <div className="course-page-grid">
                        {/* ================= MAIN COLUMN ================= */}
                        <div className="course-page-content">
                            {!canTrack && (
                                <div
                                    className="video-complete-card"
                                    style={{ marginBottom: "22px", background: "#fffbeb", borderColor: "#fde68a" }}
                                >
                                    <div className="video-complete-left" style={{ color: "#92400e" }}>
                                        <i className="fa-solid fa-circle-info"></i>
                                        <span>
                                            {student ? (
                                                <>
                                                    You&apos;re not enrolled in this course, so progress won&apos;t be saved.{" "}
                                                    <Link to="/courses">Enroll from the Courses page</Link>.
                                                </>
                                            ) : (
                                                <>
                                                    <Link to="/stu-login">Log in</Link> and enroll to track your progress.
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {saveError && (
                                <p className="auth-error">
                                    <i className="fa-solid fa-circle-exclamation"></i> {saveError}
                                </p>
                            )}
                            {completed && (
                                <div
                                    className="video-complete-card"
                                    style={{ marginBottom: "22px", background: "#f0fdf4", borderColor: "#bbf7d0" }}
                                >
                                    <div className="video-complete-left" style={{ color: "#15803d" }}>
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>
                                            {isContent
                                                ? "You've completed all units of this course. Great work!"
                                                : "You've marked this course as completed. Great work!"}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="course-overview-text">
                                {module.overview || `Welcome to ${course.title}. Explore the material below at your own pace.`}
                            </div>

                            {/* CONTENT-TYPE COURSE UI */}
                            {isContent && (
                                <div>
                                    <h2 className="course-section-title">
                                        <i className="fa-solid fa-list-ol"></i> Course Content
                                    </h2>
                                    <div className="unit-accordion">
                                        {units.map((u, i) => {
                                            const done = canTrack && enrollment.progress.units[i] === true;
                                            const open = openUnit === i;
                                            return (
                                                <div className={`unit-item${done ? " unit-item--done" : ""}`} key={i}>
                                                    <div className="unit-header" onClick={() => setOpenUnit(open ? null : i)}>
                                                        <div className="unit-header-main">
                                                            <div className="unit-number">{i + 1}</div>
                                                            <div className="unit-title">
                                                                <i className={`fa-solid fa-${u.icon || "circle"}`}></i> Unit {i + 1}: {u.title}
                                                            </div>
                                                        </div>
                                                        <label className="unit-checkbox-label" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={done}
                                                                disabled={!canTrack || saving}
                                                                onChange={() => toggleUnit(i)}
                                                            />
                                                            Mark complete
                                                        </label>
                                                        <i className={`fa-solid fa-chevron-down unit-toggle-icon${open ? " rotated" : ""}`}></i>
                                                    </div>
                                                    <div className={`unit-body${open ? " open" : ""}`}>
                                                        {(u.paragraphs || []).map((p, k) => (
                                                            <p key={k}>{p}</p>
                                                        ))}
                                                        <ul>
                                                            {(u.bullets || []).map((b, k) => (
                                                                <li key={k}>{b}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* VIDEO-TYPE COURSE UI */}
                            {!isContent && (
                                <div>
                                    <h2 className="course-section-title">
                                        <i className="fa-solid fa-circle-play"></i> Course Video
                                    </h2>
                                    <div className="video-wrap">
                                        <video controls key={module.videoSrc}>
                                            <source src={module.videoSrc} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "-14px 0 22px" }}>
                                        Placeholder video — this course&apos;s videoSrc is stored in the backend (data/db.json, under
                                        &quot;modules&quot;).
                                    </p>
                                    <div className="video-complete-card">
                                        <div className="video-complete-left">
                                            <input
                                                type="checkbox"
                                                checked={canTrack && enrollment.progress.video === true}
                                                disabled={!canTrack || saving}
                                                onChange={toggleVideo}
                                            />{" "}
                                            I have watched and completed this course
                                        </div>
                                        <span className={`db-course-status ${completed ? "db-status--done" : "db-status--progress"}`}>
                                            {completed ? "Completed" : "In Progress"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ================= SIDEBAR ================= */}
                        <aside className="course-sidebar">
                            {isContent && (
                                <div className="course-info-card">
                                    <h3>
                                        <i className="fa-solid fa-chart-simple"></i> Your Progress
                                    </h3>
                                    <div className="course-progress-card-top">
                                        <span>
                                            {doneUnits} / {units.length} units completed
                                        </span>
                                        <small>{percent}%</small>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            )}
                            <div className="course-info-card">
                                <h3>
                                    <i className="fa-solid fa-circle-info"></i> Course Details
                                </h3>
                                <div className="course-info-row">
                                    <i className="fa-regular fa-clock"></i> Duration
                                    <strong>{course.duration}</strong>
                                </div>
                                <div className="course-info-row">
                                    <i className="fa-solid fa-signal"></i> Level
                                    <strong>{course.level}</strong>
                                </div>
                                <div className="course-info-row">
                                    <i className="fa-solid fa-tag"></i> Category
                                    <strong>{course.sectionLabel}</strong>
                                </div>
                                <div className="course-info-row">
                                    <i className="fa-solid fa-shapes"></i> Format
                                    <strong>{isContent ? "Self-paced content" : "Video course"}</strong>
                                </div>
                            </div>
                            {module.topics && module.topics.length > 0 && (
                                <div className="course-info-card">
                                    <h3>
                                        <i className="fa-solid fa-graduation-cap"></i> What You&apos;ll Learn
                                    </h3>
                                    <ul className="course-topics-list">
                                        {module.topics.map((t, i) => (
                                            <li key={i}>
                                                <i className="fa-solid fa-circle-check"></i> {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
