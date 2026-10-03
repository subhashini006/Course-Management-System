import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function Certificate() {
    return (
        <>
            <PageMeta bodyClassName="" page="certificate" title="Certificate | StudyVerse" />
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
                    <a href="#" className="login-btn" onClick={(e) => { e.preventDefault(); window.logoutStudent(); }}>Logout</a>
                </div>
            </nav>
            <main className="cert-page-main">
                <a href="/stu-dashboard" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                     Back to My Dashboard
                </a>
                <div id="notCompletedState" className="db-empty-state" hidden="">
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <h3 id="notCompletedTitle">Certificate not available yet</h3>
                    <p id="notCompletedMsg">Finish all units (or the video) of this course to unlock your certificate.</p>
                    <a href="/courses" className="db-empty-btn">Browse Courses</a>
                </div>
                <div id="certWrap" hidden="">
                    <div className="cert-actions">
                        <h1 style={{fontFamily: "'Lora',serif", fontSize: "20px", color: "var(--navy)"}}>Your Certificate</h1>
                        <button className="primary-btn" onClick={() => window.print()}>
                            <i className="fa-solid fa-print"></i>
                             Print / Save as PDF
                        </button>
                    </div>
                    <div className="cert-frame">
                        <div className="cert-inner">
                            <div className="cert-corner tl"></div>
                            <div className="cert-corner tr"></div>
                            <div className="cert-corner bl"></div>
                            <div className="cert-corner br"></div>
                            <div className="cert-logo">
                                <i className="fa-solid fa-graduation-cap"></i>
                                 StudyVerse
                            </div>
                            <p className="cert-heading">Certificate of Completion</p>
                            <h2 className="cert-title">Awarded For Successful Completion</h2>
                            <p className="cert-presented">This certificate is proudly presented to</p>
                            <div className="cert-name" id="certStudentName"></div>
                            <p className="cert-body-text">
                                                        for successfully completing all requirements of the course
                        
                                <span className="cert-course-name" id="certCourseName"></span>
                                                        on the StudyVerse platform, demonstrating dedication and commitment to learning.
                    
                            </p>
                            <div className="cert-footer-row">
                                <div className="cert-footer-item">
                                    <div className="cert-footer-value" id="certDate"></div>
                                    <div className="cert-footer-line">Date Completed</div>
                                </div>
                                <div className="cert-footer-item">
                                    <div className="cert-footer-value" id="certRoll"></div>
                                    <div className="cert-footer-line">Roll Number</div>
                                </div>
                                <div className="cert-footer-item">
                                    <div className="cert-footer-value">StudyVerse</div>
                                    <div className="cert-footer-line">Issuing Platform</div>
                                </div>
                            </div>
                            <p className="cert-id" id="certId"></p>
                        </div>
                    </div>
                </div>
            </main>
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
