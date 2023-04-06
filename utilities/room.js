// import
const uuidv4 = require("uuid").v4;
const GroupChat = require("../models/GroupChat");

const groups = new Set();

async function createMongoGroup(roomName) {
  await GroupChat.create({ name: roomName });
}

async function getMongoGroups() {
  return await GroupChat.find({});
}

async function getMongoGroupID(roomName) {
  return await GroupChat.find({ name: roomName })[0]._id;
}

class GroupChatRoom {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    getMongoGroups().then((prevGroups) => {
      prevGroups.forEach((group) => {
        if (
          !groups.has(
            JSON.stringify({
              id: group._id,
              name: group.name,
            })
          )
        ) {
          groups.add(
            JSON.stringify({
              id: group._id,
              name: group.name,
            })
          );
        }
      });
    });

    socket.on("getGroups", () => this.getGroups());
    socket.on("group", (roomName) => this.createGroup(roomName));
  }

  sendGroup(group) {
    this.io.sockets.emit("group", JSON.parse(group));
  }

  getGroups() {
    console.log(groups);
    groups.forEach((group) => this.sendGroup(group));
  }

  createGroup(roomName) {
    const group = JSON.stringify({
      id: uuidv4(),
      name: roomName,
    });

    createMongoGroup(roomName);

    getMongoGroupID(roomName).then((id) => console.log(id));

    groups.add(group);
    this.sendGroup(group);
  }
}

function room(io) {
  io.on("connection", (socket) => {
    console.log("a user connects room");

    new GroupChatRoom(io, socket);
  });
}

module.exports = room;
