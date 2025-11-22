import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "./ResetPasswordForm";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  // In Next.js 15+, searchParams is a Promise and must be awaited
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;

  // Immediate server-side validation
  if (!token) {
    redirect("/auth/login?error=missing-token");
  }

  // Validate token exists and hasn't expired
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    redirect("/auth/login?error=invalid-token");
  }

  // Token is valid, render the form
  return <ResetPasswordForm token={token} />;
}
