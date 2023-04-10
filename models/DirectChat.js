const mongoose = require("mongoose");

const DirectChatSchema = new mongoose.Schema({
  first_member: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  second_member: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  background_image: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("DirectChat", DirectChatSchema);
