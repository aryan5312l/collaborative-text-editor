const express = require("express");
require("dotenv").config();
const http = require("http");
const {initSocket} = require("./socketHandler");

const connectDB = require("./config/db");
connectDB();
const cors = require("cors");

const app = express()

app.use(cors({
    origin: "*", // later restrict
}));

const server = http.createServer(app)

initSocket(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})