// import
const GroupChat = require("../models/GroupChat");

const groups = new Set();

async function createMongoGroup(groupName) {
  await GroupChat.create({ name: groupName });
}

async function getMongoGroups() {
  return await GroupChat.find({});
}

async function getMongoGroupID(groupName) {
  const selectedGroup = await GroupChat.find({ name: groupName });
  return selectedGroup[0]._id;
}

class GroupChatRoom {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    getMongoGroups().then((prevGroups) => {
      prevGroups.forEach((prevGroup) => {
        const group = JSON.stringify({
          id: prevGroup._id,
          name: prevGroup.name,
        });

        if (!groups.has(group)) {
          groups.add(group);
        }
      });
    });

    socket.on("getGroups", () => this.getGroups());
    socket.on("group", (groupName) => this.createGroup(groupName));
  }

  sendGroup(group) {
    this.io.sockets.emit("group", JSON.parse(group));
  }

  getGroups() {
    console.log(groups);
    groups.forEach((group) => this.sendGroup(group));
  }

  createGroup(groupName) {
    createMongoGroup(groupName).then(() =>
      getMongoGroupID(groupName).then((groupID) => {
        const group = JSON.stringify({
          id: groupID,
          name: groupName,
        });

        groups.add(group);
        this.sendGroup(group);
      })
    );
  }
}

module.exports = GroupChatRoom;
