class Document {
    constructor(id, content = ""){
        this.id = id;
        this.content = content;
        this.history = [];
    }

    applyOperation(operation){

    }
}

module.exports = Document;