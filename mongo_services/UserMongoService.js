const DirectChat = require("../models/DirectChat");
const User = require("../models/User");

async function existMongoUserHavingUsername(username) {
  const users = await User.find({ username: username });
  return users.length > 0;
}

async function existMongoUserById(userId) {
  const users = await User.findById(userId);
  return users;
}

async function createMongoUser({ username, password }) {
  const new_user = await User.create({
    username: username,
    password: password,
  });
  return new_user;
}

async function existMongoUser(auth) {
  const { username, password } = auth;

  const user = await User.findOne({ username: username, password: password });
  if (user) {
    return {
      success: true,
      user_id: user._id,
      profile_image: user.profile_image,
    };
  } else {
    return { success: false };
  }
}

async function getMongoUsers(userId) {
  const user = await User.findById(userId);
  const first_users = await User.aggregate([
    { $match: { _id: { $ne: user._id } } },
    {
      $lookup: {
        from: "directchats",
        localField: "_id",
        foreignField: "first_member",
        as: "chat",
      },
    },
    { $unwind: "$chat" },
    {
      $project: {
        _id: 1,
        username: 1,
        profile_image: 1,
        chat_id: "$chat._id",
      },
    },
  ]);
  const second_users = await User.aggregate([
    { $match: { _id: { $ne: user._id } } },
    {
      $lookup: {
        from: "directchats",
        localField: "_id",
        foreignField: "second_member",
        as: "chat",
      },
    },
    { $unwind: "$chat" },
    {
      $project: {
        _id: 1,
        username: 1,
        profile_image: 1,
        chat_id: "$chat._id",
      },
    },
  ]);
  const users = first_users.concat(second_users);
  return users;
}

async function getMongoUserById(userId) {
  const user = await User.findById(userId);
  return user;
}

async function getMongoUserByChatId(ids) {
  const { myUserId, chatId } = ids;
  const chat = await DirectChat.findById(chatId);
  const userId = chat.first_member.toString() === myUserId ? chat.second_member : chat.first_member;
  const user = await User.findOne({ _id: userId });
  return user;
}

async function updateMongoUserById({ user_id, username, profile_image }) {
  await User.findOneAndUpdate(
    { _id: user_id },
    { username: username, profile_image: profile_image }
  );
  return;
}

module.exports = {
  existMongoUserHavingUsername,
  existMongoUserById,
  createMongoUser,
  existMongoUser,
  getMongoUsers,
  getMongoUserByChatId,
  getMongoUserById,
  updateMongoUserById,
};
