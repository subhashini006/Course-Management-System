const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { isOriginAllowed } = require("./origins");

let io = null;
const getIO = () => io;

// Errors whose message is safe to show to the person who sent the message
class SocketError extends Error {}

// Basic abuse control: at most 20 chat messages per 10 seconds per connection
const WINDOW_MS = 10 * 1000;
const MAX_MESSAGES_PER_WINDOW = 20;

function initializeSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            // The same trusted-origin rule as the REST API (Task 14.1)
            origin(origin, callback) {
                callback(null, isOriginAllowed(origin));
            },
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e5, // 100 KB per event — a chat message is tiny
    });

    // ---- Authenticate every connection with the JWT (Task 13.2) ----
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
            const user = await User.findById(decoded.sub).select("_id name role");
            if (!user) return next(new Error("User not found"));

            socket.user = { id: String(user._id), name: user.name, role: user.role };
            socket.tokenExpiresAt = decoded.exp ? decoded.exp * 1000 : null;
            next();
        } catch {
            next(new Error("Invalid authentication token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user.id;

        // Each authenticated user has a private room: every browser tab they
        // have open joins it, and messages are sent to the room, not the socket.
        socket.join(`user:${userId}`);

        // A socket must not outlive its token: disconnect when the JWT expires
        let expiryTimer = null;
        if (socket.tokenExpiresAt) {
            const msLeft = Math.min(Math.max(socket.tokenExpiresAt - Date.now(), 0), 2 ** 31 - 1);
            expiryTimer = setTimeout(() => socket.disconnect(true), msLeft);
        }

        const recent = [];

        socket.on("send_message", async (data, ack) => {
            const reply = typeof ack === "function" ? ack : () => {};
            try {
                const now = Date.now();
                while (recent.length && now - recent[0] > WINDOW_MS) recent.shift();
                if (recent.length >= MAX_MESSAGES_PER_WINDOW) throw new SocketError("You are sending messages too quickly. Please slow down.");
                recent.push(now);

                const { recipientId, text } = data || {};
                if (!mongoose.isValidObjectId(recipientId) || typeof text !== "string" || !text.trim() || text.trim().length > 2000) {
                    throw new SocketError("Invalid message data");
                }
                // Recipient authorisation: you cannot message yourself, and the
                // recipient must be a real account. The SENDER is always the
                // authenticated user — the client can never choose it.
                if (String(recipientId) === userId) throw new SocketError("You cannot send a message to yourself");
                if (!(await User.exists({ _id: recipientId }))) throw new SocketError("Recipient not found");

                const message = await Message.create({ sender: userId, recipient: recipientId, text: text.trim() });
                const payload = {
                    _id: String(message._id),
                    id: String(message._id),
                    sender: userId,
                    recipient: String(recipientId),
                    text: message.text,
                    createdAt: message.createdAt,
                };
                io.to(`user:${userId}`).to(`user:${recipientId}`).emit("receive_message", payload);

                const notification = await Notification.create({
                    recipient: recipientId,
                    title: `New message from ${socket.user.name}`,
                    message: `New message from ${socket.user.name}`,
                    type: "message",
                    icon: "comment-dots",
                    link: `/chat?with=${userId}`,
                });
                io.to(`user:${recipientId}`).emit("new_notification", notification.toJSON());

                reply({ success: true });
            } catch (error) {
                if (!(error instanceof SocketError)) console.error("send_message failed:", error);
                reply({ success: false, message: error instanceof SocketError ? error.message : "Could not send the message" });
            }
        });

        socket.on("disconnect", () => {
            if (expiryTimer) clearTimeout(expiryTimer);
        });
    });

    return io;
}

module.exports = initializeSocket;
module.exports.getIO = getIO;
