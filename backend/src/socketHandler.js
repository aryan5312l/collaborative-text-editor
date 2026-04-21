const { applyOperation, transformOperation, invertOperation } = require("./services/operationService");
const Document = require("./models/documentModel");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");

const saveTimers = {};
const latestContent = {};
const pendingOps = {};
const docUsers = {};


function initSocket(server) {
    const { Server } = require("socket.io");

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication error"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            return next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected: ", socket.user._id, socket.user.name);

        //Join document room
        socket.on("join-document", async (docId) => {
            let permission = "read";
            const token = socket.handshake.auth.tokenParam;

            socket.join(docId);
            console.log(docId);
            // const document = await Document.findOneAndUpdate(
            //     { docId },
            //     { $setOnInsert: { docId, content: "", history: [] } },
            //     { upsert: true, returnDocument: "after" }
            // );

            const document = await Document.findOne({ docId });
            if (!document) {
                console.error("Document not found:", docId);
                return;
            }

            const isOwner = document?.userId?.toString() === socket.user._id.toString();

            const isShared = document?.sharedWith.some(
                u => u.userId.toString() === socket.user._id.toString()
            );

            const hasLinkAccess = 
                token &&
                document.shareLink?.token === token;

            if (!isOwner && !isShared && !hasLinkAccess) {
                return socket.emit("error", "Not authorized to access this document");
            }

            //track users
            if(!docUsers[docId]) docUsers[docId] = [];

            const already = docUsers[docId].find(
                (u) => u.userId === socket.user._id.toString()
            );

            if(!already) {
                docUsers[docId].push({
                    userId: socket.user._id.toString(),
                    name: socket.user.name,
                    color: getRandomColor()
                });
            }

            //send users in doc to clients
            io.to(docId).emit("users-in-doc", docUsers[docId]);

            socket.docId = docId; //store for disconnection

            if(isOwner) permission = "owner";
            else if(isShared) {
                const sharedUser = document.sharedWith.find(
                    u => u.userId.toString() === socket.user._id.toString()
                );
                permission = sharedUser.permission;
            }
            else if(hasLinkAccess) {
                permission = document.shareLink.permission;
            }



            if (!latestContent[docId]) {
                latestContent[docId] = document.content;
            }
            console.log("Token received:", socket.handshake.auth.tokenParam);

            socket.emit("load-document",{
                content: latestContent[docId] || document.content,
                permission
            });
        });

        //Undo Handle
        // socket.on("undo", (docId) => {
        //     if (!undoStack[docId] || undoStack[docId].length === 0) return;

        //     const entry = undoStack[docId].pop();
        //     const op = entry.inverse;

        //     //Apply undo operation
        //     latestContent[docId] = applyOperation(latestContent[docId], op);

        //     //Push entry to redo stack
        //     if (!redoStack[docId]) redoStack[docId] = [];
        //     redoStack[docId].push(entry);

        //     // Broadcast to all clients
        //     io.to(docId).emit("receive-operation", {
        //         operation: op,
        //         userId: socket.id,
        //         cursor: null
        //     });
        // });

        //Redo Handle
        // socket.on("redo", (docId) => {
        //     if (!redoStack[docId] || redoStack[docId].length === 0) return;

        //     const entry = redoStack[docId].pop();
        //     const op = entry.original;

        //     latestContent[docId] = applyOperation(latestContent[docId], op);

        //     if (!undoStack[docId]) undoStack[docId] = [];
        //     undoStack[docId].push(entry);

        //     io.to(docId).emit("receive-operation", {
        //         operation: op,
        //         userId: socket.id,
        //         cursor: null
        //     });
        // });

        //Cursor Move Handle
        socket.on("cursor-move", ({ docId, position }) => {
            socket.to(docId).emit("receive-cursor-position", {
                userId: socket.user._id.toString(),
                position
            });
        });


        //Receive operation from client
        socket.on("send-operation", async ({ docId, operation, cursor }) => {
            let document = await Document.findOne({ docId });
            if (!latestContent[docId]) {
                latestContent[docId] = document?.content || "";
            }

            const isOwner = document?.userId?.toString() === socket.user._id.toString();

            const sharedUser = document.sharedWith.find(
                u => u.userId.toString() === socket.user._id.toString()
            );

            const hasLinkAccess = 
                socket.handshake.auth.tokenParam &&
                document.shareLink?.token === socket.handshake.auth.tokenParam;

            const canEdit =
                isOwner || (sharedUser && sharedUser.permission === "write") || (hasLinkAccess && document.shareLink?.permission === "write");

            if (!canEdit) return; // block edits

            // Apply operation
            latestContent[docId] = applyOperation(latestContent[docId], operation);

            // Save for DB (debounced)
            if (!pendingOps[docId]) pendingOps[docId] = [];
            pendingOps[docId].push(operation);

            if (saveTimers[docId]) clearTimeout(saveTimers[docId]);

            saveTimers[docId] = setTimeout(async () => {
                try {
                    await Document.findOneAndUpdate(
                        { docId },
                        {
                            content: latestContent[docId],
                            $push: { history: { $each: pendingOps[docId] } }
                        }
                    );

                    pendingOps[docId] = [];
                    console.log("Saved to DB:", docId);

                } catch (err) {
                    console.error(err);
                }
            }, 1500);

            // Broadcast
            socket.to(docId).emit("receive-operation", {
                operation,
                userId: socket.user._id,
                userName: socket.user.name,
                cursor
            });
        });



        socket.on("disconnect", () => {
            const docId = socket.docId;

            if(!docId || !docUsers[docId]) return;

            docUsers[docId] = docUsers[docId].filter(
                u => u.userId !== socket.user._id.toString()
            );

            io.to(docId).emit("users-in-doc", docUsers[docId]);
            console.log("User disconnected", socket.user._id, socket.user.name);

            io.emit("user-disconnected", { userId: socket.id });
        });
    })
}

function getRandomColor(){
    const colors = [
        "#FF5733", "#33FF57", "#3357FF",
        "#FF33A8", "#33FFF3", "#F3FF33",
        "#8D33FF", "#FF8D33"
    ]

    return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { initSocket, getRandomColor };