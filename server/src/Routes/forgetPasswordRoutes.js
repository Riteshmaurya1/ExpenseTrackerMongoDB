const forgetPasswordRoutes = require("express").Router();
const {
  forgetPassword,
  resetPassword,
  updatePassword,
} = require("../Controller/forgetEmailController");

forgetPasswordRoutes.post("/password/forgot-password", forgetPassword);
forgetPasswordRoutes.get("/password/reset-password/:uuid", resetPassword);
forgetPasswordRoutes.post("/password/update-password", updatePassword);

module.exports = forgetPasswordRoutes;
