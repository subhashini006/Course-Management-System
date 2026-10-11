import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import api, { errorMessage } from "../services/api";

const EMPTY = { username: "", name: "", email: "", department: "", password: "", confirm: "" };

export default function StudentRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (Object.values(form).some((v) => !v.trim())) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }

        setBusy(true);
        try {
            const { confirm, ...payload } = form; // eslint-disable-line no-unused-vars
            await api.post("/api/v1/students", payload);
            alert("Account created successfully! Please log in.");
            navigate("/stu-login");
        } catch (err) {
            setError(errorMessage(err, "Could not create your account."));
            setBusy(false);
        }
    }

    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="stu-register" title="Register | StudyVerse" />
            <div className="split-wrapper">
                {/* ================= LEFT SIDE CONTENT ================= */}
                <div className="auth-side auth-side-top">
                    <Link to="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i> Back to Home
                    </Link>
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h2>Start your learning journey today.</h2>
                    <p>
                        Create a free account and get instant access to expert-led courses, hands-on projects, and
                        certificates.
                    </p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Free access to starter courses
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Personalized learning dashboard
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Join a community of 1500+ learners
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Learn at your own pace, anytime
                        </li>
                    </ul>
                    <div className="auth-side-stats">
                        <div>
                            <h3>1500+</h3>
                            <span>Students</span>
                        </div>
                        <div>
                            <h3>120+</h3>
                            <span>Courses</span>
                        </div>
                        <div>
                            <h3>40+</h3>
                            <span>Faculty</span>
                        </div>
                    </div>
                </div>
                {/* ================= RIGHT SIDE FORM ================= */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active" id="studentPanel">
                            <h1 className="auth-title">Student Registration</h1>
                            <p className="auth-subtitle">Create an account to start learning.</p>
                            {error && (
                                <p className="auth-error">
                                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                                </p>
                            )}
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <label htmlFor="studentUsername">Username</label>
                                <input type="text" id="studentUsername" placeholder="johndoe23" value={form.username} onChange={set("username")} />
                                <label htmlFor="studentName">Full Name</label>
                                <input type="text" id="studentName" placeholder="John Doe" value={form.name} onChange={set("name")} />
                                <label htmlFor="studentEmail">Email Address</label>
                                <input type="email" id="studentEmail" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                                <label htmlFor="studentDepartment">Department</label>
                                <input type="text" id="studentDepartment" placeholder="e.g. Computer Science" value={form.department} onChange={set("department")} />
                                <label htmlFor="studentPassword">Password</label>
                                <input type="password" id="studentPassword" placeholder="••••••••" value={form.password} onChange={set("password")} />
                                <label htmlFor="studentConfirmPassword">Confirm Password</label>
                                <input type="password" id="studentConfirmPassword" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} />
                                <button type="submit" className="auth-submit" disabled={busy}>
                                    {busy ? "Creating account…" : "Create Account"}
                                </button>
                            </form>
                            <p className="auth-footer-text">
                                Already have an account? <Link to="/stu-login">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
