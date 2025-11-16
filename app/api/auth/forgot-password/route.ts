import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json({ error: "No account found for this email" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
    return NextResponse.json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("Email sending failed:", err);
    return NextResponse.json(
      { error: "Failed to send reset email. Please try again later." },
      { status: 500 }
    );
  }
}
