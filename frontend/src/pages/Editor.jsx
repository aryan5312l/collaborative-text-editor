import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import TextEditor from "../components/TextEditor";
import { useParams } from "react-router-dom";
import { applyOperation } from "../utils/operationUtils";
import { useRef } from "react";
import { getToken, logout } from "../utils/auth";

export default function Editor() {
    const { id: docId } = useParams();
    const [content, setContent] = useState("");
    const [cursors, setCursors] = useState({});
    const [permission, setPermission] = useState("read");
    const [users, setUsers] = useState([]);

    const undoStackRef = useRef([]);
    const redoStackRef = useRef([]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.error("No token found, redirecting to login");
            window.location.href = "/login";
            return;
        }

        socket.auth = { token };
        socket.connect();

        socket.emit("join-document", docId);

        socket.on("load-document", (data) => {
            if (typeof data === "object" && data !== null) {
                setContent(data.content);
                setPermission(data.permission);
            }
        });

        socket.on("users-in-doc", (users) => {
            setUsers(users);
        });

        socket.on("receive-operation", ({ operation, userId, cursor }) => {
            if (userId === socket.id) return; // Ignore own operations
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

        // Cleanup on unmount
        socket.on("user-disconnected", ({ userId }) => {
            setCursors((prev) => {
                const newCursors = { ...prev };
                delete newCursors[userId];
                return newCursors;
            });
        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err);

            if (err.message === "Authentication error") {
                //logout user
                logout();
                window.location.href = "/login";
            }
        });

        return () => {
            socket.off("load-document");
            socket.off("receive-operation");
            socket.off("users-in-doc");
            socket.off("receive-cursor-position");
            socket.off("user-disconnected");
            socket.off("disconnect");
        };


    }, []);

    return (
        <div>
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
            <h3>
                {permission === "owner" && "Owner"}
                {permission === "write" && "Can Edit"}
                {permission === "read" && "View Only"}
            </h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                {users.map((u) => (
                    <div
                        key={u.userId}
                        style={{
                            padding: "5px 10px",
                            background: u.color,
                            color: "#fff",
                            borderRadius: "10px"
                        }}
                    >
                        {u.name}
                    </div>
                ))}
            </div>
        </div>
    );
}