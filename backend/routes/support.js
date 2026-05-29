const router = require("express").Router();
const { Resend } = require("resend");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[Support] RESEND_API_KEY is not set!");
      return res.status(500).json({ success: false, message: "Email service not configured" });
    }

    const resend = new Resend(resendApiKey);
    const toEmail = process.env.EMAIL_USER || "samaysamrat64@gmail.com";

    const { data, error } = await resend.emails.send({
      from: "MwareX Support <team-Samay@mwarex.in>",
      to: [toEmail],
      subject: `New Support Ticket from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #1a1a1a; border-radius: 12px; background-color: #070707; color: #ffffff;">
          <h2 style="color: #C8A97E; border-bottom: 1px solid #222; padding-bottom: 15px; margin-top: 0; font-family: 'Playfair Display', serif;">New Support Request</h2>
          <div style="margin: 20px 0; font-size: 15px; line-height: 1.6;">
            <p><strong style="color: #C8A97E;">Name:</strong> ${name}</p>
            <p><strong style="color: #C8A97E;">Email:</strong> <a href="mailto:${email}" style="color: #00E5FF; text-decoration: none;">${email}</a></p>
            <p><strong style="color: #C8A97E;">Message:</strong></p>
            <div style="background-color: #111; border: 1px solid #222; padding: 15px; border-radius: 8px; font-style: italic; color: #ccc;">
              "${message.replace(/\n/g, "<br>")}"
            </div>
          </div>
          <div style="margin-top: 25px; border-top: 1px solid #222; padding-top: 15px; font-size: 11px; color: #555; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            MWareX Support Automation
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Support Email Error]", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true, message: "Support ticket submitted successfully!", data });
  } catch (err) {
    console.error("[Support Route Error]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
