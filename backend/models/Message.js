const mongoose = require("mongoose");
const baseOptions = require("./baseOptions");

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    baseOptions
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
// Lets "messages sent TO me" lookups use an index as well
messageSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
