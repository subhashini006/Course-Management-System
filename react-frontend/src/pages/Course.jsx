import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function Course() {
    return (
        <>
            <PageMeta bodyClassName="" page="course" title="Course | StudyVerse" />
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
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="/login-choice" className="login-btn">Logout</a>
                </div>
            </nav>
            <div id="courseNotFound" className="db-empty-state" hidden="" style={{margin: "60px auto"}}>
                <div className="db-empty-icon">
                    <i className="fa-solid fa-circle-question"></i>
                </div>
                <h3>Course not found</h3>
                <p>We couldn't find that course. It may have been removed by an admin.</p>
                <a href="/courses" className="db-empty-btn">Browse Courses</a>
            </div>
            <div id="courseContent" hidden="">
                {/* ================= HERO HEADER ================= */}
                <section className="course-page-hero">
                    <a href="/stu-dashboard" className="course-back-link">
                        <i className="fa-solid fa-arrow-left"></i>
                         Back to Dashboard
                    </a>
                    <span className="course-page-category" id="coursePageCategory"></span>
                    <h1 id="coursePageTitle"></h1>
                    <p id="coursePageMeta"></p>
                </section>
                <div className="course-page-grid">
                    {/* ================= MAIN COLUMN ================= */}
                    <div className="course-page-content">
                        <div id="courseCompleteBanner" className="video-complete-card" style={{marginBottom: "22px", background: "#f0fdf4", borderColor: "#bbf7d0"}} hidden="">
                            <div className="video-complete-left" style={{color: "#15803d"}}>
                                <i className="fa-solid fa-circle-check"></i>
                                <span id="completeBannerText">You've completed this course. Great work!</span>
                            </div>
                        </div>
                        <div className="course-overview-text" id="courseOverviewText"></div>
                        {/* CONTENT-TYPE COURSE UI */}
                        <div id="contentModuleUI" hidden="">
                            <h2 className="course-section-title">
                                <i className="fa-solid fa-list-ol"></i>
                                 Course Content
                            </h2>
                            <div className="unit-accordion" id="unitAccordion"></div>
                        </div>
                        {/* VIDEO-TYPE COURSE UI */}
                        <div id="videoModuleUI" hidden="">
                            <h2 className="course-section-title">
                                <i className="fa-solid fa-circle-play"></i>
                                 Course Video
                            </h2>
                            <div className="video-wrap">
                                <video controls="" id="videoPlayer">
                                    <source id="videoSource" src="" type="video/mp4" />
                                                                Your browser does not support the video tag.
                        
                                </video>
                            </div>
                            <p style={{fontSize: "12px", color: "var(--text-muted)", margin: "-14px 0 22px"}}>
                                                        Placeholder video — update this course's videoSrc in app.js (or via localStorage) when the real video is ready.
                    
                            </p>
                            <div className="video-complete-card">
                                <div className="video-complete-left">
                                    <input type="checkbox" id="videoCompleteCheck" onChange={() => window.handleVideoToggle()} />
                                                                I have watched and completed this course
                        
                                </div>
                                <span className="db-course-status db-status--progress" id="videoStatusBadge">In Progress</span>
                            </div>
                        </div>
                    </div>
                    {/* ================= SIDEBAR ================= */}
                    <aside className="course-sidebar">
                        {/* Progress card (content courses only) */}
                        <div className="course-info-card" id="sidebarProgressCard" hidden="">
                            <h3>
                                <i className="fa-solid fa-chart-simple"></i>
                                 Your Progress
                            </h3>
                            <div className="course-progress-card-top">
                                <span id="unitProgressLabel">0 / 0 units completed</span>
                                <small id="unitProgressPct">0%</small>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" id="unitProgressFill" style={{width: "0%"}}></div>
                            </div>
                        </div>
                        {/* Course details */}
                        <div className="course-info-card">
                            <h3>
                                <i className="fa-solid fa-circle-info"></i>
                                 Course Details
                            </h3>
                            <div className="course-info-row">
                                <i className="fa-regular fa-clock"></i>
                                 Duration 
                                <strong id="infoDuration"></strong>
                            </div>
                            <div className="course-info-row">
                                <i className="fa-solid fa-signal"></i>
                                 Level 
                                <strong id="infoLevel"></strong>
                            </div>
                            <div className="course-info-row">
                                <i className="fa-solid fa-tag"></i>
                                 Category 
                                <strong id="infoCategory"></strong>
                            </div>
                            <div className="course-info-row">
                                <i className="fa-solid fa-shapes"></i>
                                 Format 
                                <strong id="infoFormat"></strong>
                            </div>
                        </div>
                        {/* What you'll learn */}
                        <div className="course-info-card" id="sidebarTopicsCard" hidden="">
                            <h3>
                                <i className="fa-solid fa-graduation-cap"></i>
                                 What You'll Learn
                            </h3>
                            <ul className="course-topics-list" id="topicsList"></ul>
                        </div>
                    </aside>
                </div>
            </div>
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
