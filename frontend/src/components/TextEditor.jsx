import { socket } from "../socket/socket";

export default function TextEditor({ content, setContent, docId, cursors }) {

    const handleChange = (e) => {
        const newText = e.target.value;
        const oldText = content || "";

        let start = 0;

        // Find first difference
        while (
            start < oldText.length &&
            start < newText.length &&
            oldText[start] === newText[start]
        ) {
            start++;
        }

        // INSERT
        if (newText.length > oldText.length) {
            const insertedText = newText.slice(start, newText.length - (oldText.length - start));

            if (!insertedText) return;

            const operation = {
                type: "insert",
                position: start,
                text: insertedText
            };

            socket.emit("send-operation", { docId, operation });
        }

        // DELETE
        else {
            const deleteLength = oldText.length - newText.length;

            const operation = {
                type: "delete",
                position: start,
                length: deleteLength
            };

            socket.emit("send-operation", { docId, operation });
        }

        setContent(newText);
    };

    const handleSelect = (e) => {
        const cursorPos = e.target.selectionStart;

        socket.emit("cursor-move", { docId, position: cursorPos });
    };

    function getCursorCoordinates(position) {
        const textBefore = content.slice(0, position);
        const lines = textBefore.split("\n");

        const lineHeight = 20;
        const charWidth = 9;

        const lineNumber = lines.length - 1;
        const column = lines[lines.length - 1].length;
        

        return {
            top: lineNumber * lineHeight + 10,  //padding top
            left: column * charWidth + 10   //padding left
        }
    }

    const renderCursors = () => {
        if(!cursors) return null;

        const myId = socket.id;

        return Object.entries(cursors).map(([userId, position]) => {
            if(userId === myId) return null;   // Don't render own cursor
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


    return (
        <div style={{ position: "relative", width: "600px" }}>
            <textarea
                value={content}
                onChange={handleChange}
                onSelect={handleSelect}
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
    );
}