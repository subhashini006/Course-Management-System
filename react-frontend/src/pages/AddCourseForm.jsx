import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function AddCourseForm() {
    return (
        <>
            <PageMeta bodyClassName="" page="add-course" title="Add Course | StudyVerse" />
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
                        <a href="/admin-dashboard">Dashboard</a>
                    </li>
                    <li>
                        <a href="/courses">View Courses Page</a>
                    </li>
                </ul>
            </nav>
            <main className="admin-main admin-main-narrow">
                <a href="/admin-dashboard" className="form-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                     Back to Dashboard
                </a>
                <div className="admin-form-card">
                    <h1>Add New Course</h1>
                    <p className="admin-form-subtitle">Fill in the details below. New courses appear on the dashboard immediately.</p>
                    <p id="formError" className="auth-error" hidden="">
                        <i className="fa-solid fa-circle-exclamation"></i>
                                        Please fill in all required fields.
            
                    </p>
                    <form id="addCourseForm" className="admin-form">
                        <div className="form-group form-group-full">
                            <label htmlFor="courseName">Course Name *</label>
                            <input type="text" id="courseName" placeholder="e.g. Computer Vision Basics" required="" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseCategory">Category *</label>
                            <input type="text" id="courseCategory" placeholder="e.g. Cybersecurity, Cloud Computing" required="" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseLevel">Level *</label>
                            <select id="courseLevel" required="">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseWeeks">Duration (Weeks) *</label>
                            <input type="number" id="courseWeeks" min="1" placeholder="8" required="" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseHours">Total Hours *</label>
                            <input type="number" id="courseHours" min="1" placeholder="40" required="" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseInstructor">Instructor *</label>
                            <input type="text" id="courseInstructor" placeholder="e.g. Dr. Jane Smith" required="" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="courseRating">Rating (out of 5)</label>
                            <input type="number" id="courseRating" min="1" max="5" step="0.1" placeholder="4.8" />
                        </div>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseTopics">Topics Covered *</label>
                            <input type="text" id="courseTopics" placeholder="Comma-separated, e.g. Topic A, Topic B, Topic C" required="" />
                        </div>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseOutcome">Learning Outcome *</label>
                            <textarea id="courseOutcome" rows="3" placeholder="What will students be able to do after this course?" required=""></textarea>
                        </div>
                        <div className="form-actions form-group-full">
                            <a href="/admin-dashboard" className="secondary-form-btn">Cancel</a>
                            <button type="submit" className="primary-btn">Save Course</button>
                        </div>
                    </form>
                </div>
            </main>
            <LegacyScript />
        </>
    );
}
