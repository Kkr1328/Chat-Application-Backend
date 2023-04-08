// import
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const MessageService = require("./utilities/MessageSocketService");
const GroupChatService = require("./utilities/GroupChatSocketService");
require("dotenv").config();

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB Connected : ${conn.connection.host}`);
};

connectDB();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 9000;
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

io.on("connection", (socket) => {
  console.log("a user connects ");

  new MessageService(io, socket);
  new GroupChatService(io, socket);
});
