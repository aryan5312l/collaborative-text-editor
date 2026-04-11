import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import TextEditor from "../components/TextEditor";
import { useParams } from "react-router-dom";
import { applyOperation } from "../utils/operationUtils";

export default function Editor() {
    const { id: docId } = useParams();
    const [content, setContent] = useState("");

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

        return () => {
            socket.off();
        };
    }, []);

    return <TextEditor content={content} setContent={setContent} docId={docId} />
}