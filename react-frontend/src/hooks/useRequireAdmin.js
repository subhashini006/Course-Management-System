import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For admin-only pages: once the session is known, anyone who isn't logged
// in as admin is sent to `redirectTo`. Returns true when it's safe to render.
export default function useRequireAdmin(redirectTo) {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAdmin) navigate(redirectTo, { replace: true });
    }, [loading, isAdmin, redirectTo, navigate]);

    return !loading && isAdmin;
}
