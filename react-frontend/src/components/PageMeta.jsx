import { useLayoutEffect } from "react";

/**
 * The original static site gave every HTML file its own <body> tag with
 * its own class list and data-page attribute (app.js reads
 * document.body.dataset.page to decide which page-specific block of
 * code to run). In the SPA there is only one <body>, so this component
 * re-stamps it with the right class/data-page/title every time a page
 * mounts, mirroring what a fresh page load used to do.
 */
function PageMeta({ bodyClassName = "", page, title }) {
    useLayoutEffect(() => {
        const previousClassName = document.body.className;
        const previousPage = document.body.dataset.page;
        const previousTitle = document.title;

        document.body.className = bodyClassName;
        if (page) {
            document.body.dataset.page = page;
        } else {
            delete document.body.dataset.page;
        }
        if (title) {
            document.title = title;
        }

        return () => {
            document.body.className = previousClassName;
            if (previousPage === undefined) {
                delete document.body.dataset.page;
            } else {
                document.body.dataset.page = previousPage;
            }
            document.title = previousTitle;
        };
    }, [bodyClassName, page, title]);

    return null;
}

export default PageMeta;
