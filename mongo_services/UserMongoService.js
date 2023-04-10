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
  await User.create({
    username: username,
    password: password,
  });
  return;
}

async function existMongoUser(auth) {
  const { username, password } = auth;

  const user = await User.findOne({ username: username, password: password });
  if (user) {
    return {
      success: true,
      user_id: user._id,
    };
  } else {
    return { success: false };
  }
}

async function getMongoUsers(userId) {
  const users = await User.find({ _id: { $ne: userId } }).select({ username: 1, profile_image: 1 });
  return users;
}

async function getMongoUserById(userId) {
  const user = await User.findById(userId);
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
  getMongoUserById,
  updateMongoUserById,
};
