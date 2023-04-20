const Message = require("../models/Message");
const GroupChat = require("../models/GroupChat");
const User = require("../models/User");
const DirectChat = require("../models/DirectChat");

const CHAT_TYPE = {
  DIRECT: "Direct",
  GROUP: "Group",
};

async function createMongoMessage(messageInfo) {
  const { type, message } = messageInfo;
  var chat;
  if (type === CHAT_TYPE.DIRECT) {
    chat = await DirectChat.findById(message.chat_id);
  } else if (type === CHAT_TYPE.GROUP) {
    chat = await GroupChat.findById(message.chat_id);
  }
  const user = await User.findById(message.user_id);

  await Message.create({
    _id: message._id,
    user_id: user._id,
    chat_id: chat._id,
    message: message.message,
    liked_users: [],
    like: 0,
    created_at: message.created_at,
  });
  return;
}

async function getMongoMessages({ type, chatId }) {
  var chat;
  if (type === CHAT_TYPE.DIRECT) {
    chat = await DirectChat.findById(chatId);
  } else if (type === CHAT_TYPE.GROUP) {
    chat = await GroupChat.findById(chatId);
  }

  const messages = await Message.aggregate([
    { $match: { chat_id: chat._id } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        user_id: 1,
        username: "$user.username",
        profile_image: "$user.profile_image",
        chat_id: 1,
        message: 1,
        liked_users: 1,
        like: 1,
        created_at: 1,
      },
    },
  ]);
  return messages;
}

async function getMongoMessageById(messageId) {
  const message = await Message.findById(messageId);
  const user = await User.findById(message.user_id);
  return {
    _id: message._id,
    user_id: user._id,
    username: user.username,
    profile_image: user.profile_image,
    chat_id: message.chat_id,
    message: message.message,
    liked_users: message.liked_users,
    like: message.like,
    created_at: message.created_at,
  };
}

async function likeMongoMessageByIdentifiers({ ownerId, messageId }) {
  await Message.findOneAndUpdate(
    { _id: messageId },
    {
      $push: {
        liked_users: { user_id: ownerId },
      },
      like: {
        $inc: 1,
      },
    }
  );
  return;
}

async function unlikeMongoMessageByIdentifiers({ ownerId, messageId }) {
  await Message.findOneAndUpdate(
    { _id: messageId },
    {
      $pull: {
        liked_users: { user_id: ownerId },
      },
      like: {
        $dec: 1,
      },
    }
  );
  return;
}

async function updateLikeMongoMessageByIndentifier({ messageId, new_liked_users, new_like }) {
  await Message.findOneAndUpdate(
    { _id: messageId },
    {
      liked_users: new_liked_users,
      like: new_like,
    }
  );
}

module.exports = {
  createMongoMessage,
  getMongoMessages,
  getMongoMessageById,
  likeMongoMessageByIdentifiers,
  unlikeMongoMessageByIdentifiers,
  updateLikeMongoMessageByIndentifier,
};
