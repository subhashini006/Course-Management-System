import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import api, { errorMessage } from "../services/api";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setBusy(true);
        try {
            await api.post("/api/v1/auth/reset-password", { token, password });
            setDone(true);
        } catch (err) {
            setError(errorMessage(err));
        }
        setBusy(false);
    }

    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="reset-password" title="Reset Password | StudyVerse" />
            <div className="split-wrapper">
                {/* LEFT SIDE CONTENT */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h2>Secure your account.</h2>
                    <p>Choose a strong, unique password to keep your account safe and continue your journey.</p>
                </div>
                {/* RIGHT SIDE FORM */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Set New Password</h1>
                            <p className="auth-subtitle">Create a new password for your account.</p>

                            {done ? (
                                <>
                                    <p className="auth-success">
                                        <i className="fa-solid fa-circle-check"></i> Password updated. You can log in now.
                                    </p>
                                    <p className="auth-footer-text">
                                        <Link to="/stu-login">Go to login</Link>
                                    </p>
                                </>
                            ) : !token ? (
                                <>
                                    <p className="auth-error">
                                        <i className="fa-solid fa-circle-exclamation"></i> This page needs a reset link.
                                    </p>
                                    <p className="auth-footer-text">
                                        <Link to="/forgot-password">Request a reset link</Link>
                                    </p>
                                </>
                            ) : (
                                <>
                                    {error && (
                                        <p className="auth-error">
                                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                                        </p>
                                    )}
                                    <form className="auth-form" onSubmit={handleSubmit}>
                                        <label htmlFor="newPassword">New Password</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                        />
                                        <button type="submit" className="auth-submit" disabled={busy}>
                                            {busy ? "Updating…" : "Update Password"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
