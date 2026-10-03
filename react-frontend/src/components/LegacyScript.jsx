import { useEffect, useRef } from "react";

/**
 * Bridges the original app.js (a single, shared, plain <script> file with
 * no DOMContentLoaded wrapper — its page-specific blocks run top-to-bottom
 * as soon as the script executes, gated by `document.body.dataset.page`)
 * into React.
 *
 * Every time a page component mounts, we inject a brand-new <script> tag
 * so app.js re-executes against the DOM React just rendered — exactly like
 * a full page reload used to re-run it. `executed` guards only against
 * StrictMode's development-time double-invoke of the same mount; a
 * genuinely new page mount always gets a fresh ref and therefore a fresh
 * script run.
 */
function LegacyScript({ src = "/legacy/app.js" }) {
    const executed = useRef(false);

    useEffect(() => {
        if (executed.current) {
            return;
        }
        executed.current = true;

        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onerror = function (error) {
            console.error("Unable to load legacy script:", src, error);
        };
        document.body.appendChild(script);

        return () => {
            script.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return null;
}

export default LegacyScript;
