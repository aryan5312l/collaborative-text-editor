export function applyOperation(content, operation) {
    if (operation.type === "insert") {
        return (
            content.slice(0, operation.position) +
            operation.text +
            content.slice(operation.position)
        );
    }

    if (operation.type === "delete") {
        return (
            content.slice(0, operation.position) +
            content.slice(operation.position + operation.length)
        );
    }

    return content;
}

export function invertOperation(content, operation) {
    if (operation.type === "insert") {
        return {
            type: "delete",
            position: operation.position,
            length: operation.text.length
        };
    }

    const deletedText = content.slice(operation.position, operation.position + operation.length);

    return {
        type: "insert",
        position: operation.position,
        text: deletedText
    };
}