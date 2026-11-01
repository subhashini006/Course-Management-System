import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SESSION_EXPIRED_EVENT, clearToken, getToken, saveToken } from "../api/apiClient";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

// Who is logged in? The login gives us a JWT, which is kept in sessionStorage
// and attached to every request by the axios client. On load, if a token is
// there, the backend is asked who it belongs to (GET /auth/me); an expired or
// invalid token is dropped and the app shows the logged-out state.
export function AuthProvider({ children }) {
    const [role, setRole] = useState(null); // "student" | "admin" | null
    const [student, setStudent] = useState(null);
    const [user, setUser] = useState(null); // { id, name, email, role } for students AND admins
    const [loading, setLoading] = useState(Boolean(getToken()));

    const apply = (data) => {
        setRole(data.role);
        setStudent(data.student);
        setUser(data.user || null);
    };

    useEffect(() => {
        if (!getToken()) return undefined;

        let cancelled = false;
        authApi
            .fetchCurrentUser()
            .then((data) => {
                if (!cancelled) apply(data);
            })
            .catch(() => clearToken())
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // A request came back 401 for our token (expired) -> become logged out
    useEffect(() => {
        const onExpired = () => apply({ role: null, student: null, user: null });
        window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    }, []);

    const loginStudent = useCallback(async (email, password) => {
        const result = await authApi.loginStudent({ email, password });
        saveToken(result.token, result.role);
        // /auth/login accepts any account, so trust the role the server reports
        apply({ role: result.role, student: result.role === "student" ? result.student : null, user: result.student });
        return result.student;
    }, []);

    const loginAdmin = useCallback(async (email, password) => {
        const result = await authApi.loginAdmin({ email, password });
        saveToken(result.token, "admin");
        apply({ role: "admin", student: null, user: result.student });
    }, []);

    // A JWT is stateless, so logging out just means forgetting the token.
    const logout = useCallback(async () => {
        clearToken();
        apply({ role: null, student: null, user: null });
    }, []);

    const value = useMemo(
        () => ({ role, student, user, isAdmin: role === "admin", loading, loginStudent, loginAdmin, logout }),
        [role, student, user, loading, loginStudent, loginAdmin, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
    return ctx;
}
