import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function EditCourseLogin() {
    return (
        <>
            <PageMeta bodyClassName="auth-body split" page="edit-course-login" title="Verify Admin Access | StudyVerse" />
            <a href="/courses" className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                 Back to Courses
            </a>
            <div className="split-wrapper">
                {/* ================= LEFT SIDE ================= */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <h2>Confirm it's you before editing course content.</h2>
                    <p>This action changes what students see. Sign in with your admin account to continue.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-shield-halved"></i>
                             Secure, role-based access
                        </li>
                        <li>
                            <i className="fa-solid fa-pen-to-square"></i>
                             Add or edit any course
                        </li>
                        <li>
                            <i className="fa-solid fa-book"></i>
                             Changes reflect on the course catalog
                        </li>
                    </ul>
                </div>
                {/* ================= RIGHT SIDE FORM ================= */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Verify Admin Access</h1>
                            <p className="auth-subtitle">Sign in to continue editing.</p>
                            <form className="auth-form" id="verifyLoginForm">
                                <label htmlFor="adminEmail">Email Address</label>
                                <input type="email" id="adminEmail" placeholder="admin@institute.edu" required="" />
                                <label htmlFor="adminPassword">Password</label>
                                <input type="password" id="adminPassword" placeholder="••••••••" required="" />
                                <button type="submit" className="auth-submit">Verify & Continue</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript />
        </>
    );
}
