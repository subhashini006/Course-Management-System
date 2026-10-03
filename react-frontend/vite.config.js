import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The original site navigates with real full-page loads to relative
// "*.html" URLs (window.location.href = "courses.html", etc.). Vite's
// dev server only auto-falls-back to index.html for extension-less
// paths, so this plugin rewrites any request for one of our page paths
// (with or without .html, and with or without a query string) back to
// "/" before Vite's own middleware runs, so the SPA always boots and
// React Router can take over from there.
function spaFallback() {
    return {
        name: "studyverse-spa-fallback",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url || "";
                const [pathname] = url.split("?");
                const isAsset = /\.(js|mjs|css|svg|png|jpe?g|gif|ico|map|json|woff2?|ttf)$/i.test(pathname);
                const isViteInternal = pathname.startsWith("/@") || pathname.startsWith("/src/") || pathname.startsWith("/node_modules/");
                const isRootIndex = pathname === "/" || pathname === "/index.html";
                if (!isAsset && !isViteInternal && !isRootIndex && req.method === "GET") {
                    req.url = "/";
                }
                next();
            });
        },
    };
}

export default defineConfig({
    plugins: [react(), spaFallback()],
});
