import { useSearchParams } from "react-router-dom";
import AdminGate from "../components/AdminGate";

export default function EditCourseLogin() {
    const [params] = useSearchParams();
    const courseId = params.get("course") || "";
    return <AdminGate variant="edit" target={`/edit-course?course=${encodeURIComponent(courseId)}`} page="edit-course-login" />;
}
