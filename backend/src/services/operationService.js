function applyOperation(content, operation) {
    content = content || "";
    if(operation.type === "insert"){
        if (!operation.text) return content;
        return(
            content.slice(0, operation.position)  +
            operation.text +  // ← CORRECT +
            content.slice(operation.position)
        );
    }

    if(operation.type === "delete"){
        return(
            content.slice(0, operation.position) +
            content.slice(operation.position + operation.length)
        );
    }
    return content;
}

module.exports = {applyOperation};