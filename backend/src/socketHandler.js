const { applyOperation, transformOperation } = require("./services/operationService");
const Document = require("./models/documentModel");

const saveTimers = {};
const latestContent = {};
const pendingOps = {};

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
                { upsert: true, returnDocument: "after" }
            );

            if (!latestContent[docId]) {
                latestContent[docId] = document.content;
            }

            socket.emit("load-document", latestContent[docId]);
        });

        socket.on("send-operation", async ({ docId, operation, cursor }) => {

            latestContent[docId] = applyOperation(latestContent[docId], operation);

            if (!pendingOps[docId]) pendingOps[docId] = [];
            pendingOps[docId].push(operation);

            if (saveTimers[docId]) clearTimeout(saveTimers[docId]);

            saveTimers[docId] = setTimeout(async () => {
                try {
                    const opsToSave = pendingOps[docId] || [];

                    await Document.findOneAndUpdate(
                        { docId },
                        {
                            content: latestContent[docId],
                            $push: { history: { $each: opsToSave } }
                        }
                    );

                    pendingOps[docId] = [];
                    console.log("Saved to DB:", docId);

                } catch (err) {
                    console.error(err);
                }
            }, 1500);

            socket.to(docId).emit("receive-operation", {
                operation,
                userId: socket.id,
                cursor
            });
        });



        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    })
}

module.exports = { initSocket }