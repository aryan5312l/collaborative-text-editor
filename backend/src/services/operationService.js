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

function transformOperation(newOp, history){
    let transformed = {...newOp};

    for(let op of history){
        //If prev  op was insert
        if(op.type === "insert"){
            if(op.position <= transformed.position){
                transformed.position += op.text.length;
            }
        }

        //If prev op was delete
        if(op.type === "delete"){
            if(op.position < transformed.position){
                transformed.position -= Math.min(op.length, transformed.position - op.position);
            }
        }

    }

    return transformed;
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