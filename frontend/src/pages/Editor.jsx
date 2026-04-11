import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import TextEditor from "../components/TextEditor";
import { useParams } from "react-router-dom";
import { applyOperation } from "../utils/operationUtils";

export default function Editor() {
    const { id: docId } = useParams();
    const [content, setContent] = useState("");
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        socket.emit("join-document", docId);

        socket.on("load-document", (data) => {
            if (typeof data === "string") {
                setContent(data);
            }
        });

        socket.on("receive-operation", (operation) => {
            setContent((prev) => applyOperation(prev, operation));
        });

        socket.on("receive-cursor", ({ userId, position }) => {
            setCursors((prev) => ({
                ...prev,
                [userId]: position
            }));
        });

        return () => {
            socket.off();
        };
    }, []);

    return (
        <div>
            <TextEditor content={content} setContent={setContent} docId={docId} cursors={cursors} />

            <div>
                <h4>Other Users Cursor:</h4>
                {Object.entries(cursors).map(([userId, pos]) => (
                    <div key={userId}>
                        {userId}: {pos}
                    </div>
                ))}
            </div>
        </div>
    );
}