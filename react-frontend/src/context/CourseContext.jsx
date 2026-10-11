import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../services/api";

const CourseContext = createContext(null);

// Fetches the course list once and shares it with every page via useCourses().
// The add / update / delete helpers talk to the backend and then keep the
// shared list in sync, so every page shows the change straight away.
export function CourseProvider({ children }) {
    const [courses, setCourses] = useState(null); // null = still loading
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const response = await api.get("/api/v1/courses");
            setCourses(response.data.data);
            setError(null);
        } catch (err) {
            setError(errorMessage(err));
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // The backend answers { success, message, data }, so the course itself
    // is in response.data.data.
    const addCourse = useCallback(async (courseData) => {
        try {
            const response = await api.post("/api/v1/courses", courseData);
            const newCourse = response.data.data;
            setCourses((previousCourses) => [...(previousCourses || []), newCourse]);
            return newCourse;
        } catch (err) {
            console.error("Error adding course:", err);
            throw err;
        }
    }, []);

    const updateCourse = useCallback(async (id, courseData) => {
        try {
            const response = await api.put(`/api/v1/courses/${encodeURIComponent(id)}`, courseData);
            const updatedCourse = response.data.data;
            setCourses((previousCourses) =>
                (previousCourses || []).map((course) => (course.id === id ? updatedCourse : course))
            );
            return updatedCourse;
        } catch (err) {
            console.error("Error updating course:", err);
            throw err;
        }
    }, []);

    const deleteCourse = useCallback(async (id) => {
        try {
            await api.delete(`/api/v1/courses/${encodeURIComponent(id)}`);
            setCourses((previousCourses) => (previousCourses || []).filter((course) => course.id !== id));
        } catch (err) {
            console.error("Error deleting course:", err);
            throw err;
        }
    }, []);

    const value = useMemo(
        () => ({
            courses: courses || [],
            loading: courses === null && !error,
            error,
            refresh,
            addCourse,
            updateCourse,
            deleteCourse,
        }),
        [courses, error, refresh, addCourse, updateCourse, deleteCourse]
    );

    return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCourses() {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error("useCourses() must be used inside <CourseProvider>");
    return ctx;
}
