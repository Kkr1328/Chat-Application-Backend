const GroupChat = require("../models/GroupChat");

async function createMongoGroupChat(groupName) {
  await GroupChat.create({ name: groupName });
  return;
}

async function getMongoGroupChats() {
  const groupChats = await GroupChat.find({});
  return groupChats;
}

async function getMongoGroupByName(groupName) {
  const selectedGroup = await GroupChat.find({ name: groupName });
  return selectedGroup[0];
}

module.exports = {
  createMongoGroupChat,
  getMongoGroupChats,
  getMongoGroupByName,
};
