import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Who is logged in? The answer lives on the backend (an HttpOnly session
// cookie), so nothing about the login is kept in localStorage any more.
// This asks the backend once on load and exposes login / logout helpers.
export function AuthProvider({ children }) {
    const [role, setRole] = useState(null); // "student" | "admin" | null
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        api.get("/api/v1/auth/me")
            .then(({ data }) => {
                if (cancelled) return;
                setRole(data.data.role);
                setStudent(data.data.student);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const apply = (data) => {
        setRole(data.role);
        setStudent(data.student);
    };

    const loginStudent = useCallback(async (email, password) => {
        const { data } = await api.post("/api/v1/auth/login", { email, password });
        apply(data.data);
        return data.data.student;
    }, []);

    const loginAdmin = useCallback(async (email, password) => {
        const { data } = await api.post("/api/v1/auth/admin-login", { email, password });
        apply(data.data);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/api/v1/auth/logout");
        } finally {
            apply({ role: null, student: null });
        }
    }, []);

    const value = useMemo(
        () => ({ role, student, isAdmin: role === "admin", loading, loginStudent, loginAdmin, logout }),
        [role, student, loading, loginStudent, loginAdmin, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
    return ctx;
}
