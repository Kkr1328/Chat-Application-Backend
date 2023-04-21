const {
  createMongoGroupChat,
  getMongoGroupChats,
  getMongoGroupByName,
  existMongoGroupHavingGroupName,
  getMongoGroupByChatId,
} = require("../mongo_services/GroupChatMongoService");

const {
  getMongoDirectByChatId,
  getMongoDirectByUserId,
} = require("../mongo_services/DirectChatMongoService");

const {
  existMongoChatHavingChatId,
  updateMongoChatBackgroundImageByChatId,
} = require("../mongo_services/ChatMongoService");

class GroupChatService {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("getGroups", () => this.getGroups());
    // client site
    // socket.on("group", userListener);
    // socket.on("get_groups_response", (res: any) => console.log(res.message));
    // socket.emit("getGroups");

    socket.on("getGroupById", (chatId) => this.getGroupById(chatId));
    // client site
    // socket.on("group", userListener);
    // socket.on("get_group_by_id_response", (res: any) => console.log(res.message));
    // socket.emit("getGroupById", chatId);

    socket.on("createGroup", (groupName) => this.createGroup(groupName));
    // client site
    // socket.on("create_group_response", (res: any) => console.log(res.message));
    // socket.emit("createGroup", groupName);

    // update information = type ["Direct", "Group"] + chat id + new background image
    socket.on("updateBackground", (updateInfo) => this.updateBackground(updateInfo));
    // client site
    // socket.on("update_background_response", (res: any) => console.log(res.message));
    // socket.emit("updateBackground", updateInfo);

    // ids = myUserId + chatId
    socket.on("getDirectByChatId", (ids) => this.getDirectByChatId(ids));
    // socket.on("get_direct_by_chat_id_response", (res: any) => console.log(res.message));
    // socket.emit("getDirectByChatId", ids);

    // ids = myUserId + userId
    socket.on("getDirectByUserId", (ids) => this.getDirectByUserId(ids));
    // socket.on("get_direct_by_user_id_response", (res: any) => console.log(res.message));
    // socket.emit("getDirectByUserId", ids);
  }

  getGroups() {
    this.socket.emit("get_groups_response", { message: "Success" });
    getMongoGroupChats().then((prevGroups) => {
      prevGroups.forEach((prevGroup) => {
        this.sendGroup(prevGroup);
      });
    });
  }

  getGroupById(chatId) {
    this.socket.emit("get_group_by_id_response", { message: "Success" });
    getMongoGroupByChatId(chatId).then((group) => {
      this.sendGroup(group);
    });
  }

  sendGroup(group) {
    const new_group = {
      _id: group._id,
      name: group.name,
      backgroundImage: group.background_image,
    };
    this.io.sockets.emit("group", new_group);
  }

  createGroup(groupName) {
    existMongoGroupHavingGroupName(groupName).then((result) => {
      // check at least groupName length
      if (groupName.length < 1) {
        this.socket.emit("create_group_response", {
          message: "GroupName should be at least 1 character",
        });
        return;
      }

      // check at most groupName length
      if (groupName.length > 20) {
        this.socket.emit("create_group_response", {
          message: "GroupName should be at most 20 characters",
        });
        return;
      }

      // check having username
      if (result) {
        this.socket.emit("create_group_response", "GroupName already in use");
        return;
      }

      // valid groupname and create group
      this.socket.emit("create_group_response", { message: "Success" });
      createMongoGroupChat(groupName).then(() =>
        getMongoGroupByName(groupName).then((group) => {
          this.sendGroup(group);
        })
      );
    });
  }

  updateBackground(updateInfo) {
    const { type, chatId, backgroundImage } = updateInfo;
    existMongoChatHavingChatId({ type: type, chat_id: chatId }).then((result) => {
      if (result) {
        this.socket.emit("update_background_response", "Chat id is invalid");
        return;
      }

      // valid caht id and update background
      this.socket.emit("update_background_response", { message: "Success" });
      updateMongoChatBackgroundImageByChatId({
        type: type,
        chat_id: chatId,
        background_image: backgroundImage,
      });
    });
  }

  getDirectByChatId(ids) {
    getMongoDirectByChatId(ids).then((user) => {
      this.socket.emit("get_direct_by_chat_id_response", {
        chatId: ids.chatId,
        message: "Success",
        username: user.username,
        userId: user._id,
        profileImage: user.profile_image,
        backgroundImage: user.background_image,
      });
    });
  }

  getDirectByUserId(ids) {
    getMongoDirectByUserId(ids).then((chat) => {
      this.socket.emit("get_direct_by_user_id_response", {
        message: "Success",
        chatId: chat ? chat._id : "",
      });
    });
  }
}

module.exports = GroupChatService;
