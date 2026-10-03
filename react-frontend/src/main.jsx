import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// NOTE: intentionally not wrapped in <StrictMode>. StrictMode
// deliberately double-mounts every component in development to help
// find bugs, which is great for pure-React code — but LegacyScript
// bridges in the original app.js via a dynamically inserted <script>
// tag, and that script loads asynchronously. StrictMode's synchronous
// mount -> cleanup -> remount cycle removes the script before it has
// a chance to actually execute, so app.js silently never runs in dev.
// Production builds never double-invoke effects, so this only ever
// mattered for `npm run dev` — but to keep dev and prod behaving the
// same way, StrictMode is left off here.
createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
