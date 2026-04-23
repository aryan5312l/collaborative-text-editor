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

function transformOperation(op1, op2) {
    let result = { ...op1 };

    // ========================
    // INSERT vs INSERT
    // ========================
    if (op1.type === "insert" && op2.type === "insert") {
        if (
            op2.position < op1.position ||
            (op2.position === op1.position)
        ) {
            result.position += op2.text.length;
        }
    }

    // ========================
    // INSERT vs DELETE
    // ========================
    else if (op1.type === "insert" && op2.type === "delete") {
        if (op2.position < op1.position) {
            result.position -= Math.min(
                op2.length,
                op1.position - op2.position
            );
        }
    }

    // ========================
    // DELETE vs INSERT
    // ========================
    else if (op1.type === "delete" && op2.type === "insert") {
        if (op2.position <= op1.position) {
            result.position += op2.text.length;
        } else if (op2.position < op1.position + op1.length) {
            // Insert inside delete range → expand delete
            result.length += op2.text.length;
        }
    }

    // ========================
    // DELETE vs DELETE
    // ========================
    else if (op1.type === "delete" && op2.type === "delete") {

        // Case 1: op2 completely before op1
        if (op2.position + op2.length <= op1.position) {
            result.position -= op2.length;
        }

        // Case 2: op2 completely after op1
        else if (op2.position >= op1.position + op1.length) {
            // no change
        }

        // Case 3: overlap
        else {
            const start = Math.min(op1.position, op2.position);
            const end = Math.max(
                op1.position + op1.length,
                op2.position + op2.length
            );

            result.position = start;
            result.length = end - start - op2.length;
        }
    }

    return result;
}

function invertOperation(content, operation){
    if(operation.type === "insert"){
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

module.exports = {applyOperation, transformOperation, invertOperation};