// import
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 9000;
app.use(express.json());
app.use(cors());
const connectDB = require("./config/dbConn");

connectDB();
mongoose.connection.once("open", () => {
  server.listen(PORT, () => {
    console.log(`Connected to MongoDB on port: ${PORT}`);
  });
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});

const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server, {
  transports: ["websocket", "polling"],
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

const MessageService = require("./utilities/MessageSocketService");
const GroupChatService = require("./utilities/GroupChatSocketService");
const UserService = require("./utilities/UserSocketService");
io.on("connection", (socket) => {
  new MessageService(io, socket);
  new GroupChatService(io, socket);
  new UserService(io, socket);
});
