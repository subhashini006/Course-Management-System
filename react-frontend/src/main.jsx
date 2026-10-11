import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CourseProvider } from "./context/CourseContext.jsx";
import "./index.css";

// AuthProvider knows who is logged in (asked from the backend);
// CourseProvider fetches the course list once and shares it with every page.
createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <CourseProvider>
                <App />
            </CourseProvider>
        </AuthProvider>
    </BrowserRouter>
);
