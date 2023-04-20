const {
  existMongoUserHavingUsername,
  createMongoUser,
  existMongoUser,
  getMongoUserByChatId,
  getMongoUserById,
  getMongoUsers,
  updateMongoUserById,
} = require("../mongo_services/UserMongoService");
const { createDirectChats } = require("../mongo_services/DirectChatMongoService");

class UserService {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    // auth = username + password
    socket.on("register", (auth) => this.register(auth));
    // socket.on("register_response", (res: any) => console.log(res.message));
    // socket.emit("register", { username: username, password: password });

    socket.on("login", (auth) => this.login(auth));
    // socket.on("login_response", (res: any) => console.log(res.message));
    // socket.emit("login", { username: username, password: password });

    socket.on("getUsers", (myUserId) => this.getUsers(myUserId));
    // socket.on("user", userListener);
    // socket.on("get_users_response", (res: any) => console.log(res.message));
    // socket.emit("getUsers", myUserId);

    // ids = myUserId + chatId
    socket.on("getUserByChatId", (ids) => this.getUserByChatId(ids));
    // socket.on("get_user_by_chat_id_response", (res: any) => console.log(res.message));
    // socket.emit("getUserByChatId", ids);

    socket.on("getUserById", (userId) => this.getUserById(userId));
    // socket.on("get_user_by_id_response", (res: any) => console.log(res.message));
    // socket.emit("getUserById", userId);

    socket.on("getMe", (myUserId) => this.getMe(myUserId));
    // socket.on("get_me_response", (res: any) => console.log(res.message));
    // socket.emit("getMe", myUserId);

    //update information = my user id + new username + new user profile image
    socket.on("updateMe", (updateInfo) => this.updateMe(updateInfo));
    // socket.on("update_user_response", (res: any) => console.log(res.message));
    // socket.emit("updateMe", {
    //   myUserId: myUserId,
    //   username: username,
    //   profileImage: profileImage,
    // });
  }

  register(auth) {
    const { username, password } = auth;

    existMongoUserHavingUsername(username).then((result) => {
      // check at least username length
      if (username.length < 1) {
        this.socket.emit("register_response", {
          message: "Username should be at least 1 character",
        });
        return;
      }

      // check at most username length
      if (username.length > 20) {
        this.socket.emit("register_response", {
          message: "Username should be at most 20 characters",
        });
        return;
      }

      // check having username
      if (result) {
        this.socket.emit("register_response", { message: "Username already in use" });
        return;
      }

      // check at least password length
      if (password.length < 1) {
        this.socket.emit("register_response", {
          message: "Password should be at least 1 character",
        });
        return;
      }

      // check at most password length
      if (password.length > 20) {
        this.socket.emit("register_response", {
          message: "Password should be at most 20 characters",
        });
        return;
      }

      // valid username & password and create user
      createMongoUser(auth).then((newUser) => createDirectChats(newUser._id));
      this.socket.emit("register_response", { message: "Success" });
    });
  }

  login(auth) {
    existMongoUser(auth).then((result) => {
      // check having username
      console.log(result);
      if (result.success) {
        this.socket.emit("login_response", {
          message: "Success",
          userId: result.user_id,
          profileImage: result.profile_image,
        });
        return;
      }

      this.socket.emit("login_response", { message: "Not found matching username and password" });
    });
  }

  getUsers(myUserId) {
    getMongoUserById(myUserId).then((me) => {
      if (me) {
        this.socket.emit("get_users_response", { message: "Success" });
        getMongoUsers(myUserId).then((users) => {
          users.forEach((user) => {
            this.sendUser(user);
          });
        });
        return;
      } else {
        // cant find the user id
        this.socket.emit("get_users_response", { message: "Your user id is invalid" });
      }
    });
  }

  sendUser(user) {
    const new_user = {
      _id: user._id,
      username: user.username,
      profileImage: user.profile_image,
      chatId: user.chat_id,
    };
    this.io.sockets.emit("user", new_user);
  }

  getUserById(userId) {
    getMongoUserById(userId).then((user) => {
      if (user) {
        this.socket.emit("get_user_by_id_response", {
          message: "Success",
          username: user.username,
          profileImage: user.profile_image,
        });
      } else {
        // cant find the user id
        this.socket.emit("get_user_by_id_response", { message: "The user id is invalid" });
      }
    });
  }

  getUserByChatId(ids) {
    const { myUserId, chatId } = ids;
    // getMongoUserById(myUserId).then((me) => {
    //   if (me) {
    getMongoUserByChatId(ids).then((user) => {
      this.socket.emit("get_user_by_chat_id_response", {
        message: "Success",
        username: user.username,
        userId: user._id,
        profileImage: user.profile_image,
      });
    });
    //   } else {
    //     // cant find the user id
    //     this.socket.emit("get_user_by_chat_id_response", { message: "Your user id is invalid" });
    //   }
    // });
  }

  getMe(myUserId) {
    getMongoUserById(myUserId).then((me) => {
      if (me) {
        this.socket.emit("get_me_response", {
          message: "Success",
          username: me.username,
          profileImage: me.profile_image,
        });
      } else {
        // cant find the user id
        this.socket.emit("get_me_response", { message: "Your user id is invalid" });
      }
    });
  }

  updateMe(updateInfo) {
    const { myUserId, username, profileImage } = updateInfo;
    existMongoUserHavingUsername(username).then((result) => {
      if (result) {
        this.socket.emit("update_user_response", { message: "Username already in use" });
        return;
      } else {
        getMongoUserById(myUserId).then((me) => {
          if (me) {
            // check at least username length
            if (username.length < 1) {
              this.socket.emit("update_user_response", {
                message: "Username should be at least 1 character",
              });
              return;
            }

            // check at most username length
            if (username.length > 20) {
              this.socket.emit("update_user_response", {
                message: "Username should be at most 20 characters",
              });
              return;
            }

            // valid userId & username and update user
            updateMongoUserById({
              user_id: myUserId,
              username: username,
              profile_image: profileImage,
            });
            this.socket.emit("update_user_response", { message: "Success" });
          } else {
            // cant find the user id
            this.socket.emit("update_user_response", { message: "Your user id is invalid" });
          }
        });
      }
    });
  }
}

module.exports = UserService;
