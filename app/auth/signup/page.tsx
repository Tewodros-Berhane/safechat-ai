"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";


export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

    if (!username || !email || !password || !confirmPassword) {
      toast.warning("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      setLoading(false);

      if (res.ok) {
        toast.success("Account created successfully.You can now sign in to SafeChat.AI");
        router.push("/auth/login");
      } else {
        const { error } = await res.json();
        toast.error(error || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Something went wrong. Please try again later.");
    }
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
            <CardTitle className="text-2xl font-semibold text-gray-800 text-center">
              Create your account 
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Join SafeChat.AI and experience safer conversations
            </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Your username"
                className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
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

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
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
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{" "}
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
