const express = require("express");
const router = express.Router();
const { createDocument, getDocument, deleteDocument, updateTitle, shareDocument } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createDocument);
router.get("/", protect, getDocument);
router.delete("/:id", protect, deleteDocument);
router.put("/:id/title", protect, updateTitle);
router.post("/:id/share", protect, shareDocument);

module.exports = router;