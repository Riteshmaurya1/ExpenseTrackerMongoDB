const User = require("../Model/user");

// ===== SHOW LEADERBOARD =====
const showLeaderBoard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select("username totalExpenses")
      .sort({ totalExpenses: -1 })
      .limit(100);

    res.status(200).json({
      data: leaderboard,
      success: true,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({
      err: error.message,
      success: false,
    });
  }
};

module.exports = { showLeaderBoard };
