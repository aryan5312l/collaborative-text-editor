import { invertOperation } from "../utils/operationUtils";
import { socket } from "../socket/socket";
import { useRef } from "react";
import { applyOperation } from "../utils/operationUtils";

export default function TextEditor({ content, setContent, docId, cursors, undoStackRef, redoStackRef }) {
    const mirrorRef = useRef(null);

    const handleChange = (e) => {
        const newText = e.target.value;
        const oldText = content || "";
        const cursorPos = e.target.selectionStart;

        

        let start = 0;

        // Find first difference
        while (
            start < oldText.length &&
            start < newText.length &&
            oldText[start] === newText[start]
        ) {
            start++;
        }

        if (newText === oldText) return;

        let operation = null;

        // INSERT
        if (newText.length > oldText.length) {
            const insertedText = newText.slice(start, newText.length - (oldText.length - start));
            if (!insertedText) return;

            operation = {
                type: "insert",
                position: start,
                text: insertedText
            };
        }

        // DELETE
        else {
            const deleteLength = oldText.length - newText.length;
            if (deleteLength === 0) return;

            operation = {
                type: "delete",
                position: start,
                length: deleteLength
            };
        }

        //if(!operation) return;

        const inverseOp = invertOperation(oldText, operation);

        //Store both original and inverse in undo stack
        undoStackRef.current.push({
            original: operation,
            inverse: inverseOp
        });
        redoStackRef.current = []; // Clear redo stack on new operation

        setContent(newText);

        //Send both cursor and operation
        socket.emit("send-operation", {
            docId,
            operation,
            cursor: cursorPos
        });
    };

    const handleSelect = (e) => {
        const cursorPos = e.target.selectionStart;

        socket.emit("cursor-move", { docId, position: cursorPos });
    };

    function getCursorCoordinates(position) {
        const mirror = mirrorRef.current;
        if (!mirror) return { top: 0, left: 0 };

        const textBefore = content.slice(0, position);

        //Insert text + a marker
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

        const myId = socket.id;

        return Object.entries(cursors).map(([userId, position]) => {
            if (userId === myId) return null;   // Don't render own cursor

            const { top, left } = getCursorCoordinates(position);

            return (
                <div
                    key={userId}
                    style={{
                        position: "absolute",
                        left,
                        top,
                        width: "2px",
                        height: "20px",
                        backgroundColor: "blue"
                    }}
                />
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


    return (
        <div>
            <div style={{ position: "relative", width: "600px" }}>
                <textarea
                    value={content}
                    onChange={handleChange}
                    onSelect={handleSelect}
                    onClick={handleSelect}
                    rows={20}
                    cols={80}
                    style={{
                        width: "100%",
                        height: "300px",
                        fontFamily: "monospace",
                        fontSize: "16px",
                        lineHeight: "20px",
                        padding: "10px"
                    }}
                />

                <div
                    ref={mirrorRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        visibility: "hidden",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        fontFamily: "monospace",
                        fontSize: "16px",
                        lineHeight: "20px",
                        padding: "10px",
                        width: "100%",
                    }}
                />

                {/* Overlay */}
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

            <button onClick={handleUndo}>Undo</button>
            <button onClick={handleRedo}>Redo</button>
        </div>

    );
}