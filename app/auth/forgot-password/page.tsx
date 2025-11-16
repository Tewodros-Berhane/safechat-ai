"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();

    if (!email) {
      toast.warning("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("A password reset link has been sent to your email.");
        // Optionally, redirect after a short delay
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        const { error } = await res.json();
        toast.error(error || "Could not send reset link. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-xl">
        <CardHeader>
          <div className="text-center mb-2">
            <div className="flex justify-center mb-3">
              <div className="bg-primary text-black font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg">
                Safechat.AI
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Forgot your password?
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Don’t worry! Enter your email below and we’ll send you a reset link.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-blue-600 hover:text-white transition-all"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-primary hover:underline font-medium"
            >
              Log in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
