const {
  createMongoMessage,
  getMongoMessages,
  getMongoMessageById,
  updateLikeMongoMessageByIndentifier,
} = require("../mongo_services/MessageMongoService");
const { default: mongoose } = require("mongoose");

class MessageService {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    // identifier = type ["Direct", "Group"] + ownerId + chatId
    socket.on("getMessages", (identifier) => this.getMessages(identifier));
    // socket.on("message", messageListener);
    // socket.on("get_messages_response", (res: any) => console.log(res.message));
    // socket.emit("getMessages", identifier);

    // message information = type ["Direct", "Group"] + ownerId + ownerName + ownerProfileImage + chatId + message
    socket.on("createMessage", (messageInfo) => this.createMessage(messageInfo));
    // socket.emit("createMessage", messageInfo);

    // identifier = ownerId + messageId
    socket.on("likeMessage", (identifier) => this.likeMessage(identifier));
    // socket.on("like_message_response", (res: any) => console.log(res.message));
    // socket.emit("likeMessage", identifier);
  }

  sendMessage(ownerId, message) {
    const obj_message = JSON.parse(message);
    const isOwner = obj_message.user_id === ownerId;
    const isLiked = obj_message.liked_users.includes(ownerId);
    const new_message = {
      _id: obj_message._id,
      message: obj_message.message,
      userId: obj_message.user_id,
      username: obj_message.username,
      profileImage: obj_message.profile_image,
      chatId: obj_message.chat_id,
      isOwner: isOwner,
      isLiked: isLiked,
      like: obj_message.like,
      createdAt: obj_message.created_at,
    };

    this.io.sockets.emit("message", new_message);
  }

  getMessages(identifier) {
    const { type, ownerId, chatId } = identifier;
    getMongoMessages({ type, chatId }).then((prevMessages) => {
      prevMessages.forEach((prevMessage) => {
        this.sendMessage(ownerId, JSON.stringify(prevMessage));
      });
      this.socket.emit("get_messages_response", { message: "Success" });
    });
  }

  createMessage(messageInfo) {
    const { type, ownerId, ownerName, ownerProfileImage, chatId, message } = messageInfo;

    const new_id = new mongoose.Types.ObjectId();
    const new_message = {
      _id: new_id,
      user_id: ownerId,
      username: ownerName,
      profile_image: ownerProfileImage,
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
    getMongoMessageById(messageId).then((message) => {
      var new_liked_users;
      var new_like;
      if (!message.liked_users.includes(ownerId)) {
        new_liked_users = [...message.liked_users, ownerId];
        new_like = new_liked_users.length;
      } else {
        new_liked_users = message.liked_users.filter((id) => id !== ownerId);
        new_like = new_liked_users.length;
      }

      const new_message = {
        _id: message._id,
        user_id: message.user_id,
        username: message.username,
        profile_image: message.profile_image,
        chat_id: message.chat_id,
        message: message.message,
        liked_users: new_liked_users,
        like: new_like,
        created_at: message.created_at,
      };
      console.log(new_message);
      this.sendMessage(ownerId, JSON.stringify(new_message));

      updateLikeMongoMessageByIndentifier({ messageId, new_liked_users, new_like });
    });
  }
}

module.exports = MessageService;
