import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../services/api";

function timeAgo(iso) {
    if (!iso) return "New";
    const then = new Date(iso).getTime();
    if (isNaN(then)) return "New";
    const diff = Date.now() - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + (mins === 1 ? " minute ago" : " minutes ago");
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
    if (days < 30) return days + (days === 1 ? " day ago" : " days ago");
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function NotificationItem({ n, onOpen }) {
    return (
        <div className={`db-course-item notif-item ${n.read ? "" : "notif-item--unread"}`} onClick={() => onOpen(n)} style={{ cursor: "pointer" }}>
            <div className="db-course-item-left">
                <div className={`notif-icon-wrap type-${n.type}`}>
                    <i className={`fa-solid fa-${n.icon}`}></i>
                </div>
                <div>
                    <p className="db-course-item-name">
                        {n.title}
                        {!n.read && <span className="notif-dot"></span>}
                    </p>
                    <p className="db-course-item-meta">{n.message}</p>
                </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(n.date)}</span>
        </div>
    );
}

export default function Notifications() {
    const { student, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            const { data } = await api.get("/api/v1/me/notifications");
            setItems(data.data.items);
        } catch (err) {
            setError(errorMessage(err));
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!student) {
            navigate("/stu-login");
            return;
        }
        load();
    }, [authLoading, student, navigate, load]);

    async function openNotification(n) {
        try {
            if (!n.read) await api.post("/api/v1/me/notifications/read", { ids: [n.id] });
        } catch (err) {
            setError(errorMessage(err));
        }
        if (n.link) navigate(n.link);
        else load();
    }

    async function markAllRead() {
        try {
            await api.post("/api/v1/me/notifications/read", { all: true });
            await load();
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    const all = items || [];
    // Certificates get their own section; everything else is the general feed
    const certificates = all.filter((n) => n.type === "certificate");
    const feed = all.filter((n) => n.type !== "certificate");
    const unread = all.filter((n) => !n.read).length;
    const summary = unread === 0 ? "You're all caught up" : unread === 1 ? "1 unread notification" : `${unread} unread notifications`;

    return (
        <>
            <PageMeta bodyClassName="" page="notification" title="Notifications | StudyVerse" />
            <StudentNav active="notifications" />
            <div className="db-header">
                <div className="db-header-inner">
                    <div className="db-welcome">
                        <div className="db-avatar">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <p className="db-greeting">Your updates</p>
                            <h1 className="db-name">Notifications</h1>
                            <p className="db-meta">
                                <span>{items ? summary : "Loading…"}</span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button type="button" className="db-explore-btn" onClick={markAllRead} disabled={unread === 0}>
                            <i className="fa-solid fa-check-double"></i> Mark all as read
                        </button>
                    </div>
                </div>
            </div>
            <main className="db-main">
                {error && (
                    <p className="auth-error">
                        <i className="fa-solid fa-circle-exclamation"></i> {error}
                    </p>
                )}
                <section className="db-section db-section--full" style={{ marginBottom: "24px" }}>
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-bell"></i> Notifications
                        </h2>
                    </div>
                    <div>
                        {feed.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-bell-slash"></i>
                                </div>
                                <h3>No notifications yet</h3>
                                <p>Enroll in a course to start seeing updates here.</p>
                                <Link to="/courses" className="db-empty-btn">
                                    Browse Courses
                                </Link>
                            </div>
                        ) : (
                            feed.map((n) => <NotificationItem key={n.id} n={n} onOpen={openNotification} />)
                        )}
                    </div>
                </section>
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-certificate"></i> Certificates
                        </h2>
                    </div>
                    <div>
                        {certificates.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-certificate"></i>
                                </div>
                                <h3>No certificates yet</h3>
                                <p>Complete a course to earn your first certificate — it&apos;ll show up here.</p>
                                <Link to="/stu-dashboard" className="db-empty-btn">
                                    View My Courses
                                </Link>
                            </div>
                        ) : (
                            certificates.map((n) => <NotificationItem key={n.id} n={n} onOpen={openNotification} />)
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
