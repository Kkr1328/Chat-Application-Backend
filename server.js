// import
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const chat = require("./utilities/chat");

const app = express();
app.use(cors());

const PORT = 9000;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
  allowEIO3: true,
});
chat(io);
