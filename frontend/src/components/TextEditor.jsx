import { invertOperation } from "../utils/operationUtils";
import { socket } from "../socket/socket";
import { useRef, useEffect } from "react";
import { applyOperation } from "../utils/operationUtils";
import { motion, AnimatePresence } from "framer-motion";

export default function TextEditor({ content, setContent, docId, cursors, undoStackRef, redoStackRef, permission, users, version, setVersion }) {
    const mirrorRef = useRef(null);
    const textareaRef = useRef(null);
    const isReadOnly = permission === "read";

    const handleChange = (e) => {
        if (isReadOnly) return;

        const newText = e.target.value;
        const oldText = content || "";
        const cursorPos = e.target.selectionStart;

        let start = 0;

        while (
            start < oldText.length &&
            start < newText.length &&
            oldText[start] === newText[start]
        ) {
            start++;
        }

        if (newText === oldText) return;

        let operation = null;

        if (newText.length > oldText.length) {
            const insertedText = newText.slice(start, newText.length - (oldText.length - start));
            if (!insertedText) return;

            operation = {
                type: "insert",
                position: start,
                text: insertedText
            };
        } else {
            const deleteLength = oldText.length - newText.length;
            if (deleteLength === 0) return;

            operation = {
                type: "delete",
                position: start,
                length: deleteLength
            };
        }

        const inverseOp = invertOperation(oldText, operation);

        undoStackRef.current.push({
            original: operation,
            inverse: inverseOp
        });
        redoStackRef.current = [];

        setContent(newText);


        socket.emit("send-operation", {
            docId,
            operation,
            cursor: cursorPos,
            version
        });

        // setTimeout(() => {
        //     socket.emit("send-operation", {
        //         docId,
        //         operation,
        //         version,
        //         cursor: cursorPos
        //     });
        // }, 300); // simulate lag
        setVersion(prev => prev + 1);
    };

    const handleSelect = (e) => {
        const cursorPos = e.target.selectionStart;
        socket.emit("cursor-move", { docId, position: cursorPos });
    };

    const handleKeyDown = (e) => {
        if (isReadOnly) return;

        // Ctrl+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
        }
        // Ctrl+Y or Ctrl+Shift+Z for redo
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            handleRedo();
        }
    };

    function getCursorCoordinates(position) {
        const mirror = mirrorRef.current;
        if (!mirror) return { top: 0, left: 0 };

        const textBefore = content.slice(0, position);

        mirror.innerHTML =
            textBefore
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br/>") +
            "<span id='cursor-marker'>|</span>";

        const marker = mirror.querySelector("#cursor-marker");
        if (!marker) return { top: 0, left: 0 };

        const { offsetTop, offsetLeft } = marker;

        return {
            top: offsetTop,
            left: offsetLeft
        };
    }

    const renderCursors = () => {
        if (!cursors) return null;

        const currentUserId = socket.id;

        return Object.entries(cursors).map(([userId, position]) => {
            if (userId === currentUserId) return null;

            const { top, left } = getCursorCoordinates(position);
            const user = users?.find(u => u.userId === userId);

            if (!user) return null;

            return (
                <div key={userId}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width: "2px",
                            height: "20px",
                            backgroundColor: user.color,
                            boxShadow: `0 0 4px ${user.color}`,
                            pointerEvents: "none"
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: "absolute",
                            left,
                            top: top - 22,
                            backgroundColor: user.color,
                            color: "#fff",
                            fontSize: "10px",
                            fontFamily: "monospace",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                    >
                        {user.name}
                    </motion.div>
                </div>
            );
        });
    };

    const handleUndo = () => {
        if (undoStackRef.current.length === 0) return;

        const entry = undoStackRef.current.pop();
        const inverseOp = entry.inverse;

        const newContent = applyOperation(content, inverseOp);

        redoStackRef.current.push(entry);

        setContent(newContent);

        socket.emit("send-operation", {
            docId,
            operation: inverseOp,
            cursor: null
        });
    };

    const handleRedo = () => {
        if (redoStackRef.current.length === 0) return;

        const entry = redoStackRef.current.pop();
        const originalOp = entry.original;

        const newContent = applyOperation(content, originalOp);

        undoStackRef.current.push(entry);

        setContent(newContent);

        socket.emit("send-operation", {
            docId,
            operation: originalOp,
            cursor: null
        });
    };

    const testConcurrent = () => {
        const op1 = { type: "insert", position: 0, text: "A" };
        const op2 = { type: "insert", position: 0, text: "B" };

        socket.emit("send-operation", { docId, operation: op1, version });
        socket.emit("send-operation", { docId, operation: op2, version });
    };

    return (
        <div className="relative">
            <div style={{ position: "relative" }} className="w-full">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onSelect={handleSelect}
                    onClick={handleSelect}
                    onKeyDown={handleKeyDown}
                    readOnly={isReadOnly}
                    className="w-full font-mono outline-none resize-none"
                    style={{
                        backgroundColor: "#0b1018",
                        color: "#ccd6f6",
                        fontSize: "15px",
                        lineHeight: "24px",
                        padding: "20px",
                        minHeight: "500px",
                        fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                        cursor: isReadOnly ? "default" : "text"
                    }}

                    placeholder={isReadOnly ? "view only mode — you can't edit this document" : "start typing... your collaborators will see changes instantly"}
                />

                {/* Hidden mirror for cursor positioning */}
                <div
                    ref={mirrorRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        visibility: "hidden",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                        fontSize: "15px",
                        lineHeight: "24px",
                        padding: "20px",
                        width: "100%",
                        pointerEvents: "none"
                    }}
                />
                <button onClick={testConcurrent}>Test OT</button>

                {/* Cursors overlay */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none"
                    }}
                >
                    {renderCursors()}
                </div>
            </div>

            {/* Undo/Redo toolbar */}
            {!isReadOnly && (
                <div className="absolute bottom-6 right-6 flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUndo}
                        className="px-3 py-2 rounded-lg font-mono text-xs transition-all flex items-center gap-1"
                        style={{
                            backgroundColor: "rgba(15, 20, 32, 0.9)",
                            border: "1px solid rgba(100, 255, 218, 0.2)",
                            color: "#64ffda",
                            backdropFilter: "blur(8px)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.1)";
                            e.currentTarget.style.borderColor = "#64ffda";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(15, 20, 32, 0.9)";
                            e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.2)";
                        }}
                        title="Undo (Ctrl+Z)"
                    >
                        <span>↩️</span>
                        <span>undo</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRedo}
                        className="px-3 py-2 rounded-lg font-mono text-xs transition-all flex items-center gap-1"
                        style={{
                            backgroundColor: "rgba(15, 20, 32, 0.9)",
                            border: "1px solid rgba(100, 255, 218, 0.2)",
                            color: "#64ffda",
                            backdropFilter: "blur(8px)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.1)";
                            e.currentTarget.style.borderColor = "#64ffda";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(15, 20, 32, 0.9)";
                            e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.2)";
                        }}
                        title="Redo (Ctrl+Y)"
                    >
                        <span>↪️</span>
                        <span>redo</span>
                    </motion.button>
                </div>
            )}

            {/* Read-only overlay message */}
            {isReadOnly && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="px-4 py-2 rounded-lg backdrop-blur-sm"
                        style={{
                            backgroundColor: "rgba(10, 15, 26, 0.8)",
                            border: "1px solid rgba(203, 75, 22, 0.3)",
                            color: "#cb4b16"
                        }}
                    >
                        <p className="text-sm font-mono">🔒 view only — you can't edit this document</p>
                    </div>
                </div>
            )}
        </div>
    );
}