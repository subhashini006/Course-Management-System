import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function ResetPassword() {
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
                            <form className="auth-form">
                                <label htmlFor="newPassword">New Password</label>
                                <input type="password" id="newPassword" placeholder="••••••••" required="" />
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input type="password" id="confirmPassword" placeholder="••••••••" required="" />
                                <button type="submit" className="auth-submit">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript />
        </>
    );
}
