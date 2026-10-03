import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function StudentLogin() {
    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="stu-login" title="Login | StudyVerse" />
            <a href="/" className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                 Back to Home
            </a>
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
                            <i className="fa-solid fa-circle-check"></i>
                             Access 120+ industry-ready courses
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                             Track your learning progress anytime
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                             Earn certificates upon completion
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                             Learn from experienced instructors
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
                            <form className="auth-form" id="studentLoginForm">
                                <label htmlFor="studentName">Full Name</label>
                                <input type="text" id="studentName" placeholder="Your full name" required="" />
                                <label htmlFor="studentEmail">Email Address</label>
                                <input type="email" id="studentEmail" placeholder="you@example.com" required="" />
                                <label htmlFor="studentPassword">Password</label>
                                <input type="password" id="studentPassword" placeholder="••••••••" required="" />
                                <p className="auth-forgot" style={{fontSize: "12px", marginTop: "1px", marginBottom: "3px"}}>
                                    <a href="/forgot-password">Forgot Password?</a>
                                </p>
                                <p className="auth-forgot" style={{fontSize: "12px", marginTop: "1px", marginBottom: "3px"}}>
                                    <a href="/reset-password">Reset Password</a>
                                </p>
                                <button type="submit" className="auth-submit">Sign In</button>
                            </form>
                            <p className="auth-footer-text">
                                Don't have an account? 
                                <a href="/stu-register">Register here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript />
        </>
    );
}
