const User = require("../models/User");

async function createMongoUser({ username, password }) {
  await User.create({
    username: username,
    password: password,
  });
  return;
}

async function getMongoUsers(userId) {
  const users = await User.find({ _id: { $ne: userId } });
  return users;
}

async function getMongoUserById(userId) {
  const user = await User.findById(userId);
  return user;
}

async function updateMongoUserById({ userId, profileImage }) {
  await User.findOneAndUpdate({ user_id: userId }, { profile_image: profileImage });
  return;
}

module.exports = {
  createMongoUser,
  getMongoUsers,
  getMongoUserById,
  updateMongoUserById,
};
