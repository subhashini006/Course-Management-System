import axios from "axios";

// One axios instance for the whole app, pointing at the Express backend
// (run `npm run dev` inside /backend — it listens on port 5000).
//
// - Override the address with VITE_API_URL in react-frontend/.env if the
//   backend runs somewhere else.
// - `withCredentials` lets the browser send the login-session cookie that
//   the backend sets, so the backend knows who is logged in.
const baseURL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

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

export default api;
