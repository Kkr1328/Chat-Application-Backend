const GroupChat = require("../models/GroupChat");
const DirectChat = require("../models/DirectChat");

const CHAT_TYPE = {
  DIRECT: "Direct",
  GROUP: "Group",
};

async function existMongoChatHavingChatId(identifier) {
  const { type, chatId } = identifier;
  var chats;
  if (type === CHAT_TYPE.DIRECT) {
    chats = await DirectChat.findById(chatId);
  } else if (type === CHAT_TYPE.GROUP) {
    chats = await GroupChat.findById(chatId);
  }
  return chats;
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
