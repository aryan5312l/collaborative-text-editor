const {applyOperation, transformOperation} = require("./services/operationService");
const Document = require("./models/documentModel");

let documents = {};

function initSocket(server){
    const {Server} = require("socket.io");

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);

        socket.on("join-document", (docId) => {
            socket.join(docId);

            if(!documents[docId]){
                documents[docId] = new Document(docId);
            }

            socket.emit("load-document", documents[docId].content || "");
        });

        socket.on("send-operation", ({docId, operation}) => {
            const doInstance = documents[docId];

            if(doInstance){
                doInstance.content = applyOperation(doInstance.content, operation);

                doInstance.history.push(operation);

                socket.to(docId).emit("receive-operation", operation);
            }

            // const transformedOp = transformOperation(operation, doInstance.history);

            // doInstance.content = applyOperation(doInstance.content, transformedOp);

            // doInstance.history.push(transformedOp);

            // socket.to(docId).emit("receive-operation", transformedOp);
        });

        socket.on("cursor-move", ({docId, position}) => {
            socket.to(docId).emit("receive-cursor", {userId: socket.id, position});
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    })
}

module.exports = {initSocket}