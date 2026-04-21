import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import TextEditor from "../components/TextEditor";
import { useParams, useNavigate } from "react-router-dom";
import { applyOperation } from "../utils/operationUtils";
import { useRef } from "react";
import { getToken, logout } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function Editor() {
    const { id: docId } = useParams();
    const [content, setContent] = useState("");
    const [cursors, setCursors] = useState({});
    const [permission, setPermission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();
    
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("token");

    const undoStackRef = useRef([]);
    const redoStackRef = useRef([]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.error("No token found, redirecting to login");
            navigate("/login");
            return;
        }

        socket.auth = { 
            token,
            tokenParam: shareToken
        };
        
        socket.connect();
        socket.emit("join-document", docId );

        socket.on("connect", () => {
            setIsConnected(true);
        });

        socket.on("load-document", (data) => {
            if (typeof data === "object" && data !== null) {
                setContent(data.content);
                setPermission(data.permission);
                setIsLoading(false);
                setIsConnected(true);
            }
        });

        socket.on("users-in-doc", (users) => {
            setUsers(users);
        });

        socket.on("receive-operation", ({ operation, userId, cursor }) => {
            if (userId === socket.id) return;
            setContent((prev) => applyOperation(prev, operation));

            setCursors((prev) => ({
                ...prev,
                [userId]: cursor
            }));
        });

        socket.on("receive-cursor-position", ({ userId, position }) => {
            setCursors((prev) => ({
                ...prev,
                [userId]: position
            }));
        });

        socket.on("user-disconnected", ({ userId }) => {
            setCursors((prev) => {
                const newCursors = { ...prev };
                delete newCursors[userId];
                return newCursors;
            });

            setUsers((prev) => prev.filter(u => u.userId !== userId));

        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err);
            if (err.message === "Authentication error") {
                logout();
                navigate("/login");
            }
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socket.emit("leave-document", docId);
            socket.off("connect");
            socket.off("load-document");
            socket.off("receive-operation");
            socket.off("users-in-doc");
            socket.off("receive-cursor-position");
            socket.off("user-disconnected");
            socket.off("connect_error");
            socket.off("disconnect");
        };
    }, [docId, navigate]);

    const getPermissionLabel = () => {
        switch(permission) {
            case "owner": return { label: "owner", color: "#e5b567" };
            case "write": return { label: "write access", color: "#64ffda" };
            default: return { label: "view only", color: "#cb4b16" };
        }
    };

    const permissionInfo = getPermissionLabel();

    if(isLoading){
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
                <motion.div
                    className="w-16 h-16 border-4 border-t-4 border-gray-700 rounded-full"
                    style={{ borderColor: "#64ffda transparent transparent transparent" }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
            {/* Subtle grid pattern */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 40px, rgba(100, 255, 218, 0.03) 40px, rgba(100, 255, 218, 0.03) 41px)`
                }}
            />

            {/* Connection status bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
                <motion.div
                    className="h-full"
                    style={{ backgroundColor: isConnected ? "#64ffda" : "#cb4b16" }}
                    initial={{ width: "100%" }}
                    animate={{ width: isConnected ? "100%" : "100%" }}
                />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b backdrop-blur-xl"
                style={{
                    backgroundColor: "rgba(10, 15, 26, 0.95)",
                    borderBottomColor: "rgba(100, 255, 218, 0.08)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 text-sm font-mono transition-all"
                            style={{ color: "#839496" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#64ffda"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#839496"}
                        >
                            <span>←</span>
                            <span>~/dashboard</span>
                        </motion.button>
                        <span className="text-xs font-mono px-2 py-1 rounded"
                            style={{
                                backgroundColor: "rgba(100, 255, 218, 0.08)",
                                color: "#839496"
                            }}
                        >
                            {docId?.slice(-8)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Permission badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                            style={{
                                backgroundColor: `${permissionInfo.color}10`,
                                border: `1px solid ${permissionInfo.color}30`
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: permissionInfo.color }}></span>
                            <span className="text-xs font-mono" style={{ color: permissionInfo.color }}>
                                {permissionInfo.label}
                            </span>
                        </div>

                        {/* Online users count */}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {users.slice(0, 3).map((user, idx) => (
                                    <div
                                        key={user.userId}
                                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-mono"
                                        style={{
                                            backgroundColor: user.color,
                                            borderColor: "#0a0f1a",
                                            color: "#fff"
                                        }}
                                        title={user.name}
                                    >
                                        {user.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                ))}
                            </div>
                            {users.length > 3 && (
                                <span className="text-xs font-mono" style={{ color: "#586e75" }}>
                                    +{users.length - 3}
                                </span>
                            )}
                            <span className="text-xs font-mono ml-1" style={{ color: "#586e75" }}>
                                {users.length} online
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Editor Container */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="rounded-xl border overflow-hidden"
                    style={{
                        backgroundColor: "#0b1018",
                        borderColor: "rgba(100, 255, 218, 0.1)"
                    }}
                >
                    {/* Editor header with user avatars */}
                    <div className="px-4 py-2 border-b flex items-center justify-between flex-wrap gap-2"
                        style={{ borderBottomColor: "rgba(100, 255, 218, 0.08)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#dc7a6c" }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e5b567" }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#64ffda" }}></div>
                            </div>
                            <span className="text-xs font-mono" style={{ color: "#586e75" }}>
                                {permission === "read" ? "viewing" : "editing"} in real-time
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            {users.map((user) => (
                                <div
                                    key={user.userId}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono"
                                    style={{
                                        backgroundColor: `${user.color}15`,
                                        color: user.color
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: user.color }}></span>
                                    {user.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Editor Component */}
                    <TextEditor
                        content={content}
                        setContent={setContent}
                        docId={docId}
                        cursors={cursors}
                        undoStackRef={undoStackRef}
                        redoStackRef={redoStackRef}
                        permission={permission}
                        users={users}
                    />
                </div>

                {/* Status bar */}
                <div className="mt-4 flex justify-between items-center text-xs font-mono px-2"
                    style={{ color: "#586e75" }}
                >
                    <div className="flex items-center gap-4">
                        <span>📄 {content.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        <span>🔤 {content.length} characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "animate-pulse" : ""}`}
                            style={{ backgroundColor: isConnected ? "#64ffda" : "#cb4b16" }}
                        />
                        <span>{isConnected ? "connected" : "disconnected"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}