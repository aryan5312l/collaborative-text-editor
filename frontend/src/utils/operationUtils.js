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