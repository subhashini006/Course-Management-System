import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function AdminDashboard() {
    return (
        <>
            <PageMeta bodyClassName="" page="admin-dashboard" title="Admin Dashboard | StudyVerse" />
            {/* ================= NAVBAR ================= */}
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>
                        StudyVerse 
                        <span className="admin-tag">Admin</span>
                    </span>
                </div>
                <ul className="nav-links">
                    <li>
                        <a href="/admin-dashboard" className="active-nav">Dashboard</a>
                    </li>
                    <li>
                        <a href="/courses">View Courses Page</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="/courses" className="login-btn" id="logoutBtn" type="button">
                        <i className="fa-solid fa-right-from-bracket"></i>
                         Logout
                    </a>
                </div>
            </nav>
            <main className="admin-main">
                <div className="admin-header">
                    <div>
                        <h1>Welcome back, Admin</h1>
                        <p>Here's what's happening across your course catalog.</p>
                    </div>
                    <a href="/add-course" className="primary-btn admin-add-btn">
                        <i className="fa-solid fa-plus"></i>
                         Add New Course
                    </a>
                </div>
                <div id="adminBanner" className="admin-banner" hidden=""></div>
                {/* ========== STATS ========== */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <div>
                            <h3 id="statTotalCourses">0</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{background: "#f0fdf4"}}>
                            <i className="fa-solid fa-user-graduate" style={{color: "#22c55e"}}></i>
                        </div>
                        <div>
                            <h3 id="statTotalEnrolled">0</h3>
                            <p>Total Enrolled</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{background: "#eff6ff"}}>
                            <i className="fa-solid fa-circle-check" style={{color: "#3b82f6"}}></i>
                        </div>
                        <div>
                            <h3 id="statTotalCompleted">0</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="admin-stat-card admin-stat-progress">
                        <div className="admin-stat-icon" style={{background: "#f5ede4"}}>
                            <i className="fa-solid fa-chart-line" style={{color: "#9a6f49"}}></i>
                        </div>
                        <div className="admin-stat-progress-body">
                            <p>Overall Progress</p>
                            <div className="progress-track">
                                <div className="progress-fill" id="progressFill" style={{width: "0%"}}></div>
                            </div>
                            <span id="progressPct" style={{fontSize: "12px", color: "var(--text-muted)"}}>0%</span>
                        </div>
                    </div>
                </div>
                {/* ========== COURSES TABLE ========== */}
                <div className="admin-table-wrap">
                    <div className="admin-table-header">
                        <h2>All Courses</h2>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Duration</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="coursesTableBody">{/* rows injected by JS */}</tbody>
                    </table>
                </div>
                {/* NEW ENROLLMENT SECTION */}
                <div className="admin-table-wrap" style={{marginTop: "30px"}}>
                    <div className="admin-table-header">
                        <h2>Enrollment Details</h2>
                        <button className="clear-all-btn" onClick={() => window.resetEnrollments()}>
                            <i className="fa-solid fa-trash"></i>
                             Clear All
        
                        </button>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="enrollmentsTableBody">{/* Populated by JS */}</tbody>
                    </table>
                </div>
            </main>
            <LegacyScript />
        </>
    );
}
