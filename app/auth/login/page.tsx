"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Check for error messages from reset password redirects
  useEffect(() => {
    if (!searchParams) return;
    const error = searchParams.get("error");
    if (error === "missing-token") {
      toast.error("Reset link is missing. Please request a new password reset.");
    } else if (error === "invalid-token") {
      toast.error("Reset link has expired or is invalid. Please request a new one.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res.error === "Invalid password" ? "Incorrect password" : res.error);
      return;
    }

    toast.success("Logged in successfully!");

    router.push("/chat");
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
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Welcome back
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your SafeChat.AI account
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-blue-600 hover:text-white transition-all"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </div>
          <div className="mt-2 text-sm text-center">
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
