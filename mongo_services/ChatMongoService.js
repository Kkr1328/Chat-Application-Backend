const GroupChat = require("../models/GroupChat");
const DirectChat = require("../models/DirectChat");

const CHAT_TYPE = {
  DIRECT: "Direct",
  GROUP: "Group",
};

async function existMongoChatHavingChatId(indentifier) {
  const { type, chat_id } = indentifier;
  var chats;
  if (type === CHAT_TYPE.DIRECT) {
    chats = await DirectChat.findById(chat_id);
  } else if (type === CHAT_TYPE.GROUP) {
    chats = await GroupChat.findById(chat_id);
  }
  return chats.length > 0;
}

async function updateMongoChatBackgroundImageByChatId(updateInfo) {
  const { type, chat_id, background_image } = updateInfo;
  if (type === CHAT_TYPE.DIRECT) {
    await DirectChat.findOneAndUpdate({ _id: chat_id }, { background_image: background_image });
  } else if (type === CHAT_TYPE.GROUP) {
    await GroupChat.findOneAndUpdate({ _id: chat_id }, { background_image: background_image });
  }
  return;
}

module.exports = {
  existMongoChatHavingChatId,
  updateMongoChatBackgroundImageByChatId,
};
