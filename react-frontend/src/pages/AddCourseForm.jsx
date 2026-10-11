import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import useRequireAdmin from "../hooks/useRequireAdmin";
import { useCourses } from "../context/CourseContext";
import { errorMessage } from "../services/api";

const EMPTY = {
    title: "",
    category: "",
    level: "Beginner",
    weeks: "",
    hours: "",
    instructor: "",
    rating: "",
    topics: "",
    outcome: "",
};

export default function AddCourseForm() {
    const ready = useRequireAdmin("/add-course-edit");
    const { addCourse } = useCourses();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));

        if (!f.title || !f.category || !f.level || !f.weeks || !f.hours || !f.instructor || !f.topics || !f.outcome) {
            setError("Please fill in all required fields.");
            return;
        }
        setError("");
        setBusy(true);

        try {
            // The backend builds the id, the section key and the image
            await addCourse({
                title: f.title,
                sectionLabel: f.category,
                level: f.level,
                duration: `${f.weeks} Weeks`,
                hours: `${f.hours} Hours`,
                rating: f.rating || "New",
                instructor: f.instructor,
                topics: f.topics,
                outcome: f.outcome,
            });
            alert("Course added successfully!\n\nCourse: " + f.title + "\n\nSaved to the backend (data/db.json).");
            navigate("/courses");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                navigate("/add-course-edit");
                return;
            }
            setError(errorMessage(err, "Could not save the course."));
            setBusy(false);
        }
    }

    if (!ready) return <PageMeta bodyClassName="" page="add-course" title="Add Course | StudyVerse" />;

    return (
        <>
            <PageMeta bodyClassName="" page="add-course" title="Add Course | StudyVerse" />
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>
                        StudyVerse <span className="admin-tag">Admin</span>
                    </span>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/admin-dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/courses">View Courses Page</Link>
                    </li>
                </ul>
            </nav>
            <main className="admin-main admin-main-narrow">
                <Link to="/admin-dashboard" className="form-back-link">
                    <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                </Link>
                <div className="admin-form-card">
                    <h1>Add New Course</h1>
                    <p className="admin-form-subtitle">Fill in the details below. New courses appear on the dashboard immediately.</p>
                    {error && (
                        <p id="formError" className="auth-error">
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </p>
                    )}
                    <form id="addCourseForm" className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseName">Course Name *</label>
                            <input type="text" id="courseName" placeholder="e.g. Computer Vision Basics" required value={form.title} onChange={set("title")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseCategory">Category *</label>
                            <input type="text" id="courseCategory" placeholder="e.g. Cybersecurity, Cloud Computing" required value={form.category} onChange={set("category")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseLevel">Level *</label>
                            <select id="courseLevel" required value={form.level} onChange={set("level")}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseWeeks">Duration (Weeks) *</label>
                            <input type="number" id="courseWeeks" min="1" placeholder="8" required value={form.weeks} onChange={set("weeks")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseHours">Total Hours *</label>
                            <input type="number" id="courseHours" min="1" placeholder="40" required value={form.hours} onChange={set("hours")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseInstructor">Instructor *</label>
                            <input type="text" id="courseInstructor" placeholder="e.g. Dr. Jane Smith" required value={form.instructor} onChange={set("instructor")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseRating">Rating (out of 5)</label>
                            <input type="number" id="courseRating" min="1" max="5" step="0.1" placeholder="4.8" value={form.rating} onChange={set("rating")} />
                        </div>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseTopics">Topics Covered *</label>
                            <input type="text" id="courseTopics" placeholder="Comma-separated, e.g. Topic A, Topic B, Topic C" required value={form.topics} onChange={set("topics")} />
                        </div>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseOutcome">Learning Outcome *</label>
                            <textarea id="courseOutcome" rows="3" placeholder="What will students be able to do after this course?" required value={form.outcome} onChange={set("outcome")}></textarea>
                        </div>
                        <div className="form-actions form-group-full">
                            <Link to="/admin-dashboard" className="secondary-form-btn">
                                Cancel
                            </Link>
                            <button type="submit" className="primary-btn" disabled={busy}>
                                {busy ? "Saving…" : "Save Course"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
