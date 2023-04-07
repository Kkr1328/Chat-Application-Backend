// import
const uuidv4 = require("uuid").v4;
const Message = require("../models/Message");
const GroupChat = require("../models/GroupChat");
const mongoose = require("mongoose");

const messages = new Set();
const users = new Map();

const exchatid = "642e965094cc636716a8ceee";

const defaultUser = {
  id: "anon",
  name: "Anonymous",
};

async function createMongoMessage({ chatId, value }) {
  const group_id = await GroupChat.findById(exchatid);
  await Message.create({
    chat_id: group_id,
    message: value,
  });
}

async function getMongoMessages() {
  return await Message.find({});
}

async function getMongoMessageID({ chatId, value }) {
  const group_id = await GroupChat.findById(exchatid);
  console.log(group_id._id);
  console.log(value);
  const selected_messages = await Message.find({
    chat_id: group_id._id,
    message: value,
  });
  console.log(selected_messages);
  return selected_messages[0]._id;
}

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    getMongoMessages().then((prevMessages) => {
      prevMessages.forEach((prevMessage) => {
        const message = JSON.stringify({
          id: prevMessage._id,
          user: users.get(this.socket) || defaultUser,
          chat_id: prevMessage.chat_id,
          message: prevMessage.message,
        });

        if (!messages.has(message)) {
          messages.add(message);
          this.sendMessage(message);
        }
      });
    });

    socket.on("getMessages", (chatId) => this.getMessages(chatId));
    socket.on("message", (value) => this.handleMessage(value));
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendMessage(message) {
    this.io.sockets.emit("message", JSON.parse(message));
  }

  getMessages(chatId) {
    console.log(messages);
    messages.forEach((message) => {
      if (JSON.stringify(JSON.parse(message).chat_id) === chatId) {
        this.sendMessage(message);
      }
    });
  }

  handleMessage(value) {
    createMongoMessage({ exchatid, value }).then(() =>
      getMongoMessageID({ exchatid, value }).then((messageID) => {
        {
          const message = JSON.stringify({
            id: messageID,
            user: users.get(this.socket) || defaultUser,
            chat_id: exchatid,
            message: value,
            time: Date.now(),
          });

          messages.add(message);
          this.sendMessage(message);
        }
      })
    );
  }

  disconnect() {
    console.log("user disconnect");

    users.delete(this.socket);
  }
}

module.exports = Connection;
