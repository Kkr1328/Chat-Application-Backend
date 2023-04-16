const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    chat_id: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    liked_users: {
      type: Array(String),
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
  },
  { _id: false }
);

module.exports = mongoose.model("Message", MessageSchema);
