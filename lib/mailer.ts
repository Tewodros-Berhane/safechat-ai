import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = `
  <div style="font-family: Inter, Arial, sans-serif; background-color: #F9FAFB; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB; padding: 32px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="background-color: #3B82F6; color: white; display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; font-weight: bold; font-size: 20px;">
          Safechat.AI
        </div>
      </div>
      <h2 style="text-align: center; color: #111827; font-size: 22px;">Reset your password</h2>
      <p style="color: #4B5563; font-size: 15px; text-align: center; line-height: 1.6;">
        We received a request to reset your password for <strong>SafeChat.AI</strong>.<br/>
        Click the button below to reset it. This link will expire in 15 minutes.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #6B7280; font-size: 13px; text-align: center;">
        If you didn’t request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="text-align: center; color: #9CA3AF; font-size: 12px;">
        © ${new Date().getFullYear()} SafeChat.AI — AI-Powered Moderation
      </p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"SafeChat.AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your SafeChat.AI password",
    html,
  });
}
