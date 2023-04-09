const {
  createMongoGroupChat,
  getMongoGroupChats,
  getMongoGroupByName,
  existMongoGroupHavingGroupName,
} = require("../mongo_services/GroupChatMongoService");

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

    socket.on("createGroup", (groupName) => this.createGroup(groupName));
    // client site
    // socket.on("create_group_response", (res: any) => console.log(res.message));
    // socket.emit("createGroup", groupName);

    // update information = type ["Direct", "Group"] + chat id + new background image
    socket.on("updateBackground", (updateInfo) => this.updateBackground(updateInfo));
    // client site
    // socket.on("update_background_response", (res: any) => console.log(res.message));
    // socket.emit("updateBackground", updateInfo);
  }

  getGroups() {
    this.socket.emit("get_groups_response", { message: "Success" });
    getMongoGroupChats().then((prevGroups) => {
      prevGroups.forEach((prevGroup) => {
        this.sendGroup(prevGroup);
      });
    });
  }

  sendGroup(group) {
    this.io.sockets.emit("group", group);
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
}

module.exports = GroupChatService;
