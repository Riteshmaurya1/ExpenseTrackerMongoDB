const User = require("../Model/user");
const bcrypt = require("bcrypt");
const { generateJwtToken } = require("../auth/jwt");

// ================== SIGNUP LOGIC ==================
const userSignUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation: Check all fields provided
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Invalid Credentials.",
        success: false,
      });
    }

    // Check if user already exists (Sequelize: findOne with where)
    // Mongoose: findOne with direct object
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered, Please Login",
        success: false,
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    // Sequelize: User.create()
    // Mongoose: User.create() - SAME METHOD
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Make payload for token
    const userPayload = {
      id: user._id, // Mongoose uses _id instead of id
      username: user.username,
      email: user.email,
    };

    // Generate token
    const token = generateJwtToken(userPayload);

    // Return response
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalExpenses: user.totalExpenses,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      err: err.message,
      success: false,
    });
  }
};

// ================== LOGIN LOGIC ==================
const login = async (req, res) => {
  try {
    // Extract data from body
    const { email, password } = req.body;

    // Check if user exists
    // Sequelize: User.findOne({ where: { email } })
    // Mongoose: User.findOne({ email })
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Compare password
    // Sequelize and Mongoose both use bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Make payload
    const userPayload = {
      id: user._id, // Mongoose uses _id
      username: user.username,
      email: user.email,
    };

    // Generate token
    const token = generateJwtToken(userPayload);

    // Return response with token
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalExpenses: user.totalExpenses,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      err: err.message,
      success: false,
    });
  }
};

// ================== PROFILE LOGIC ==================
const profile = async (req, res) => {
  try {
    // Step 1: Get user ID from JWT payload
    const userId = req.payload.id;

    // Step 2: Find user details
    // Sequelize: User.findByPk(userId)
    // Mongoose: User.findById(userId)
    const userDetails = await User.findById(userId).select("-password");

    if (!userDetails) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      data: userDetails,
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({
      err: err.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.payload.id;
    const { username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      err: err.message,
    });
  }
};

module.exports = {
  userSignUp,
  login,
  profile,
  updateProfile,
};
