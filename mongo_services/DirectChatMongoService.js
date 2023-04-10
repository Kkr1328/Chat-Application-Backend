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

module.exports = {
  createDirectChats,
};
