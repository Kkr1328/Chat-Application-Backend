const { createMongoMessage, getMongoMessages } = require("../mongo_services/MessageMongoService");
const uuidv4 = require("uuid").v4;

class MessageService {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("getMessages", (chatId) => this.getMessages(chatId));
    socket.on("message", ({ chatId, message }) => this.createMessage({ chatId, message }));
  }

  sendMessage(message) {
    this.io.sockets.emit("message", JSON.parse(message));
  }

  getMessages(chatId) {
    getMongoMessages(chatId).then((prevMessages) => {
      prevMessages.forEach((prevMessage) => {
        this.sendMessage(JSON.stringify(prevMessage));
      });
    });
  }

  createMessage({ chatId, message }) {
    this.sendMessage(
      JSON.stringify({
        _id: uuidv4(),
        chat_id: chatId,
        message: message,
        created_at: Date.now(),
      })
    );
    createMongoMessage({ chatId, message });
  }
}

module.exports = MessageService;
