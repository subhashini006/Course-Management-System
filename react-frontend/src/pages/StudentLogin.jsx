import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";

export default function StudentLogin() {
    const { loginStudent } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await loginStudent(email.trim(), password);
            navigate("/courses");
        } catch (err) {
            setError(errorMessage(err, "Invalid email or password."));
            setBusy(false);
        }
    }

    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="stu-login" title="Login | StudyVerse" />
            <Link to="/" className="back-link">
                <i className="fa-solid fa-arrow-left"></i> Back to Home
            </Link>
            <div className="split-wrapper">
                {/* ================= LEFT SIDE CONTENT ================= */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h2>Pick up right where you left off.</h2>
                    <p>Sign in to access your courses, track your progress, and continue building skills that matter.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Access 120+ industry-ready courses
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Track your learning progress anytime
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Earn certificates upon completion
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i> Learn from experienced instructors
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
                            <h3>98%</h3>
                            <span>Success Rate</span>
                        </div>
                    </div>
                </div>
                {/* ================= RIGHT SIDE FORM ================= */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active" id="studentPanel">
                            <h1 className="auth-title">Student Login</h1>
                            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
                            {error && (
                                <p className="auth-error">
                                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                                </p>
                            )}
                            <form className="auth-form" id="studentLoginForm" onSubmit={handleSubmit}>
                                <label htmlFor="studentEmail">Email Address</label>
                                <input
                                    type="email"
                                    id="studentEmail"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="studentPassword">Password</label>
                                <input
                                    type="password"
                                    id="studentPassword"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="auth-forgot" style={{ fontSize: "12px", marginTop: "1px", marginBottom: "3px" }}>
                                    <Link to="/forgot-password">Forgot Password?</Link>
                                </p>
                                <button type="submit" className="auth-submit" disabled={busy}>
                                    {busy ? "Signing in…" : "Sign In"}
                                </button>
                            </form>
                            <p className="auth-footer-text">
                                Don&apos;t have an account? <Link to="/stu-register">Register here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
