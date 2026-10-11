import { useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import api, { errorMessage } from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const { data } = await api.post("/api/v1/auth/forgot-password", { email: email.trim() });
            setResult({ message: data.message, resetLink: data.data && data.data.resetLink });
        } catch (err) {
            setError(errorMessage(err));
        }
        setBusy(false);
    }

    // The backend has no email service, so outside production it hands the
    // reset link straight back (it is also printed in the backend terminal).
    const resetPath = result && result.resetLink ? new URL(result.resetLink).pathname + new URL(result.resetLink).search : null;

    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="forgot-password" title="Forgot Password | StudyVerse" />
            <div className="split-wrapper">
                {/* LEFT SIDE CONTENT */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h2>Recover your account access.</h2>
                    <p>
                        Enter your email address to receive a secure link to reset your password and get back to
                        learning.
                    </p>
                </div>
                {/* RIGHT SIDE FORM */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Forgot Password</h1>
                            <p className="auth-subtitle">Enter your email to reset your password.</p>
                            {error && (
                                <p className="auth-error">
                                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                                </p>
                            )}
                            {result && (
                                <p className="auth-success">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <span>
                                        {result.message}
                                        {resetPath && (
                                            <>
                                                {" "}
                                                No email service is connected, so here is your link:{" "}
                                                <Link to={resetPath}>Reset my password</Link>
                                            </>
                                        )}
                                    </span>
                                </p>
                            )}
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <label htmlFor="recoveryEmail">Email Address</label>
                                <input
                                    type="email"
                                    id="recoveryEmail"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button type="submit" className="auth-submit" disabled={busy}>
                                    {busy ? "Sending…" : "Send Reset Link"}
                                </button>
                            </form>
                            <p className="auth-footer-text">
                                Remembered your password? <Link to="/stu-login">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
