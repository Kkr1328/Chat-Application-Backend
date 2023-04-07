const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chat_id: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  liked_users: {
    type: Array(mongoose.Schema.ObjectId),
    default: [],
  },
  like: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
