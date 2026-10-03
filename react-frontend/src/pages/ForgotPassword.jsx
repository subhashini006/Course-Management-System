import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function ForgotPassword() {
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
                    <p>Enter your email address to receive a secure link to reset your password and get back to learning.</p>
                </div>
                {/* RIGHT SIDE FORM */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Forgot Password</h1>
                            <p className="auth-subtitle">Enter your email to reset your password.</p>
                            <form className="auth-form">
                                <label htmlFor="recoveryEmail">Email Address</label>
                                <input type="email" id="recoveryEmail" placeholder="you@example.com" required="" />
                                <button type="submit" className="auth-submit">Send Reset Link</button>
                            </form>
                            <p className="auth-footer-text">
                                Remembered your password? 
                                <a href="/stu-login">Login here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript />
        </>
    );
}
