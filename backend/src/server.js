const express = require("express");
const http = require("http");
const {initSocket} = require("./socketHandler");
const cors = require("cors");

const app = express()
app.use(cors())

const server = http.createServer(app)

initSocket(server);

server.listen(5000, () => {
    console.log("Server is running on port 5000");
})