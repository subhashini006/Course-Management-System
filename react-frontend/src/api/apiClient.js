import axios from "axios";

// One axios instance for the whole app, pointing at the Express backend.
//
// The address comes from VITE_API_URL (INCLUDING the /api/v1 prefix):
//   development:  VITE_API_URL=http://localhost:5000/api/v1   (the default below)
//   production:   VITE_API_URL=https://<your-render-service>.onrender.com/api/v1
//                 (set it in the Vercel project settings, then redeploy)
export const baseURL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? `http://${window.location.hostname}:5000/api/v1` : "/api/v1");

if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not set — API calls will go to this site's own /api/v1.");
}

const TOKEN_KEY = "token";
const ROLE_KEY = "role";

// The JWT lives in sessionStorage: it is kept for this browser tab only and is
// gone when the tab closes. That is fine for learning, but JavaScript can read
// it, so a real production app should consider HttpOnly cookies instead.
export function getToken() {
    try {
        return sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function saveToken(token, role) {
    try {
        sessionStorage.setItem(TOKEN_KEY, token);
        if (role) sessionStorage.setItem(ROLE_KEY, role);
    } catch {
        /* storage blocked — the user simply stays logged out */
    }
}

export function clearToken() {
    try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(ROLE_KEY);
    } catch {
        /* nothing to clear */
    }
}

const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Task 10 — send "Authorization: Bearer <token>" on every request that has one.
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// If the backend rejects a token we sent (expired / invalid), drop it and tell
// the app so it can show the logged-out state instead of failing silently.
export const SESSION_EXPIRED_EVENT = "studyverse:session-expired";

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const sentToken = Boolean(error.config?.headers?.Authorization);
        if (error.response?.status === 401 && sentToken && getToken()) {
            clearToken();
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    }
);

// Turns an axios error into a message that is safe to show on screen.
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
    if (err && err.response && err.response.data && err.response.data.message) {
        return err.response.data.message;
    }
    if (err && !err.response) {
        return "Couldn't reach the backend. Make sure it is running (cd backend, then npm run dev).";
    }
    return fallback;
}

export default apiClient;
