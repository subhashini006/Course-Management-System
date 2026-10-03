import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function LoginChoice() {
    return (
        <>
            <PageMeta bodyClassName="auth-body" page="login-choice" title="Login | StudyVerse" />
            <a href="/" className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                 Back to Home
            </a>
            <div className="choice-wrapper">
                <div className="choice-header">
                    <div className="choice-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Choose how you'd like to continue</p>
                </div>
                <div className="choice-cards">
                    {/* STUDENT CARD */}
                    <div className="choice-card">
                        <div className="choice-card-icon">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <h2>Student</h2>
                        <p>Access your courses, track your progress and continue learning.</p>
                        <div className="choice-card-btns">
                            <a href="/stu-login" className="choice-btn-primary">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                 Student Login
                    
                            </a>
                            <a href="/stu-register" className="choice-btn-secondary">
                                <i className="fa-solid fa-user-plus"></i>
                                 Student Registration
                    
                            </a>
                        </div>
                    </div>
                    {/* ADMIN CARD */}
                    <div className="choice-card">
                        <div className="choice-card-icon choice-card-icon--admin">
                            <i className="fa-solid fa-user-shield"></i>
                        </div>
                        <h2>Admin</h2>
                        <p>Manage courses, students and platform settings from your dashboard.</p>
                        <div className="choice-card-btns">
                            <a href="/admin-login" className="choice-btn-primary">
                                <i className="fa-solid fa-right-to-bracket"></i>
                                 Admin Login
                    
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript />
        </>
    );
}
