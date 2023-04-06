const mongoose = require("mongoose");

const DirectChatSchema = new mongoose.Schema({
  memebers: {
    type: Set(mongoose.Schema.ObjectId),
  },
  background_image: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("DirectChat", DirectChatSchema);
