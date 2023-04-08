const {
  createMongoGroupChat,
  getMongoGroupChats,
  getMongoGroupByName,
} = require("../mongo_services/GroupChatMongoService");

class GroupChatService {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("getGroups", () => this.getGroups());
    socket.on("group", (groupName) => this.createGroup(groupName));
  }

  sendGroup(group) {
    this.io.sockets.emit("group", JSON.parse(group));
  }

  getGroups() {
    getMongoGroupChats().then((prevGroups) => {
      prevGroups.forEach((prevGroup) => {
        this.sendGroup(JSON.stringify(prevGroup));
      });
    });
  }

  createGroup(groupName) {
    createMongoGroupChat(groupName).then(() =>
      getMongoGroupByName(groupName).then((group) => {
        this.sendGroup(JSON.stringify(group));
      })
    );
  }
}

module.exports = GroupChatService;
