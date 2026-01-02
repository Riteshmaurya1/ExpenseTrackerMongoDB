const express = require("express");
const premiumRouter = express.Router();
const { showLeaderBoard } = require("../Controller/premiumController");
const { jwtAuth } = require("../auth/jwt");

// Only premium user can access this.
premiumRouter.get("/premium/leaderboard", jwtAuth, showLeaderBoard);

module.exports = premiumRouter;
