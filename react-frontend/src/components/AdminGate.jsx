import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "./PageMeta";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";

// The "Verify Admin Access" screen. The email/password check now happens on
// the backend; on success the backend sets an admin session cookie and we
// move on to `target`. If you're already signed in as admin we skip straight there.
//
// variant "full" -> sign in to the whole admin area
// variant "edit" -> shown before editing a specific course
export default function AdminGate({ target, variant = "full", page }) {
    const { isAdmin, loading, loginAdmin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const edit = variant === "edit";

    useEffect(() => {
        if (!loading && isAdmin) navigate(target, { replace: true });
    }, [loading, isAdmin, target, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await loginAdmin(email.trim(), password);
            navigate(target);
        } catch (err) {
            setError(errorMessage(err, "Invalid credentials. Please try again."));
            setBusy(false);
        }
    }

    return (
        <>
            <PageMeta bodyClassName="auth-body split" page={page} title="Verify Admin Access | StudyVerse" />
            <Link to={edit ? "/courses" : "/"} className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                {edit ? " Back to Courses" : " Back to Home"}
            </Link>
            <div className="split-wrapper">
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    {edit ? (
                        <>
                            <h2>Confirm it&apos;s you before editing course content.</h2>
                            <p>This action changes what students see. Sign in with your admin account to continue.</p>
                            <ul className="auth-side-list">
                                <li>
                                    <i className="fa-solid fa-shield-halved"></i> Secure, role-based access
                                </li>
                                <li>
                                    <i className="fa-solid fa-pen-to-square"></i> Add or edit any course
                                </li>
                                <li>
                                    <i className="fa-solid fa-book"></i> Changes reflect on the course catalog
                                </li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <h2>Manage the platform with full control.</h2>
                            <p>
                                Sign in to your admin dashboard to manage courses, students, faculty, and platform
                                settings.
                            </p>
                            <ul className="auth-side-list">
                                <li>
                                    <i className="fa-solid fa-shield-halved"></i> Secure, role-based access
                                </li>
                                <li>
                                    <i className="fa-solid fa-users-gear"></i> Manage students and faculty
                                </li>
                                <li>
                                    <i className="fa-solid fa-chart-line"></i> View platform-wide analytics
                                </li>
                                <li>
                                    <i className="fa-solid fa-book"></i> Approve and publish courses
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
                        </>
                    )}
                </div>
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Verify Admin Access</h1>
                            <p className="auth-subtitle">Sign in to continue editing.</p>
                            {error && (
                                <p className="auth-error">
                                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                                </p>
                            )}
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <label htmlFor="adminEmail">Email Address</label>
                                <input
                                    type="email"
                                    id="adminEmail"
                                    placeholder="admin@institute.edu"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="adminPassword">Password</label>
                                <input
                                    type="password"
                                    id="adminPassword"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="submit" className="auth-submit" disabled={busy}>
                                    {busy ? "Verifying…" : "Verify & Continue"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
