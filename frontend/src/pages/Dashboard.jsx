import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const [ownedDocs, setOwnedDocs] = useState([]);
    const [sharedDocs, setSharedDocs] = useState([]);
    const [titles, setTitles] = useState({});
    const [emails, setEmails] = useState({});
    const [activeDocId, setActiveDocId] = useState(null);
    const [activeShareId, setActiveShareId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [permissions, setPermissions] = useState({});
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchDocuments = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/docs", {
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });
            const data = await res.json();
            setOwnedDocs(data.ownedDocs || []);
            setSharedDocs(data.sharedDocs || []);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        }
    };

    const createDocument = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("http://localhost:5000/api/docs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                }
            });
            const doc = await res.json();
            navigate(`/doc/${doc.docId}`);
        } catch (err) {
            console.error("Failed to create document:", err);
        } finally {
            setIsCreating(false);
        }
    };

    const deleteDocument = async (docId) => {
        if (!confirm("delete this document? this action cannot be undone.")) return;

        try {
            await fetch(`http://localhost:5000/api/docs/${docId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            fetchDocuments();
        } catch (err) {
            console.error("Failed to delete document:", err);
        }
    };

    const updateTitle = async (docId) => {
        const title = titles[docId];
        if (!title || title.trim() === "") return;

        try {
            await fetch(`http://localhost:5000/api/docs/${docId}/title`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ title })
            });
            fetchDocuments();
            setTitles(prev => ({ ...prev, [docId]: "" }));
            setActiveDocId(null);
        } catch (err) {
            console.error("Failed to update title:", err);
        }
    };

    const shareDocument = async (docId) => {
        const email = emails[docId];
        if (!email || email.trim() === "") return;

        const permission = permissions[docId] || "write";

        try {
            await fetch(`http://localhost:5000/api/docs/${docId}/share`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ email, permission })
            });
            fetchDocuments();
            setEmails(prev => ({ ...prev, [docId]: "" }));
            setActiveShareId(null);
        } catch (err) {
            console.error("Failed to share document:", err);
            alert("Failed to share document. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
            {/* Subtle grid pattern */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 40px, rgba(100, 255, 218, 0.03) 40px, rgba(100, 255, 218, 0.03) 41px)`
                }}
            />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b backdrop-blur-xl"
                style={{
                    backgroundColor: "rgba(10, 15, 26, 0.92)",
                    borderBottomColor: "rgba(100, 255, 218, 0.08)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1
                            className="text-xl font-mono font-bold tracking-tight cursor-pointer"
                            style={{ color: "#64ffda" }}
                            onClick={() => navigate("/")}
                        >
                            collabx<span style={{ color: "#839496" }}>.dev</span>
                        </h1>
                        <span className="text-xs font-mono px-2 py-1 rounded"
                            style={{
                                backgroundColor: "rgba(100, 255, 218, 0.08)",
                                color: "#839496"
                            }}
                        >
                            ~/dashboard
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                            style={{
                                backgroundColor: "rgba(100, 255, 218, 0.05)",
                                border: "1px solid rgba(100, 255, 218, 0.1)"
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#64ffda" }}></span>
                            <span className="text-xs font-mono" style={{ color: "#839496" }}>{user?.name || "user"}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="px-4 py-1.5 rounded-lg font-mono text-xs transition-all"
                            style={{
                                color: "#cb4b16",
                                border: "1px solid rgba(203, 75, 22, 0.3)",
                                backgroundColor: "transparent"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(203, 75, 22, 0.08)";
                                e.currentTarget.style.borderColor = "#cb4b16";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.borderColor = "rgba(203, 75, 22, 0.3)";
                            }}
                        >
                            $ logout
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header + Create Button */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-mono font-bold tracking-tight" style={{ color: "#ccd6f6" }}>
                            your <span style={{ color: "#64ffda" }}>workspace</span>
                        </h2>
                        <p className="text-sm font-mono mt-1" style={{ color: "#586e75" }}>
                            {ownedDocs.length} owned · {sharedDocs.length} shared
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createDocument}
                        disabled={isCreating}
                        className="px-6 py-2.5 rounded-lg font-mono text-sm transition-all flex items-center gap-2"
                        style={{
                            backgroundColor: isCreating ? "rgba(100, 255, 218, 0.4)" : "#64ffda",
                            color: "#0a0f1a"
                        }}
                        onMouseEnter={(e) => {
                            if (!isCreating) {
                                e.currentTarget.style.backgroundColor = "#7cffea";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isCreating) {
                                e.currentTarget.style.backgroundColor = "#64ffda";
                            }
                        }}
                    >
                        {isCreating ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                creating...
                            </>
                        ) : (
                            "+ new document"
                        )}
                    </motion.button>
                </div>

                {/* Owned Documents Section */}
                <section className="mb-12">
                    <h3 className="text-lg font-mono font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "#e5b567" }}
                    >
                        <span>📄</span> owned documents
                        <span className="text-xs font-mono" style={{ color: "#586e75" }}>({ownedDocs.length})</span>
                    </h3>

                    {ownedDocs.length === 0 ? (
                        <div className="text-center py-12 rounded-xl border border-dashed"
                            style={{
                                borderColor: "rgba(100, 255, 218, 0.15)",
                                backgroundColor: "rgba(15, 20, 32, 0.3)"
                            }}
                        >
                            <p className="text-sm font-mono" style={{ color: "#586e75" }}>
                                no documents yet. click "new document" to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {ownedDocs.map((doc, idx) => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="rounded-xl p-5 border transition-all"
                                    style={{
                                        backgroundColor: "rgba(15, 20, 32, 0.4)",
                                        borderColor: "rgba(100, 255, 218, 0.08)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.2)";
                                        e.currentTarget.style.backgroundColor = "rgba(15, 20, 32, 0.6)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.08)";
                                        e.currentTarget.style.backgroundColor = "rgba(15, 20, 32, 0.4)";
                                    }}
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4 className="font-mono font-semibold text-lg truncate"
                                                    style={{ color: "#ccd6f6" }}
                                                >
                                                    {doc.title || "untitled"}
                                                </h4>
                                                <span className="text-xs font-mono px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: "rgba(100, 255, 218, 0.08)",
                                                        color: "#839496"
                                                    }}
                                                >
                                                    {doc.docId.slice(-8)}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono mt-1" style={{ color: "#586e75" }}>
                                                created {new Date(doc.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => navigate(`/doc/${doc.docId}`)}
                                                className="px-4 py-1.5 rounded-lg font-mono text-xs transition-all"
                                                style={{
                                                    backgroundColor: "rgba(100, 255, 218, 0.08)",
                                                    color: "#64ffda",
                                                    border: "1px solid rgba(100, 255, 218, 0.2)"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.08)";
                                                }}
                                            >
                                                edit
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => deleteDocument(doc.docId)}
                                                className="px-4 py-1.5 rounded-lg font-mono text-xs transition-all"
                                                style={{
                                                    backgroundColor: "rgba(203, 75, 22, 0.08)",
                                                    color: "#cb4b16",
                                                    border: "1px solid rgba(203, 75, 22, 0.2)"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "rgba(203, 75, 22, 0.15)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = "rgba(203, 75, 22, 0.08)";
                                                }}
                                            >
                                                delete
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveDocId(activeDocId === doc.docId ? null : doc.docId)}
                                                className="px-4 py-1.5 rounded-lg font-mono text-xs transition-all"
                                                style={{
                                                    backgroundColor: "rgba(229, 181, 103, 0.08)",
                                                    color: "#e5b567",
                                                    border: "1px solid rgba(229, 181, 103, 0.2)"
                                                }}
                                            >
                                                rename
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveShareId(activeShareId === doc.docId ? null : doc.docId)}
                                                className="px-4 py-1.5 rounded-lg font-mono text-xs transition-all"
                                                style={{
                                                    backgroundColor: "rgba(100, 255, 218, 0.08)",
                                                    color: "#64ffda",
                                                    border: "1px solid rgba(100, 255, 218, 0.2)"
                                                }}
                                            >
                                                share
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Rename Input */}
                                    <AnimatePresence>
                                        {activeDocId === doc.docId && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t"
                                                style={{ borderTopColor: "rgba(100, 255, 218, 0.08)" }}
                                            >
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="new title"
                                                        value={titles[doc.docId] || ""}
                                                        onChange={(e) => setTitles(prev => ({ ...prev, [doc.docId]: e.target.value }))}
                                                        onKeyPress={(e) => e.key === "Enter" && updateTitle(doc.docId)}
                                                        className="flex-1 px-3 py-2 rounded-lg font-mono text-sm outline-none transition-all"
                                                        style={{
                                                            backgroundColor: "rgba(10, 15, 26, 0.8)",
                                                            border: "1px solid rgba(100, 255, 218, 0.15)",
                                                            color: "#ccd6f6"
                                                        }}
                                                        onFocus={(e) => e.currentTarget.style.borderColor = "#64ffda"}
                                                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.15)"}
                                                        autoFocus
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => updateTitle(doc.docId)}
                                                        className="px-4 py-2 rounded-lg font-mono text-xs"
                                                        style={{
                                                            backgroundColor: "#64ffda",
                                                            color: "#0a0f1a"
                                                        }}
                                                    >
                                                        save
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Share Input */}
                                    <AnimatePresence>
                                        {activeShareId === doc.docId && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t"
                                                style={{ borderTopColor: "rgba(100, 255, 218, 0.08)" }}
                                            >
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="email"
                                                        placeholder="collaborator@email.com"
                                                        value={emails[doc.docId] || ""}
                                                        onChange={(e) =>
                                                            setEmails(prev => ({
                                                                ...prev,
                                                                [doc.docId]: e.target.value
                                                            }))
                                                        }
                                                        className="flex-1 px-3 py-2 rounded-lg font-mono text-sm"
                                                        style={{
                                                            backgroundColor: "rgba(10, 15, 26, 0.8)",
                                                            border: "1px solid rgba(100, 255, 218, 0.15)",
                                                            color: "#ccd6f6"
                                                        }}
                                                    />

                                                    {/* 🔥 NEW: PERMISSION SELECT */}
                                                    <select
                                                        value={permissions[doc.docId] || "write"}
                                                        onChange={(e) =>
                                                            setPermissions(prev => ({
                                                                ...prev,
                                                                [doc.docId]: e.target.value
                                                            }))
                                                        }
                                                        className="px-3 py-2 rounded-lg font-mono text-sm"
                                                        style={{
                                                            backgroundColor: "rgba(10, 15, 26, 0.8)",
                                                            border: "1px solid rgba(100, 255, 218, 0.15)",
                                                            color: "#ccd6f6"
                                                        }}
                                                    >
                                                        <option value="read">read</option>
                                                        <option value="write">write</option>
                                                    </select>

                                                    <button
                                                        onClick={() => shareDocument(doc.docId)}
                                                        className="px-4 py-2 rounded-lg font-mono text-xs"
                                                        style={{
                                                            backgroundColor: "#64ffda",
                                                            color: "#0a0f1a"
                                                        }}
                                                    >
                                                        share
                                                    </button>
                                                </div>
                                                <p className="text-xs font-mono mt-2" style={{ color: "#586e75" }}>
                                                    access: {permissions[doc.docId] || "write"}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Shared Documents Section */}
                {sharedDocs.length > 0 && (
                    <section>
                        <h3 className="text-lg font-mono font-semibold mb-4 flex items-center gap-2"
                            style={{ color: "#64ffda" }}
                        >
                            <span>🔗</span> shared with me
                            <span className="text-xs font-mono" style={{ color: "#586e75" }}>({sharedDocs.length})</span>
                        </h3>

                        <div className="grid gap-4">
                            {sharedDocs.map((doc, idx) => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="rounded-xl p-5 border"
                                    style={{
                                        backgroundColor: "rgba(15, 20, 32, 0.3)",
                                        borderColor: "rgba(100, 255, 218, 0.06)"
                                    }}
                                >
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4 className="font-mono font-semibold text-lg"
                                                    style={{ color: "#ccd6f6" }}
                                                >
                                                    {doc.title || "untitled"}
                                                </h4>
                                                <span className="text-xs font-mono px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: "rgba(100, 255, 218, 0.08)",
                                                        color: "#839496"
                                                    }}
                                                >
                                                    {doc.docId.slice(-8)}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 mt-1">
                                                <p className="text-xs font-mono" style={{ color: "#586e75" }}>
                                                    created {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                                <span className="text-xs font-mono px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: doc.sharedWith.find(u => u.userId === user?._id)?.permission === "write"
                                                            ? "rgba(100, 255, 218, 0.08)"
                                                            : "rgba(229, 181, 103, 0.08)",
                                                        color: doc.sharedWith.find(u => u.userId === user?._id)?.permission === "write"
                                                            ? "#64ffda"
                                                            : "#e5b567"
                                                    }}
                                                >
                                                    {doc.sharedWith.find(u => u.userId === user?._id)?.permission || "read"} access
                                                </span>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/doc/${doc.docId}`)}
                                            className="px-5 py-1.5 rounded-lg font-mono text-sm transition-all"
                                            style={{
                                                backgroundColor: "rgba(100, 255, 218, 0.08)",
                                                color: "#64ffda",
                                                border: "1px solid rgba(100, 255, 218, 0.2)"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.15)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.08)";
                                            }}
                                        >
                                            open →
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}