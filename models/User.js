const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 1,
    max: 20,
  },
  password: {
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
