const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    // No unique constraint needed here since we hash tokens
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour (3600 seconds)
  },
});

// Add compound index for better query performance
forgotPasswordSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("ForgotPasswordRequests", forgotPasswordSchema);
