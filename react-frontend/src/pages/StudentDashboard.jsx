import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function StudentDashboard() {
    return (
        <>
            <PageMeta bodyClassName="" page="stu-dashboard" title="My Dashboard | StudyVerse" />
            {/* ================= NAVBAR ================= */}
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>StudyVerse</span>
                </div>
                <ul className="nav-links">
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="/courses">Courses</a>
                    </li>
                    <li>
                        <a href="notifications.html">Notifications</a>
                    </li>
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="#" className="login-btn" onClick={(e) => { e.preventDefault(); window.logoutStudent(); }}>Logout</a>
                </div>
            </nav>
            {/* ================= DASHBOARD HEADER ================= */}
            <div className="db-header">
                <div className="db-header-inner">
                    <div className="db-welcome">
                        <div className="db-avatar">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div>
                            <p className="db-greeting">Welcome back,</p>
                            <h1 className="db-name" id="studentNameHeading">Student</h1>
                            <p className="db-meta">
                                <i className="fa-solid fa-envelope"></i>
                                <span id="studentEmailMeta">-</span>
                            </p>
                        </div>
                    </div>
                    <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                        <a href="/courses" className="db-explore-btn">
                            <i className="fa-solid fa-magnifying-glass"></i>
                             Explore Courses
                
                        </a>
                    </div>
                </div>
            </div>
            {/* ================= MAIN CONTENT ================= */}
            <main className="db-main">
                {/* ===== OVERALL PROGRESS ===== */}
                <section className="db-section db-section--full" style={{marginBottom: "24px"}}>
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-bullseye"></i>
                             Overall Completion
                        </h2>
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", padding: "6px 2px"}}>
                        <div id="overallRing" style={{flexShrink: "0"}}></div>
                        <div style={{flex: "1", minWidth: "220px"}}>
                            <div className="course-progress-card" style={{marginBottom: "0"}}>
                                <div className="course-progress-card-top">
                                    <span id="overallLabel">0 of 0 courses completed</span>
                                    <small id="overallPct">0%</small>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" id="overallFill" style={{width: "0%"}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ===== STAT CARDS ===== */}
                <div className="db-stats-row">
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--blue">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Enrolled Courses</span>
                            <span className="db-stat-value" id="statEnrolled">0</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--green">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Completed</span>
                            <span className="db-stat-value" id="statCompleted">0</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--amber">
                            <i className="fa-solid fa-spinner"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">In Progress</span>
                            <span className="db-stat-value" id="statInProgress">0</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--accent">
                            <i className="fa-solid fa-certificate"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Certificates</span>
                            <span className="db-stat-value" id="statCerts">0</span>
                        </div>
                    </div>
                </div>
                {/* ===== TWO COLUMN LAYOUT ===== */}
                <div className="db-grid">
                    {/* LEFT: Learning Progress */}
                    <section className="db-section">
                        <div className="db-section-header" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                            <h2>
                                <i className="fa-solid fa-chart-line"></i>
                                 Learning Progress
                            </h2>
                        </div>
                        <div id="inProgressList"></div>
                    </section>
                    {/* RIGHT: My Courses */}
                    <section className="db-section">
                        <div className="db-section-header">
                            <h2>
                                <i className="fa-solid fa-book-open"></i>
                                 My Courses
                            </h2>
                        </div>
                        <div id="myCoursesList"></div>
                    </section>
                </div>
                {/* ===== COMPLETED COURSES ===== */}
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-trophy"></i>
                             Completed Courses
                        </h2>
                    </div>
                    <div id="completedList"></div>
                </section>
            </main>
            {/* ================= FOOTER ================= */}
            <footer>
                <div className="footer-content">
                    <div>
                        <h2>StudyVerse</h2>
                        <p>Your trusted online learning platform.</p>
                    </div>
                    <div>
                        <h3>Quick Links</h3>
                        <p>Home</p>
                        <p>Courses</p>
                        <p>About</p>
                        <p>Contact</p>
                    </div>
                    <div>
                        <h3>Contact</h3>
                        <p>Email : support@StudyVerse.com</p>
                        <p>Phone : +91 9876543210</p>
                    </div>
                    <div>
                        <h3>Follow Us</h3>
                        <i className="fab fa-facebook"></i>
                        <i className="fab fa-instagram"></i>
                        <i className="fab fa-linkedin"></i>
                        <i className="fab fa-github"></i>
                    </div>
                </div>
                <hr />
                <p className="copyright">© 2026 StudyVerse | Student Course Management System</p>
            </footer>
            <LegacyScript />
        </>
    );
}
