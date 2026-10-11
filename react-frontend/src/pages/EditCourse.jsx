import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import Footer from "../components/Footer";
import useRequireAdmin from "../hooks/useRequireAdmin";
import { useCourses } from "../context/CourseContext";
import api, { errorMessage } from "../services/api";

const DEFAULT_SECTIONS = [
    { value: "ai", label: "Artificial Intelligence" },
    { value: "ml", label: "Machine Learning" },
    { value: "ds", label: "Data Science" },
    { value: "nlp", label: "Natural Language Processing" },
];

export default function EditCourse() {
    const [params] = useSearchParams();
    const courseId = params.get("course") || "";
    const ready = useRequireAdmin(`/edit-course-login?course=${encodeURIComponent(courseId)}`);
    const { courses, updateCourse, deleteCourse } = useCourses();
    const navigate = useNavigate();

    const [loadStatus, setStatus] = useState("loading"); // loading | ready | notfound
    const [form, setForm] = useState(null);
    const [learn, setLearn] = useState([""]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // Load this course from the backend into the form
    useEffect(() => {
        if (!ready) return undefined;
        if (!courseId) return undefined;
        let cancelled = false;
        api.get(`/api/v1/courses/${encodeURIComponent(courseId)}`)
            .then(({ data: res }) => {
                if (cancelled) return;
                const c = res.data;
                setForm({
                    title: c.title || "",
                    instructor: c.instructor || "",
                    // The form shows duration and hours together, e.g. "8 Weeks · 40 Hours"
                    duration: [c.duration, c.hours].filter(Boolean).join(" · "),
                    rating: c.rating || "",
                    level: c.level || "Beginner",
                    section: c.section || "ai",
                    sectionLabel: c.sectionLabel || "",
                    image: c.image || "",
                    topics: c.topics || "",
                    prereqs: c.prereqs || "",
                });
                setLearn(c.learn && c.learn.length ? c.learn : [""]);
                setStatus("ready");
            })
            .catch(() => {
                if (!cancelled) setStatus("notfound");
            });
        return () => {
            cancelled = true;
        };
    }, [ready, courseId]);

    const status = courseId ? loadStatus : "notfound";

    if (!ready) return <PageMeta bodyClassName="" page="edit-course" title="Edit Course | StudyVerse" />;

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    // Section choices: the defaults plus every category already used by a course
    const sectionOptions = [...DEFAULT_SECTIONS];
    courses.forEach((c) => {
        if (!sectionOptions.some((o) => o.value === c.section)) {
            sectionOptions.push({ value: c.section, label: c.sectionLabel || c.section });
        }
    });
    if (form && !sectionOptions.some((o) => o.value === form.section)) {
        sectionOptions.push({ value: form.section, label: form.sectionLabel || form.section });
    }

    function handleFailure(err, fallback) {
        if (err.response && err.response.status === 401) {
            navigate(`/edit-course-login?course=${encodeURIComponent(courseId)}`);
            return;
        }
        setError(errorMessage(err, fallback));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);

        // "8 Weeks · 40 Hours" -> duration "8 Weeks", hours "40 Hours"
        const [duration, hours] = form.duration.split("·").map((s) => s.trim());
        const option = sectionOptions.find((o) => o.value === form.section);

        try {
            await updateCourse(courseId, {
                title: form.title.trim(),
                instructor: form.instructor.trim(),
                duration: duration || "",
                hours: hours || "",
                rating: form.rating.trim(),
                level: form.level,
                section: form.section,
                sectionLabel: option ? option.label : form.sectionLabel,
                image: form.image.trim(),
                topics: form.topics.trim(),
                prereqs: form.prereqs.trim(),
                learn: learn.map((l) => l.trim()).filter(Boolean),
            });
            alert("Changes saved successfully!\n\nCourse: " + form.title.trim());
            navigate("/courses");
        } catch (err) {
            handleFailure(err, "Could not save your changes.");
            setBusy(false);
        }
    }

    async function handleDelete() {
        const name = form.title.trim() || courseId.toUpperCase();
        if (!confirm('Are you sure you want to delete "' + name + '"?\n\nThis action cannot be undone.')) return;
        try {
            await deleteCourse(courseId);
            alert("Course deleted successfully.");
            navigate("/courses");
        } catch (err) {
            handleFailure(err, "Could not delete the course.");
        }
    }

    return (
        <>
            <PageMeta bodyClassName="" page="edit-course" title="Edit Course | StudyVerse" />
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
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <Link to="/admin-dashboard" className="login-btn">
                        Admin Dashboard
                    </Link>
                </div>
            </nav>
            {/* ================= PAGE HEADER ================= */}
            <div className="ec-page-header">
                <div className="ec-breadcrumb">
                    <Link to="/courses">
                        <i className="fa-solid fa-arrow-left"></i> Back to Courses
                    </Link>
                </div>
                {status === "ready" ? (
                    <>
                        <h1>Edit: {form.title}</h1>
                        <p>Course ID: {courseId.toUpperCase()}</p>
                    </>
                ) : status === "notfound" ? (
                    <>
                        <h1>Course not found</h1>
                        <p>We couldn&apos;t find a course with that ID. It may have been deleted.</p>
                    </>
                ) : (
                    <>
                        <h1>Edit Course</h1>
                        <p>Loading…</p>
                    </>
                )}
            </div>
            {/* ================= EDIT FORM ================= */}
            {status === "ready" && (
                <main className="ec-main">
                    <form className="ec-form" id="editCourseForm" onSubmit={handleSubmit}>
                        {error && (
                            <p className="auth-error">
                                <i className="fa-solid fa-circle-exclamation"></i> {error}
                            </p>
                        )}
                        {/* ===== BASIC INFO ===== */}
                        <div className="ec-section">
                            <h2>
                                <i className="fa-solid fa-circle-info"></i> Basic Information
                            </h2>
                            <div className="ec-grid-2">
                                <div className="ec-field">
                                    <label htmlFor="ecTitle">Course Title</label>
                                    <input type="text" id="ecTitle" placeholder="e.g. Introduction to AI" required value={form.title} onChange={set("title")} />
                                </div>
                                <div className="ec-field">
                                    <label htmlFor="ecInstructor">Instructor Name</label>
                                    <input type="text" id="ecInstructor" placeholder="e.g. Dr. Alan Turing" value={form.instructor} onChange={set("instructor")} />
                                </div>
                                <div className="ec-field">
                                    <label htmlFor="ecDuration">Duration</label>
                                    <input type="text" id="ecDuration" placeholder="e.g. 8 Weeks · 40 Hours" value={form.duration} onChange={set("duration")} />
                                </div>
                                <div className="ec-field">
                                    <label htmlFor="ecRating">Rating</label>
                                    <input type="text" id="ecRating" placeholder="e.g. 4.8" value={form.rating} onChange={set("rating")} />
                                </div>
                                <div className="ec-field">
                                    <label htmlFor="ecLevel">Difficulty Level</label>
                                    <select id="ecLevel" value={form.level} onChange={set("level")}>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="ec-field">
                                    <label htmlFor="ecSection">Section / Category</label>
                                    <select id="ecSection" value={form.section} onChange={set("section")}>
                                        {sectionOptions.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* ===== COURSE IMAGE ===== */}
                        <div className="ec-section">
                            <h2>
                                <i className="fa-solid fa-image"></i> Course Image
                            </h2>
                            <div className="ec-grid-2">
                                <div className="ec-field">
                                    <label htmlFor="ecImage">Image URL</label>
                                    <input type="text" id="ecImage" placeholder="https://..." value={form.image} onChange={set("image")} />
                                </div>
                                <div className="ec-img-preview">
                                    {form.image ? (
                                        <img id="ecImgPreview" src={form.image} alt="Preview" style={{ display: "block" }} />
                                    ) : (
                                        <span id="ecImgPlaceholder">
                                            <i className="fa-solid fa-image"></i> Preview
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ===== WHAT YOU'LL LEARN ===== */}
                        <div className="ec-section">
                            <h2>
                                <i className="fa-solid fa-bullseye"></i> What You&apos;ll Learn
                            </h2>
                            <div className="ec-learn-list" id="ecLearnList">
                                {learn.map((item, i) => (
                                    <div className="ec-learn-row" key={i}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Build a neural network from scratch"
                                            value={item}
                                            onChange={(e) => setLearn((prev) => prev.map((v, k) => (k === i ? e.target.value : v)))}
                                        />
                                        <button type="button" className="ec-remove-btn" onClick={() => setLearn((prev) => prev.filter((_, k) => k !== i))}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="ec-add-btn" onClick={() => setLearn((prev) => [...prev, ""])}>
                                <i className="fa-solid fa-plus"></i> Add Learning Outcome
                            </button>
                        </div>
                        {/* ===== TOPICS COVERED ===== */}
                        <div className="ec-section">
                            <h2>
                                <i className="fa-solid fa-list-check"></i> Topics Covered
                            </h2>
                            <div className="ec-field">
                                <label htmlFor="ecTopics">
                                    Topics <span className="ec-hint">(comma separated)</span>
                                </label>
                                <input type="text" id="ecTopics" placeholder="e.g. CNNs, RNNs, Transfer Learning" value={form.topics} onChange={set("topics")} />
                            </div>
                        </div>
                        {/* ===== PREREQUISITES ===== */}
                        <div className="ec-section">
                            <h2>
                                <i className="fa-solid fa-circle-check"></i> Prerequisites
                            </h2>
                            <div className="ec-field">
                                <label htmlFor="ecPrereqs">Prerequisites</label>
                                <textarea id="ecPrereqs" rows="2" placeholder="e.g. Basic Python and high school mathematics required." value={form.prereqs} onChange={set("prereqs")}></textarea>
                            </div>
                        </div>
                        {/* ===== ACTIONS ===== */}
                        <div className="ec-actions">
                            <button type="submit" className="ec-save-btn" disabled={busy}>
                                <i className="fa-solid fa-floppy-disk"></i> {busy ? "Saving…" : "Save Changes"}
                            </button>
                            <Link to="/courses" className="ec-cancel-btn">
                                Cancel
                            </Link>
                            <button type="button" id="ecDeleteBtn" className="ec-delete-btn" onClick={handleDelete}>
                                <i className="fa-solid fa-trash"></i> Delete Course
                            </button>
                        </div>
                    </form>
                </main>
            )}
            {status === "notfound" && (
                <main className="ec-main">
                    <div className="db-empty-state">
                        <div className="db-empty-icon">
                            <i className="fa-solid fa-circle-question"></i>
                        </div>
                        <h3>Nothing to edit here</h3>
                        <p>Pick a course from the catalog to edit it.</p>
                        <Link to="/courses" className="db-empty-btn">
                            Back to Courses
                        </Link>
                    </div>
                </main>
            )}
            <Footer />
        </>
    );
}
