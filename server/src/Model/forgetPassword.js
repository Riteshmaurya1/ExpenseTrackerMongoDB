const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const forgotPasswordSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const ForgotPasswordRequests = mongoose.model(
  "ForgotPasswordRequests",
  forgotPasswordSchema
);

module.exports = ForgotPasswordRequests;
