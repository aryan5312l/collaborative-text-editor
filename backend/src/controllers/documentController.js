const Document = require("../models/documentModel");
const { v4: uuidv4 } = require("uuid");

//Create new document
const createDocument = async (req, res) => {
    try {
        const doc = await Document.create({
            docId: uuidv4(),
            userId: req.user._id,
            content: "",
            title: "Untitled Document",
        });

        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Get My Documents
const getDocument = async (req, res) => {
    try {
        const docs = await Document.find({userId: req.user._id}).sort({createdAt: -1});

        res.json(docs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Delete Document
const deleteDocument = async (req, res) => {
    try {
        await Document.deleteOne({
            docId: req.params.id,
            userId: req.user._id
        });
        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {createDocument, deleteDocument, getDocument}