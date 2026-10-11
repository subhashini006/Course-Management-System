import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// The navbar shared by every logged-in student page.
export default function StudentNav({ active }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(e) {
        e.preventDefault();
        await logout();
        navigate("/stu-login");
    }

    return (
        <nav className="navbar">
            <div className="logo">
                <i className="fa-solid fa-graduation-cap"></i>
                <span>StudyVerse</span>
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/courses">Courses</Link>
                </li>
                <li>
                    <Link to="/notifications" className={active === "notifications" ? "active-nav" : ""}>
                        Notifications
                    </Link>
                </li>
                <li>
                    <a href="about.html">About</a>
                </li>
                <li>
                    <a href="contact.html">Contact</a>
                </li>
            </ul>
            <div className="nav-buttons">
                <a href="#" className="login-btn" onClick={handleLogout}>
                    Logout
                </a>
            </div>
        </nav>
    );
}
