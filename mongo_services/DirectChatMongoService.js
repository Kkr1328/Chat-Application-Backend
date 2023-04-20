const DirectChat = require("../models/DirectChat");
const User = require("../models/User");

async function createDirectChats(userId) {
  const users = await User.find({ _id: { $ne: userId } });
  users.forEach(async (otherUser) => {
    await DirectChat.create({
      first_member: userId,
      second_member: otherUser._id,
    });
  });
}

async function getMongoDirectByChatId(ids) {
  const { myUserId, chatId } = ids;

  const chat = await DirectChat.findById(chatId);
  const userId = chat.first_member.toString() === myUserId ? chat.second_member : chat.first_member;
  const user = await User.findOne({ _id: userId });
  return {
    username: user.username,
    _id: user._id,
    profile_image: user.profile_image,
    background_image: chat.background_image,
  };
}

async function getMongoDirectByUserId(ids) {
  const { myUserId, userId } = ids;

  const chat = await DirectChat.findOne({
    $or: [
      { first_member: userId, second_member: myUserId },
      { first_member: myUserId, second_member: userId },
    ],
  });
  console.log(chat);
  return chat;
}

module.exports = {
  createDirectChats,
  getMongoDirectByChatId,
  getMongoDirectByUserId,
};
