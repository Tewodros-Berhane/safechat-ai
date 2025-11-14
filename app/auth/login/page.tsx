"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate with NextAuth
    setTimeout(() => router.push("/chat"), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="w-[400px] bg-zinc-900 text-zinc-100 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Welcome back 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-zinc-400">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/auth/signup")}
              className="text-zinc-100 hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </div>
          <div className="mt-2 text-sm text-center">
            <span
              onClick={() => router.push("/auth/forgot-password")}
              className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Forgot password?
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
