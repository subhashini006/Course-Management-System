import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Certificate() {
    const [params] = useSearchParams();
    const courseId = params.get("course");
    const { student, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [record, setRecord] = useState(undefined); // undefined = loading, null = none found

    useEffect(() => {
        if (authLoading) return;
        if (!student) {
            navigate("/stu-login");
            return;
        }
        // Only the logged-in student's own enrollments come back from this
        // route, so nobody can view someone else's certificate by guessing a URL.
        api.get("/api/v1/me/enrollments")
            .then(({ data }) => setRecord(data.data.find((e) => e.courseId === courseId) || null))
            .catch(() => setRecord(null));
    }, [authLoading, student, courseId, navigate]);

    const title = record && record.status === "completed" ? `Certificate - ${record.courseName} | StudyVerse` : "Certificate | StudyVerse";
    const notFound = record === null;
    const notDone = record && record.status !== "completed";
    const certId = record ? (record.courseId + "-" + record.roll).toUpperCase().replace(/\s+/g, "") : "";

    return (
        <>
            <PageMeta bodyClassName="" page="certificate" title={title} />
            <StudentNav />
            <main className="cert-page-main">
                <Link to="/stu-dashboard" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i> Back to My Dashboard
                </Link>

                {(notFound || notDone) && (
                    <div className="db-empty-state">
                        <div className="db-empty-icon">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        <h3>{notFound ? "No enrollment found" : "Certificate not available yet"}</h3>
                        <p>
                            {notFound
                                ? "We couldn't find an enrollment matching this course under your account."
                                : "Finish all units (or the video) of this course to unlock your certificate."}
                        </p>
                        <Link to="/courses" className="db-empty-btn">
                            Browse Courses
                        </Link>
                    </div>
                )}

                {record && record.status === "completed" && (
                    <div>
                        <div className="cert-actions">
                            <h1 style={{ fontFamily: "'Lora',serif", fontSize: "20px", color: "var(--navy)" }}>Your Certificate</h1>
                            <button className="primary-btn" onClick={() => window.print()}>
                                <i className="fa-solid fa-print"></i> Print / Save as PDF
                            </button>
                        </div>
                        <div className="cert-frame">
                            <div className="cert-inner">
                                <div className="cert-corner tl"></div>
                                <div className="cert-corner tr"></div>
                                <div className="cert-corner bl"></div>
                                <div className="cert-corner br"></div>
                                <div className="cert-logo">
                                    <i className="fa-solid fa-graduation-cap"></i> StudyVerse
                                </div>
                                <p className="cert-heading">Certificate of Completion</p>
                                <h2 className="cert-title">Awarded For Successful Completion</h2>
                                <p className="cert-presented">This certificate is proudly presented to</p>
                                <div className="cert-name">{record.name}</div>
                                <p className="cert-body-text">
                                    for successfully completing all requirements of the course
                                    <span className="cert-course-name">{record.courseName}</span>
                                    on the StudyVerse platform, demonstrating dedication and commitment to learning.
                                </p>
                                <div className="cert-footer-row">
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">{formatDate(record.completedDate || record.date)}</div>
                                        <div className="cert-footer-line">Date Completed</div>
                                    </div>
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">{record.roll}</div>
                                        <div className="cert-footer-line">Roll Number</div>
                                    </div>
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">StudyVerse</div>
                                        <div className="cert-footer-line">Issuing Platform</div>
                                    </div>
                                </div>
                                <p className="cert-id">Certificate ID: {certId}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
