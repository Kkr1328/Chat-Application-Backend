const mongoose = require("mongoose");

const GroupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    min: 1,
    max: 20,
  },
  background_image: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("GroupChat", GroupChatSchema);
