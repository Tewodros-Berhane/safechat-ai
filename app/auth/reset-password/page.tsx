"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or expired reset link.");
      setTimeout(() => router.push("/auth/login"), 2500);
    }
  }, [token, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");

    if (!password) {
      toast.warning("Please enter a new password.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      toast.success("Password updated successfully 🎉");
      router.push("/auth/login");
    } else {
      const { error } = await res.json();
      toast.error(error || "Reset failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-xl">
        <CardHeader>
          <Link href="/" passHref>
            <div className="flex justify-center gap-2 text-center mb-2">
              <div className="bg-gradient-to-r from-[#007AFF] to-[#04C99B] text-white font-semibold rounded-xl w-9 h-9 flex items-center justify-center shadow-md">
                S
              </div>
              <span className="text-lg font-semibold text-slate-900 hidden sm:block">
                SafeChat<span className="text-[#04C99B]">.AI</span>
              </span>
            </div>
          </Link>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800">
            Reset your password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-blue-600 hover:text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
