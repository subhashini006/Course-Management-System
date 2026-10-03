import PageMeta from "../components/PageMeta";

export default function NotFound() {
    return (
        <>
            <PageMeta bodyClassName="" title="Page Not Found | StudyVerse" />
            <div style={{ padding: "80px 24px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
                <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>404 — Page not found</h1>
                <p style={{ marginBottom: "24px" }}>
                    That page doesn&apos;t exist in StudyVerse.
                </p>
                <a href="/" className="btn">Back to Home</a>
            </div>
        </>
    );
}
