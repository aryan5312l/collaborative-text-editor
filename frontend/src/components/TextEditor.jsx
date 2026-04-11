import { socket } from "../socket/socket";

export default function TextEditor({ content, setContent, docId }) {

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

    return (
        <textarea
            value={content}
            onChange={handleChange}
            rows={20}
            cols={80}
        />
    );
}