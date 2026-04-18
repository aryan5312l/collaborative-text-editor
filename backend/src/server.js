const express = require("express");
require("dotenv").config();
const http = require("http");
const {initSocket} = require("./socketHandler");
const path = require("path");
const connectDB = require("./config/db");
connectDB();
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const app = express()

const { protect } = require("./middleware/authMiddleware");

const cors = require("cors");
app.use(express.json());

app.use(cors({
    origin: "*", // later restrict
}));

// Routes
app.use("/api/docs", documentRoutes);
app.use("/api/auth", authRoutes);

const server = http.createServer(app)

initSocket(server);

// Serve static files
app.use(express.static(path.join(__dirname, "../dist")));

// Handle all routes (React Router)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})