import { io } from "socket.io-client";
import { baseURL, getToken } from "./apiClient";

// Socket.IO lives at the SERVER ROOT, not under /api/v1, so the "/api/v1" suffix
// is removed from the API address. Override with VITE_SOCKET_URL if needed.
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || baseURL.replace(/\/api\/v1\/?$/, "");

// Task 13 — opens an authenticated connection. The JWT is sent in the
// handshake; the server refuses the connection if it is missing or invalid.
export function createSocket(token = getToken()) {
    return io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
    });
}
