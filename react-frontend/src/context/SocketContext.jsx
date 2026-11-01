import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { createSocket } from "../api/socketClient";
import apiClient, { getToken } from "../api/apiClient";

const SocketContext = createContext({ socket: null, connected: false, unreadNotifications: 0, setUnreadNotifications: () => {} });

// One shared WebSocket for the whole app while somebody is logged in.
// It is closed on logout, and it also keeps the "unread notifications" badge live.
export function SocketProvider({ children }) {
    const { role, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const userId = user?.id || null;

    useEffect(() => {
        const token = getToken();
        if (!role || !userId || !token) return undefined;

        const s = createSocket(token);
        setSocket(s);

        s.on("connect", () => setConnected(true));
        s.on("disconnect", () => setConnected(false));
        s.on("connect_error", (err) => console.warn("Socket connection failed:", err.message));
        s.on("new_notification", () => setUnreadNotifications((n) => n + 1));

        apiClient
            .get("/notifications")
            .then(({ data }) => setUnreadNotifications(data.unreadCount || 0))
            .catch(() => {});

        return () => {
            s.removeAllListeners();
            s.disconnect();
            setSocket(null);
            setConnected(false);
            setUnreadNotifications(0);
        };
    }, [role, userId]);

    const value = useMemo(
        () => ({ socket, connected, unreadNotifications, setUnreadNotifications }),
        [socket, connected, unreadNotifications]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
    return useContext(SocketContext);
}
