const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    docId: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        default: "Untitled Document"
    },
    history: {
        type: Array,
        default: []
    }
}, {timestamps: true});

module.exports = mongoose.model("Document", documentSchema);