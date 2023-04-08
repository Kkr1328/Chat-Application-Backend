const User = require("../models/User");
const MessageService = require("./MessageSocketService");
const GroupChatService = require("./GroupChatSocketService");

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.auth = false;
    socket.on("authenticate", async (auth) => {
      const { username, password } = auth;
      // Find user
      const user = await User.findOne({ username }).exec();
      if (user === null) {
        socket.emit("error", { message: "No user found" });
      } else if (user.password !== password) {
        socket.emit("error", { message: "Wrong password" });
      } else {
        socket.auth = true;
        socket.user = user;
      }
    });
    setTimeout(() => {
      // If the authentication failed, disconnect socket
      if (!socket.auth) {
        console.log("Unauthorized: Disconnecting socket", socket.id);
        return socket.disconnect("unauthorized");
      }
      return socket.emit("authorized");
    }, 1000);
    console.log("🔥 Socket connected: ", socket.id);
    new MessageService(io, socket);
    new GroupChatService(io, socket);
  });
};
