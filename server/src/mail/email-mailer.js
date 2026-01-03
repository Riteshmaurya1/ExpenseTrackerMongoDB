require("dotenv").config({ quiet: true });
const Sib = require("sib-api-v3-sdk");

// Setup Brevo API key
const apiKey = Sib.ApiClient.instance.authentications["api-key"];
apiKey.apiKey = process.env.EMAIL_API;
const emailApi = new Sib.TransactionalEmailsApi();

// Function to send password reset email
const sendPasswordResetMail = async (email, resetLink) => {
  try {
    const response = await emailApi.sendTransacEmail({
      sender: { name: "Support Team", email: "riteshkumar04294@gmail.com" },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="95%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;border: 2px dashed #ccc;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a73e8; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear User,
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset the password for your account (<b>${email}</b>).
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Click the button below to reset your password:
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetLink}" 
                               style="background-color: #1a73e8; 
                                      color: #ffffff; 
                                      padding: 15px 40px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      font-size: 16px; 
                                      font-weight: bold; 
                                      display: inline-block;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetLink}" style="color: #1a73e8; word-break: break-all;">${resetLink}</a>
                      </p>
                      
                      <!-- Expiration Warning -->
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                          <b>⏱ Important:</b> This link will expire in <b>1 hour</b> for security reasons.
                        </p>
                      </div>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                        Need help? Contact our support team:<br>
                        <a href="mailto:riteshkumar04294@gmail.com" style="color: #1a73e8; text-decoration: none;">riteshkumar04294@gmail.com</a>
                      </p>
                      
                      <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated message. Please do not reply to this email.<br>
                        © ${new Date().getFullYear()} Support Team. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      textContent: `
Password Reset Request

Dear User,

We received a request to reset the password for your account (${email}).

To reset your password, please visit the following link:
${resetLink}

IMPORTANT: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Need help? Contact: riteshkumar04294@gmail.com

– The Support Team
      `,
    });
    return response;
  } catch (err) {
    console.error(
      "Failed to send password reset email:",
      err.response?.body || err
    );
    throw err;
  }
};

// Function to send password change confirmation email
const sendPasswordChangeConfirmation = async (email, userName) => {
  try {
    const response = await emailApi.sendTransacEmail({
      sender: { name: "Support Team", email: "riteshkumar04294@gmail.com" },
      to: [{ email }],
      subject: "Your Password Has Been Changed Successfully",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #28a745; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Changed Successfully</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${userName},
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        This email confirms that the password for your account (<b>${email}</b>) has been successfully changed.
                      </p>
                      
                      <div style="background-color: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <p style="color: #2e7d32; font-size: 14px; margin: 0; line-height: 1.5;">
                          <b>✓ Security Confirmation</b><br>
                          Your password was changed on ${new Date().toLocaleString(
                            "en-IN",
                            {
                              timeZone: "Asia/Kolkata",
                              dateStyle: "long",
                              timeStyle: "short",
                            }
                          )} (IST).
                        </p>
                      </div>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        If you made this change, no further action is required. You can now log in with your new password.
                      </p>
                      
                      <!-- Alert Section -->
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                          <b>⚠ Didn't make this change?</b><br>
                          If you did <b>not</b> change your password, someone may have unauthorized access to your account. Please contact our support team immediately.
                        </p>
                      </div>
                      
                      <!-- Security Tips -->
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Security Tips:</h3>
                        <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Never share your password with anyone</li>
                          <li>Use a unique password for each account</li>
                          <li>Enable two-factor authentication if available</li>
                          <li>Be cautious of phishing emails</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                        Need help? Contact our support team:<br>
                        <a href="mailto:riteshkumar04294@gmail.com" style="color: #1a73e8; text-decoration: none;">riteshkumar04294@gmail.com</a>
                      </p>
                      
                      <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated security notification. Please do not reply to this email.<br>
                        © ${new Date().getFullYear()} Support Team. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      textContent: `
Dear ${userName},

This email confirms that the password for your account (${email}) has been successfully changed on ${new Date().toLocaleString(
        "en-IN",
        { timeZone: "Asia/Kolkata" }
      )} (IST).

If you made this change, no further action is required. You can now log in with your new password.

IMPORTANT: If you did NOT change your password, someone may have unauthorized access to your account. Please contact our support team immediately at riteshkumar04294@gmail.com.

Security Tips:
- Never share your password with anyone
- Use a unique password for each account
- Enable two-factor authentication if available
- Be cautious of phishing emails

Need help? Contact: riteshkumar04294@gmail.com

– The Support Team
      `,
    });
    return response;
  } catch (err) {
    console.error(
      "Failed to send confirmation email:",
      err.response?.body || err
    );
    throw err;
  }
};

// Export both functions
module.exports = {
  sendPasswordResetMail,
  sendPasswordChangeConfirmation,
};
