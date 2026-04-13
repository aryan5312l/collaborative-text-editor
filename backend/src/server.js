const express = require("express");
require("dotenv").config();
const http = require("http");
const {initSocket} = require("./socketHandler");

const connectDB = require("./config/db");
connectDB();
const cors = require("cors");



const app = express()
app.use(cors())

const server = http.createServer(app)

initSocket(server);

server.listen(5000, () => {
    console.log("Server is running on port 5000");
})