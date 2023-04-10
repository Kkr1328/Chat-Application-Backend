const {
  createMongoMessage,
  getMongoMessages,
  likeMongoMessageByIdentifiers,
  unlikeMongoMessageByIdentifiers,
} = require("../mongo_services/MessageMongoService");
const { existMongoUserById } = require("../mongo_services/UserMongoService");
const { existMongoChatHavingChatId } = require("../mongo_services/ChatMongoService");
const { default: mongoose } = require("mongoose");
const uuidv4 = require("uuid").v4;

class MessageService {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    // identifier = type ["Direct", "Group"] + ownerId + chatId
    socket.on("getMessages", (identifier) => this.getMessages(identifier));
    // client site
    // socket.on("message", messageListener);
    // socket.on("get_messages_response", (res: any) => console.log(res.message));
    // socket.emit("getMessages", identifier);

    // message information = type ["Direct", "Group"] + ownerId + ownerName + chatId + message
    socket.on("createMessage", (messageInfo) => this.createMessage(messageInfo));
    // client site
    // socket.emit("createMessage", messageInfo);

    // identifier = ownerId + messageId
    socket.on("likeMessage", (identifier) => this.likeMessage(identifier));
    // client site
    // socket.on("like_message_response", (res: any) => console.log(res.message));
    // socket.emit("likeMessage", identifier);

    // identifier = ownerId + messageId
    socket.on("unlikeMessage", (identifier) => this.unlikeMessage(identifier));
    // client site
    // socket.on("unlike_message_response", (res: any) => console.log(res.message));
    // socket.emit("unlikeMessage", identifier);
  }

  sendMessage(ownerId, message) {
    const obj_message = JSON.parse(message);
    const isOwner = obj_message.user_id === ownerId;
    const isLike = obj_message.liked_users.includes(ownerId);
    const new_message = {
      _id: obj_message._id,
      message: obj_message.message,
      userId: obj_message.user_id,
      username: obj_message.username,
      isOwner: isOwner,
      isLike: isLike,
      like: obj_message.like,
      createdAt: obj_message.created_at,
    };

    this.io.sockets.emit("message", new_message);
  }

  getMessages(identifier) {
    const { type, ownerId, chatId } = identifier;

    existMongoUserById(ownerId).then((userResult) => {
      if (userResult) {
        existMongoChatHavingChatId({ type, chatId }).then((chatResult) => {
          if (chatResult) {
            getMongoMessages({ type, chatId }).then((prevMessages) => {
              prevMessages.forEach((prevMessage) => {
                this.sendMessage(ownerId, JSON.stringify(prevMessage));
              });
            });
          } else {
            this.socket.emit("get_messages_response", {
              message: "Chat id is invalid",
            });
          }
        });
      } else {
        this.socket.emit("get_messages_response", {
          message: "Your user id is invalid",
        });
      }
    });
  }

  createMessage(messageInfo) {
    const { type, ownerId, ownerName, chatId, message } = messageInfo;

    const new_id = new mongoose.Types.ObjectId();
    const new_message = {
      _id: new_id,
      user_id: ownerId,
      username: ownerName,
      chat_id: chatId,
      message: message,
      liked_users: [],
      like: 0,
      created_at: Date.now(),
    };
    this.sendMessage(ownerId, JSON.stringify(new_message));
    createMongoMessage({ type: type, message: new_message });
  }

  likeMessage(identifier) {
    const { ownerId, messageId } = identifier;
    likeMongoMessageByIdentifiers({ ownerId, messageId });
  }

  unlikeMessage(identifier) {
    const { ownerId, messageId } = identifier;
    unlikeMongoMessageByIdentifiers({ ownerId, messageId });
  }
}

module.exports = MessageService;
