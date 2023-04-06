// import
const uuidv4 = require("uuid").v4;
const Message = require("../models/Message");
const GroupChat = require("../models/GroupChat");

const messages = new Set();
const users = new Map();

const defaultUser = {
  id: "anon",
  name: "Anonymous",
};

async function createMessage(value) {
  await Message.create({ message: value });
  // await GroupChat.create({ name: "test room 01" });
}

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("getMessages", () => this.getMessages());
    socket.on("message", (value) => this.handleMessage(value));
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendMessage(message) {
    this.io.sockets.emit("message", message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket) || defaultUser,
      value,
      time: Date.now(),
    };

    createMessage(value);

    messages.add(message);
    this.sendMessage(message);
  }

  disconnect() {
    console.log("user disconnect");

    users.delete(this.socket);
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    console.log("a user connects chat");

    new Connection(io, socket);
  });
}

module.exports = chat;
