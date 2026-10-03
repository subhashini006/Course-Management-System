import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound.jsx";
import AddCourseEditGate from "./pages/AddCourseEditGate.jsx";
import AddCourseGate from "./pages/AddCourseGate.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Certificate from "./pages/Certificate.jsx";
import Course from "./pages/Course.jsx";
import Courses from "./pages/Courses.jsx";
import EditCourseLogin from "./pages/EditCourseLogin.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import LoginChoice from "./pages/LoginChoice.jsx";
import AddCourseForm from "./pages/AddCourseForm.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentLogin from "./pages/StudentLogin.jsx";
import StudentRegister from "./pages/StudentRegister.jsx";

function App() {
    return (
        <Routes>
            <Route path="/add-course-edit" element={<AddCourseEditGate />} />
            <Route path="/add-course-edit.html" element={<AddCourseEditGate />} />
            <Route path="/add-course" element={<AddCourseForm />} />
            <Route path="/add-course.html" element={<AddCourseForm />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard.html" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-login.html" element={<AdminLogin />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/certificate.html" element={<Certificate />} />
            <Route path="/course" element={<Course />} />
            <Route path="/course.html" element={<Course />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses.html" element={<Courses />} />
            <Route path="/edit-course-login" element={<EditCourseLogin />} />
            <Route path="/edit-course-login.html" element={<EditCourseLogin />} />
            <Route path="/edit-course" element={<EditCourse />} />
            <Route path="/edit-course.html" element={<EditCourse />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password.html" element={<ForgotPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Home />} />
            <Route path="/login-choice" element={<LoginChoice />} />
            <Route path="/login-choice.html" element={<LoginChoice />} />
            <Route path="/notification" element={<AddCourseForm />} />
            <Route path="/notification.html" element={<AddCourseForm />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password.html" element={<ResetPassword />} />
            <Route path="/stu-dashboard" element={<StudentDashboard />} />
            <Route path="/stu-dashboard.html" element={<StudentDashboard />} />
            <Route path="/stu-login" element={<StudentLogin />} />
            <Route path="/stu-login.html" element={<StudentLogin />} />
            <Route path="/stu-register" element={<StudentRegister />} />
            <Route path="/stu-register.html" element={<StudentRegister />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
