const Message = require("../models/Message");
const GroupChat = require("../models/GroupChat");

async function createMongoMessage({ chatId, message }) {
  const group = await GroupChat.findById(chatId);
  await Message.create({
    chat_id: group._id,
    message: message,
  });
  return;
}

async function getMongoMessages(chatId) {
  const messages = await Message.find({ chat_id: chatId });
  return messages;
}

async function getMongoMessageByIdentifiers({ chatId, message }) {
  const group = await GroupChat.findById(chatId);
  const selected_messages = await Message.find({
    chat_id: group._id,
    message: message,
  });
  return selected_messages[0];
}

async function likeMongoMessageByIdentifiers({ userId, chatId, message }) {
  await GroupChat.findOneAndUpdate(
    { user_id: userId, chat_id: chatId, message: message },
    {
      $push: {
        liked_users: { user_id: userId },
      },
      like: {
        $inc: 1,
      },
    }
  );
  return;
}

async function unlikeMongoMessageByIdentifiers({ userId, chatId, message }) {
  await GroupChat.findOneAndUpdate(
    { user_id: userId, chat_id: chatId, message: message },
    {
      $pull: {
        liked_users: { user_id: userId },
      },
      like: {
        $dec: 1,
      },
    }
  );
  return;
}

module.exports = {
  createMongoMessage,
  getMongoMessages,
  getMongoMessageByIdentifiers,
  likeMongoMessageByIdentifiers,
  unlikeMongoMessageByIdentifiers,
};
