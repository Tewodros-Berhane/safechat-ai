"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";


export default function SecuritySettings() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyUpdating, setPrivacyUpdating] = useState(false);
  const { user, updateUser } = useUserStore();

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyToggle = async (isPrivate: boolean) => {
    setPrivacyUpdating(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update privacy settings");
      }

      const result = await response.json();
      updateUser(result.user);
      toast.success(isPrivate ? "Your profile is now private" : "Your profile is now public");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update privacy settings";
      toast.error(message);
    } finally {
      setPrivacyUpdating(false);
    }
  };

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="w-5 h-5 text-gray-600" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <Label className="text-sm font-medium text-gray-900">Account privacy</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                Private accounts require friend approval before anyone can start a chat.
              </p>
            </div>
          </div>
          <Switch
            checked={Boolean(user?.isPrivate)}
            onCheckedChange={handlePrivacyToggle}
            disabled={privacyUpdating}
            className="data-[state=checked]:bg-[#04C99B]"
          />
        </div>

        {/* Password Change */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <div>
              <Label className="text-sm font-medium text-gray-900">Password</Label>
              <p className="text-xs text-gray-500 mt-0.5">Last changed 3 months ago</p>
            </div>
          </div>
          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-[#007AFF] border-[#007AFF] hover:bg-[#007AFF]/10"
              >
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

