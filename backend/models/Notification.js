const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true, trim: true, maxlength: 500 },
        isRead: { type: Boolean, default: false },

        // Optional presentation fields used by the Notifications page
        title: { type: String, trim: true, maxlength: 150, default: "" },
        type: { type: String, enum: ["system", "course", "enrollment", "certificate", "message"], default: "system" },
        icon: { type: String, trim: true, maxlength: 50, default: "bell" },
        link: { type: String, trim: true, maxlength: 300, default: "" },
    },
    baseOptions
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
