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
    history: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("Document", documentSchema);