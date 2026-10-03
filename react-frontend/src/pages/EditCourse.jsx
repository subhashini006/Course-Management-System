import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function EditCourse() {
    return (
        <>
            <PageMeta bodyClassName="" page="edit-course" title="Edit Course | StudyVerse" />
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
                        <a href="/courses" className="active-nav">Courses</a>
                    </li>
                    <li>
                        <a href="about.html">About</a>
                    </li>
                    <li>
                        <a href="contact.html">Contact</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="/login-choice" className="login-btn">Login / Register</a>
                </div>
            </nav>
            {/* ================= PAGE HEADER ================= */}
            <div className="ec-page-header">
                <div className="ec-breadcrumb">
                    <a href="/courses">
                        <i className="fa-solid fa-arrow-left"></i>
                         Back to Courses
                    </a>
                </div>
                <h1 id="ecPageTitle">Edit Course</h1>
                <p id="ecPageSubtitle">Update the details for this course.</p>
            </div>
            {/* ================= EDIT FORM ================= */}
            <main className="ec-main">
                <form className="ec-form" id="editCourseForm">
                    {/* ===== BASIC INFO ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-circle-info"></i>
                             Basic Information
                        </h2>
                        <div className="ec-grid-2">
                            <div className="ec-field">
                                <label htmlFor="ecTitle">Course Title</label>
                                <input type="text" id="ecTitle" placeholder="e.g. Introduction to AI" />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecInstructor">Instructor Name</label>
                                <input type="text" id="ecInstructor" placeholder="e.g. Dr. Alan Turing" />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecDuration">Duration</label>
                                <input type="text" id="ecDuration" placeholder="e.g. 8 Weeks · 40 Hours" />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecRating">Rating</label>
                                <input type="text" id="ecRating" placeholder="e.g. 4.8" />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecLevel">Difficulty Level</label>
                                <select id="ecLevel">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecSection">Section / Category</label>
                                <select id="ecSection">
                                    <option value="ai">Artificial Intelligence</option>
                                    <option value="ml">Machine Learning</option>
                                    <option value="ds">Data Science</option>
                                    <option value="nlp">Natural Language Processing</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* ===== COURSE IMAGE ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-image"></i>
                             Course Image
                        </h2>
                        <div className="ec-grid-2">
                            <div className="ec-field">
                                <label htmlFor="ecImage">Image URL</label>
                                <input type="text" id="ecImage" placeholder="https://..." />
                            </div>
                            <div className="ec-img-preview">
                                <img id="ecImgPreview" src="" alt="Preview" />
                                <span id="ecImgPlaceholder">
                                    <i className="fa-solid fa-image"></i>
                                     Preview
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* ===== WHAT YOU'LL LEARN ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-bullseye"></i>
                             What You'll Learn
                        </h2>
                        <div className="ec-learn-list" id="ecLearnList"></div>
                        <button type="button" className="ec-add-btn" onClick={() => window.addLearnItem()}>
                            <i className="fa-solid fa-plus"></i>
                             Add Learning Outcome
                
                        </button>
                    </div>
                    {/* ===== TOPICS COVERED ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-list-check"></i>
                             Topics Covered
                        </h2>
                        <div className="ec-field">
                            <label htmlFor="ecTopics">
                                Topics 
                                <span className="ec-hint">(comma separated)</span>
                            </label>
                            <input type="text" id="ecTopics" placeholder="e.g. CNNs, RNNs, Transfer Learning" />
                        </div>
                    </div>
                    {/* ===== PREREQUISITES ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-circle-check"></i>
                             Prerequisites
                        </h2>
                        <div className="ec-field">
                            <label htmlFor="ecPrereqs">Prerequisites</label>
                            <textarea id="ecPrereqs" rows="2" placeholder="e.g. Basic Python and high school mathematics required."></textarea>
                        </div>
                    </div>
                    {/* ===== ACTIONS ===== */}
                    <div className="ec-actions">
                        <button type="submit" className="ec-save-btn">
                            <i className="fa-solid fa-floppy-disk"></i>
                             Save Changes
                        </button>
                        <a href="/courses" className="ec-cancel-btn">Cancel</a>
                        <button type="button" id="ecDeleteBtn" className="ec-delete-btn" hidden="">
                            <i className="fa-solid fa-trash"></i>
                             Delete Course
                        </button>
                    </div>
                </form>
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
