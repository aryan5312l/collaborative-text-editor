const { applyOperation, transformOperation } = require("./services/operationService");
const Document = require("./models/documentModel");



function initSocket(server) {
    const { Server } = require("socket.io");

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);

        socket.on("join-document", async (docId) => {
            socket.join(docId);

            const document = await Document.findOneAndUpdate(
                { docId },
                { $setOnInsert: { docId, content: "", history: [] } },
                { returnDocument: "after", upsert: true }
            );

            socket.emit("load-document", document.content || "");
        });

        socket.on("send-operation", async ({ docId, operation, cursor }) => {
            const document = await Document.findOne({ docId });

            if (!document) return;


            document.content = applyOperation(document.content, operation);
            document.history.push(operation);

            await document.save();

            socket.to(docId).emit("receive-operation", {
                operation,
                userId: socket.id,
                cursor
            });


            // const transformedOp = transformOperation(operation, doInstance.history);

            // doInstance.content = applyOperation(doInstance.content, transformedOp);

            // doInstance.history.push(transformedOp);

            // socket.to(docId).emit("receive-operation", transformedOp);
        });



        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    })
}

module.exports = { initSocket }