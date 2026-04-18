const express = require("express");
const router = express.Router();
const { createDocument, getDocument, deleteDocument } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createDocument);
router.get("/", protect, getDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;