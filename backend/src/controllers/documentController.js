const Document = require("../models/documentModel");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const crypto = require("crypto");

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
        const ownedDocs = await Document.find({ userId: req.user._id });

        const sharedDocs = await Document.find({
            "sharedWith.userId": req.user._id
        });
        
        res.json({ ownedDocs, sharedDocs });

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

const updateTitle = async (req, res) => {
    try {
        const { title } = req.body;
        const { id } = req.params;

        const doc = await Document.findOne({docId: id});

        if(!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        //only owner can update title
        if(doc.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        doc.title = title;
        await doc.save();

        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const shareDocument = async (req, res) => {
    try {
        const { email, permission } = req.body;
        const { id } = req.params;

        const doc = await Document.findOne({docId: id});

        if(!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        //only owner can share
        if(doc.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const userToShare = await User.findOne({email});

        if(!userToShare) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already shared
        const alreadyShared = doc.sharedWith.find(s => s.userId.toString() === userToShare._id.toString());

        if(alreadyShared) {
            alreadyShared.permission = permission; // Update permission if already shared
        } else {
            doc.sharedWith.push({ userId: userToShare._id, permission });
        }

        await doc.save();
        res.json({message: `Document shared with ${email} with ${permission} permission`});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const generateShareLink = async (req, res) => {
    try {
        const {permission}  = req.body;
        const { id } = req.params;

        const doc = await Document.findOne({docId: id});

        if(!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        //only owner can generate share link
        if(doc.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const token = crypto.randomBytes(16).toString("hex");

        doc.shareLink = {
            token,
            permission: permission || "read"
        };
        await doc.save();

        res.json({
            link: `${process.env.FRONTEND_URL}/doc/${id}?token=${token}`,
        })
        console.log(doc.shareLink);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {createDocument, deleteDocument, getDocument, updateTitle, shareDocument, generateShareLink}