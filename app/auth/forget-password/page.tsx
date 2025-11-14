"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate with password reset API
    setTimeout(() => router.push("/auth/login"), 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="w-[400px] bg-zinc-900 text-zinc-100 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Forgot your password?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Enter your email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-zinc-400">
            Remember your password?{" "}
            <span
              onClick={() => router.push("/auth/login")}
              className="text-zinc-100 hover:underline cursor-pointer"
            >
              Log in
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
