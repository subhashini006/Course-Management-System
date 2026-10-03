import PageMeta from "../components/PageMeta";
import LegacyScript from "../components/LegacyScript";

export default function Home() {
    return (
        <>
            <PageMeta bodyClassName="" page="index" title="StudyVerse" />
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
                        <a href="#">About</a>
                    </li>
                    <li>
                        <a href="#">Contact</a>
                    </li>
                    <li>
                        <a href="#">Features</a>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <a href="/login-choice" className="login-btn">Login/Register</a>
                </div>
            </nav>
            <section className="hero">
                <div className="hero-text">
                    <h1>
                        Your Future Starts 
                        <br />
                         Here
                    </h1>
                    <p>
                                        Explore innovative courses, track your progress, and achieve your academic and career goals with confidence.
            
                    </p>
                    <div className="hero-buttons">
                        <a href="/courses" className="primary-btn">Explore Courses</a>
                        <a href="/login-choice" className="secondary-btn">Login/Register</a>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://images.openai.com/static-rsc-4/EOk7_ZSqKoG7p5E6IHB8e33nKRwvYtIx7d2k6iBs6p_G8Bv32GIWwJqrogiUGK08xXFnDYWRS8YU6SNgo-lYOA9G_Mc8iqYh55lvrpl1qxnYoZVKSwTqnGpxVIGoMLlkDgIUBOtpSIdffaRa0CUhuSrHOS2X9X0L0NmlAcu0UPge-eXnDZ-CeWvUkKzNZMt8?purpose=fullsize" />
                </div>
            </section>
            {/* ================= SEARCH ================= */}
            {/* ================= CATEGORIES ================= */}
            <section className="categories">
                <h2>Popular Categories</h2>
                <div className="category-container">
                    <div className="card">
                        <i className="fa-solid fa-code"></i>
                        <h3>Web Development</h3>
                    </div>
                    <div className="card">
                        <i className="fa-solid fa-robot"></i>
                        <h3>Artificial Intelligence</h3>
                    </div>
                    <div className="card">
                        <i className="fa-solid fa-chart-line"></i>
                        <h3>Data Science</h3>
                    </div>
                    <div className="card">
                        <i className="fa-brands fa-java"></i>
                        <h3>Java</h3>
                    </div>
                    <div className="card">
                        <i className="fa-brands fa-python"></i>
                        <h3>Python</h3>
                    </div>
                    <div className="card">
                        <i className="fa-solid fa-palette"></i>
                        <h3>UI / UX</h3>
                    </div>
                </div>
            </section>
            {/* ================= FEATURED COURSES ================= */}
            <section className="courses">
                <h2>Featured Courses</h2>
                <div className="course-container">
                    <div className="course-card">
                        <img src="https://tse2.mm.bing.net/th/id/OIP.UhnZs_RgbtVTR56Rsrm40gHaEE?r=0&pid=Api&P=0&h=180" />
                        <h3>Full Stack Development</h3>
                        <p>12 Weeks</p>
                        <p>★★★★★</p>
                        <button>Enroll Now</button>
                    </div>
                    <div className="course-card">
                        <img src="https://wp-cdn.entri.app/explore/2025/03/python_programming-1.webp" />
                        <h3>Python Programming</h3>
                        <p>10 Weeks</p>
                        <p>★★★★★</p>
                        <button>Enroll Now</button>
                    </div>
                    <div className="course-card">
                        <img src="https://i.ytimg.com/vi/MqffbpjhriQ/maxresdefault.jpg" />
                        <h3>Artificial Intelligence</h3>
                        <p>16 Weeks</p>
                        <p>★★★★★</p>
                        <button>Enroll Now</button>
                    </div>
                </div>
            </section>
            {/* ================= WHY CHOOSE US ================= */}
            <section className="features">
                <h2>Why Choose Us?</h2>
                <div className="feature-container">
                    <div className="feature-card">
                        <i className="fa-solid fa-user-graduate"></i>
                        <h3>Expert Faculty</h3>
                        <p>Learn from experienced instructors.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fa-solid fa-book-open"></i>
                        <h3>Interactive Learning</h3>
                        <p>Hands-on projects and practical learning.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fa-solid fa-chart-simple"></i>
                        <h3>Track Progress</h3>
                        <p>Monitor your learning journey.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fa-solid fa-certificate"></i>
                        <h3>Certification</h3>
                        <p>Earn certificates after completion.</p>
                    </div>
                </div>
            </section>
            {/* ================= STATISTICS ================= */}
            <section className="stats">
                <div className="stat-box">
                    <h2>1500+</h2>
                    <p>Students</p>
                </div>
                <div className="stat-box">
                    <h2>120+</h2>
                    <p>Courses</p>
                </div>
                <div className="stat-box">
                    <h2>40+</h2>
                    <p>Faculty</p>
                </div>
                <div className="stat-box">
                    <h2>98%</h2>
                    <p>Success Rate</p>
                </div>
            </section>
            {/* ================= TESTIMONIALS ================= */}
            <section className="testimonials">
                <h2>Student Reviews</h2>
                <div className="testimonial-container">
                    <div className="testimonial">
                        <img src="https://i.pravatar.cc/150?img=32" />
                        <h3>Priya Sharma</h3>
                        <p>
                                   "The courses are well-structured and helped me gain practical skills for internships and placements."
   
                        </p>
                    </div>
                    <div className="testimonial">
                        <img src="https://i.pravatar.cc/150?img=15" />
                        <h3>Jenni</h3>
                        <p>
                                   "The interactive learning experience and progress tracking kept me motivated throughout the course."
   
                        </p>
                    </div>
                    <div className="testimonial">
                        <img src="https://i.pravatar.cc/150?img=48" />
                        <h3>Sweety</h3>
                        <p>
                                    "StudyVerse provides quality content, expert guidance, and hands-on projects that build confidence."
    
                        </p>
                    </div>
                </div>
            </section>
            {/* ================= FAQ ================= */}
            <section className="faq">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-item">
                    <h3>How do I enroll in a course?</h3>
                    <p>Create an account and click on Enroll.</p>
                </div>
                <div className="faq-item">
                    <h3>Will I get a certificate?</h3>
                    <p>Yes, after successfully completing the course.</p>
                </div>
                <div className="faq-item">
                    <h3>Can I learn at my own pace?</h3>
                    <p>Yes. Courses are available anytime.</p>
                </div>
            </section>
            {/* ================= NEWSLETTER ================= */}
            <section className="newsletter">
                <h2>Stay Updated</h2>
                <p>Subscribe to receive latest course updates.</p>
                <input type="email" placeholder="Enter your Email" />
                <button>Subscribe</button>
            </section>
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
                <p className="copyright">
                        © 2026 StudyVerse | Student Course Management System

    
                </p>
            </footer>
            <LegacyScript />
        </>
    );
}
