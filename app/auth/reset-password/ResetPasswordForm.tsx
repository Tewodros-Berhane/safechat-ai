"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validate password fields
        if (!password || !confirmPassword) {
            toast.warning("Please fill in both password fields.");
            setLoading(false);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            setLoading(false);
            return;
        }

        // Check minimum password length
        if (password.length < 8) {
            toast.warning("Password must be at least 8 characters long.");
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
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                minLength={8}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                minLength={8}
                                required
                            />
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
