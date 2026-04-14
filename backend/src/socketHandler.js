const { applyOperation, transformOperation, invertOperation } = require("./services/operationService");
const Document = require("./models/documentModel");

const saveTimers = {};
const latestContent = {};
const pendingOps = {};

const undoStack = {};
const redoStack = {};

function initSocket(server) {
    const { Server } = require("socket.io");

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);

        //Join document room
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

        //Undo Handle
        socket.on("undo", (docId) => {
            if (!undoStack[docId] || undoStack[docId].length === 0) return;

            const entry = undoStack[docId].pop();
            const op = entry.inverse;

            //Apply undo operation
            latestContent[docId] = applyOperation(latestContent[docId], op);

            //Push entry to redo stack
            if (!redoStack[docId]) redoStack[docId] = [];
            redoStack[docId].push(entry);

            // Broadcast to all clients
            io.to(docId).emit("receive-operation", {
                operation: op,
                userId: socket.id,
                cursor: null
            });
        });

        //Redo Handle
        socket.on("redo", (docId) => {
            if (!redoStack[docId] || redoStack[docId].length === 0) return;

            const entry = redoStack[docId].pop();
            const op = entry.original;

            latestContent[docId] = applyOperation(latestContent[docId], op);

            if (!undoStack[docId]) undoStack[docId] = [];
            undoStack[docId].push(entry);

            io.to(docId).emit("receive-operation", {
                operation: op,
                userId: socket.id,
                cursor: null
            });
        });

        //Cursor Move Handle
        socket.on("cursor-move", ({ docId, position }) => {
            socket.to(docId).emit("receive-cursor-position", {
                userId: socket.id,
                position
            });
        });


        //Receive operation from client
        socket.on("send-operation", async ({ docId, operation, cursor }) => {

            if (!undoStack[docId]) undoStack[docId] = [];
            if (!redoStack[docId]) redoStack[docId] = [];

            //Generate inverse BEFORE applying, so we can undo later
            const inverseOp = invertOperation(latestContent[docId], operation);

            //Push operation entry to undo stack
            undoStack[docId].push({
                original: operation,
                inverse: inverseOp
            });

            // Clear redo stack on new operation
            redoStack[docId] = [];

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

            io.emit("user-disconnected", { userId: socket.id });
        });
    })
}

module.exports = { initSocket }