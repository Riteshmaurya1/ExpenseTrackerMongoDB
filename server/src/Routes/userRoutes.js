const express = require("express");
const {
  userSignUp,
  login,
  profile,
  updateProfile,
} = require("../Controller/userController");
const { jwtAuth } = require("../auth/jwt");
const userRouter = express.Router();

userRouter.post("/auth/signup", userSignUp);
userRouter.post("/auth/login", login);
userRouter.get("/user/profile", jwtAuth, profile);
userRouter.patch("/user/profile/update", jwtAuth, updateProfile);

module.exports = userRouter;
