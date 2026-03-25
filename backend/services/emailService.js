const { Resend } = require("resend");

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      console.error("[Email] RESEND_API_KEY not set!");
      return null;
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendInviteEmail = async (toEmail, inviteLink, creatorName) => {
  const client = getResendClient();
  if (!client) {
    throw new Error("Email service not configured");
  }

  const { data, error } = await client.emails.send({
    from: "MwareX <team-Samay@mwarex.in>",
    to: [toEmail],
    subject: "You've been invited to join a MwareX Workspace",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to MwareX</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">
          <strong>${creatorName || "A creator"}</strong> has invited you to collaborate on their video content as an editor.
        </p>
        <p style="font-size: 16px; color: #555;">
          Click the button below to accept the invitation and set up your secure workspace.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Join Workspace
          </a>
        </div>
        <p style="font-size: 14px; color: #999; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${inviteLink}" style="color: #0066cc;">${inviteLink}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

const sendPasswordResetOTP = async (toEmail, otp) => {
  const client = getResendClient();
  if (!client) {
    throw new Error("Email service not configured");
  }

  const { data, error } = await client.emails.send({
    from: "MwareX Support <team-Samay@mwarex.in>",
    to: [toEmail],
    subject: "Your MwareX Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #111; border-radius: 10px; background-color: #050505; color: #fff;">
        <h2 style="color: #fff; text-align: center;">MwareX Password Reset</h2>
        <p style="font-size: 16px; color: #ccc;">Hello,</p>
        <p style="font-size: 16px; color: #ccc;">
          We received a request to reset your password. Use the following OTP to complete the process.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #1a1a1a; color: #fff; padding: 15px 30px; letter-spacing: 5px; font-size: 24px; border-radius: 8px; font-weight: bold; font-family: monospace; border: 1px solid #333;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          This OTP is valid for 15 minutes. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send OTP email");
  }
  return data;
};

const verifyConnection = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Email: RESEND_API_KEY not set — invite emails will not be sent");
    return;
  }
  console.log("Resend Email Service Ready");
};

module.exports = { sendInviteEmail, sendPasswordResetOTP, verifyConnection };
