const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 1,
    max: 20,
  },
  profile_image: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", UserSchema);
