const {
  sendPasswordResetMail,
  sendPasswordChangeConfirmation,
} = require("../mail/email-mailer");
const ForgotPasswordRequests = require("../Model/forgetPassword");
const User = require("../Model/user");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body; // Validate email

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    } // Check if user exists

    const user = await User.findOne({ email }); // Security: Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a password reset link has been sent",
      });
    } // Generate secure random token

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10); // Delete any existing reset requests for this user

    await ForgotPasswordRequests.deleteMany({ userId: user._id }); // Store hashed token with expiration

    await ForgotPasswordRequests.create({
      token: hashedToken,
      userId: user._id,
      isActive: true,
      createdAt: Date.now(),
    }); // Create reset link with the unhashed token

    const resetLink = `${process.env.BASE_URL}/api/v1/password/reset-password/${resetToken}`; // Send email

    await sendPasswordResetMail(email, resetLink);

    return res.status(200).json({
      message: "If that email exists, a password reset link has been sent",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({
      message: "An error occurred. Please try again later",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    } // Find all active reset requests and verify token

    const resetRequests = await ForgotPasswordRequests.find({ isActive: true });
    let validRequest = null;

    for (const request of resetRequests) {
      const isValid = await bcrypt.compare(token, request.token);
      if (isValid) {
        validRequest = request;
        break;
      }
    }

    if (!validRequest) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    } // Serve password reset form

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
          input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
          button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; cursor: pointer; }
          .error { color: red; font-size: 12px; }
        </style>
      </head>
      <body>
        <h2>Reset Your Password</h2>
        <form action="/api/v1/password/update-password" method="POST">
          <input type="hidden" name="token" value="${token}" />
          <input type="password" name="newPassword" id="password" placeholder="New password (min 8 characters)" required minlength="8" />
          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm password" required />
          <p class="error" id="error"></p>
          <button type="submit">Reset Password</button>
        </form>
        <script>
          document.querySelector('form').onsubmit = function(e) {
            const pwd = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            if (pwd !== confirm) {
              e.preventDefault();
              document.getElementById('error').textContent = 'Passwords do not match';
              return false;
            }
            if (pwd.length < 8) {
              e.preventDefault();
              document.getElementById('error').textContent = 'Password must be at least 8 characters';
              return false;
            }
          };
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      message: "An error occurred. Please try again later",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body; // Validate inputs

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    } // Validate password strength

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    } // Find and verify token

    const resetRequests = await ForgotPasswordRequests.find({ isActive: true });
    let validRequest = null;

    for (const request of resetRequests) {
      const isValid = await bcrypt.compare(token, request.token);
      if (isValid) {
        validRequest = request;
        break;
      }
    }

    if (!validRequest) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    } // Get user and update password

    const user = await User.findById(validRequest.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(validRequest.userId, {
      password: hashedPassword,
    }); // Invalidate all reset tokens for this user

    await ForgotPasswordRequests.updateMany(
      { userId: validRequest.userId },
      { isActive: false }
    ); // Send confirmation email

    try {
      await sendPasswordChangeConfirmation(user.email, user.name || "User");
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    res.json({
      success: true,
      message:
        "Password updated successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error("Update password error:", err);
    return res.status(500).json({
      message: "Failed to update password. Please try again.",
    });
  }
};

module.exports = {
  forgetPassword,
  resetPassword,
  updatePassword,
};
