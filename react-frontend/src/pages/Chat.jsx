import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import StudentNav from "../components/StudentNav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api, { errorMessage } from "../api/apiClient";

const MAX_LENGTH = 2000;

const timeOf = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

// Task 13 — real-time one-to-one chat. Messages are saved by the server
// (GET /messages/:userId loads the history) and delivered live over the shared
// WebSocket ("send_message" out, "receive_message" in).
export default function Chat() {
    const { user, role, loading: authLoading } = useAuth();
    const { socket, connected } = useSocket();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [contacts, setContacts] = useState([]);
    const [selectedId, setSelectedId] = useState(params.get("with") || "");
    const [messages, setMessages] = useState([]);
    const [unreadFrom, setUnreadFrom] = useState({});
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const selectedRef = useRef(selectedId);
    selectedRef.current = selectedId;

    useEffect(() => {
        if (authLoading) return;
        if (!role) navigate("/stu-login");
    }, [authLoading, role, navigate]);

    // Who can I talk to?
    useEffect(() => {
        if (!role) return;
        api.get("/messages/contacts")
            .then(({ data }) => setContacts(data.contacts))
            .catch((err) => setError(errorMessage(err)));
    }, [role]);

    // Conversation history when a contact is picked
    const loadHistory = useCallback(async (id) => {
        if (!id) return setMessages([]);
        try {
            const { data } = await api.get(`/messages/${id}`);
            setMessages(data.messages);
            setError("");
        } catch (err) {
            setMessages([]);
            setError(errorMessage(err));
        }
    }, []);

    useEffect(() => {
        loadHistory(selectedId);
    }, [selectedId, loadHistory]);

    function openContact(id) {
        setSelectedId(id);
        setUnreadFrom((prev) => ({ ...prev, [id]: 0 }));
    }

    // Live messages
    useEffect(() => {
        if (!socket || !user) return undefined;
        const onMessage = (msg) => {
            const other = msg.sender === user.id ? msg.recipient : msg.sender;
            if (other === selectedRef.current) {
                setMessages((prev) => (prev.some((m) => (m._id || m.id) === msg._id) ? prev : [...prev, msg]));
            } else if (msg.sender !== user.id) {
                setUnreadFrom((prev) => ({ ...prev, [other]: (prev[other] || 0) + 1 }));
            }
        };
        socket.on("receive_message", onMessage);
        return () => socket.off("receive_message", onMessage);
    }, [socket, user]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function sendMessage(e) {
        e.preventDefault();
        const clean = text.trim();
        if (!clean || !selectedId || !socket || sending) return;
        setSending(true);
        setError("");
        socket.emit("send_message", { recipientId: selectedId, text: clean }, (ack) => {
            setSending(false);
            if (ack && ack.success) setText("");
            else setError((ack && ack.message) || "Message could not be sent.");
        });
    }

    const selected = contacts.find((c) => c.id === selectedId);
    const isStudent = role === "student";

    return (
        <>
            <PageMeta bodyClassName="" page="chat" title="Chat | StudyVerse" />
            {isStudent ? (
                <StudentNav active="chat" />
            ) : (
                <nav className="navbar">
                    <div className="logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>StudyVerse</span>
                    </div>
                    <ul className="nav-links">
                        <li>
                            <Link to="/admin-dashboard">Back to dashboard</Link>
                        </li>
                    </ul>
                </nav>
            )}
            <main className="db-main">
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-comments"></i> Chat
                        </h2>
                        <span className={`chat-status ${connected ? "chat-status--on" : ""}`}>
                            <i className="fa-solid fa-circle"></i> {connected ? "Live" : "Connecting…"}
                        </span>
                    </div>

                    {error && (
                        <p className="auth-error">
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </p>
                    )}

                    <div className="chat-layout">
                        <aside className="chat-contacts" aria-label="Contacts">
                            {contacts.length === 0 && <p className="chat-empty">No other users to chat with yet.</p>}
                            {contacts.map((c) => (
                                <button key={c.id} type="button" className={`chat-contact ${c.id === selectedId ? "chat-contact--active" : ""}`} onClick={() => openContact(c.id)}>
                                    <span className="chat-contact-name">{c.name}</span>
                                    <span className="chat-contact-role">{c.role}</span>
                                    {unreadFrom[c.id] > 0 && <span className="nav-badge">{unreadFrom[c.id]}</span>}
                                </button>
                            ))}
                        </aside>

                        <div className="chat-panel">
                            {!selected ? (
                                <p className="chat-empty">Select someone on the left to start chatting.</p>
                            ) : (
                                <>
                                    <div className="chat-panel-head">Chatting with {selected.name}</div>
                                    <div className="chat-messages" aria-live="polite">
                                        {messages.length === 0 && <p className="chat-empty">No messages yet — say hello!</p>}
                                        {messages.map((m) => {
                                            const mine = m.sender === user?.id;
                                            return (
                                                <div key={m._id || m.id} className={`chat-bubble ${mine ? "chat-bubble--mine" : ""}`}>
                                                    <span>{m.text}</span>
                                                    <small>{timeOf(m.createdAt)}</small>
                                                </div>
                                            );
                                        })}
                                        <div ref={bottomRef} />
                                    </div>
                                    <form className="chat-form" onSubmit={sendMessage}>
                                        <input
                                            type="text"
                                            value={text}
                                            maxLength={MAX_LENGTH}
                                            placeholder="Type a message…"
                                            onChange={(e) => setText(e.target.value)}
                                            aria-label="Message"
                                        />
                                        <button type="submit" className="db-explore-btn" disabled={!connected || sending || !text.trim()}>
                                            <i className="fa-solid fa-paper-plane"></i> Send
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
