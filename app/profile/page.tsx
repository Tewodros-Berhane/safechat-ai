"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileForm from "./components/ProfileForm";
import SecuritySettings from "./components/SecuritySettings";
import DangerZone from "./components/DangerZone";
import { useUserStore } from "@/stores/useUserStore";

export default function ProfilePage() {
  const { user, loading, fetchUser, updateUser } = useUserStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [preferences, setPreferences] = useState({
    twoFactorEnabled: false,
    darkMode: false,
    aiModerationReports: true,
    notificationEmails: true,
  });

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleSave = async () => {
    // TODO: Implement actual API call to save profile data
    // For now, just update the store
    toast.success("Profile updated successfully");
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const handleProfileUpdate = async (data: {
    fullName?: string;
    username?: string;
    email?: string;
  }) => {
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      updateUser(result.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePhotoChange = async (file: File) => {
    // TODO: Implement actual photo upload API call
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const response = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePic: base64 }),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile photo");
        }

        const result = await response.json();
        updateUser(result.user);
        toast.success("Profile photo updated");
      } catch (error) {
        console.error("Error updating photo:", error);
        toast.error("Failed to update profile photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, twoFactorEnabled: enabled }));
    toast.success(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, darkMode: enabled }));
    toast.success(enabled ? "Dark mode enabled" : "Dark mode disabled");
  };

  const handleAiModerationToggle = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, aiModerationReports: enabled }));
    toast.success(
      enabled
        ? "AI moderation reports enabled"
        : "AI moderation reports disabled"
    );
  };

  const handleNotificationEmailsToggle = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, notificationEmails: enabled }));
    toast.success(
      enabled ? "Notification emails enabled" : "Notification emails disabled"
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Profile</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account details and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditMode(true)}
                variant="outline"
                className="text-[#007AFF] border-[#007AFF] hover:bg-[#007AFF]/10 transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout - Two Column */}
        <div className="flex flex-col lg:flex-row gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
            </div>
          ) : user ? (
            <>
              {/* Left Sidebar */}
              <div className="lg:shrink-0">
                <ProfileSidebar
                  isEditMode={isEditMode}
                  profilePic={user.profilePic}
                  name={user.username}
                  username={user.username}
                  role={user.role}
                  dateJoined={new Date(user.createdAt)}
                  chatCount={user.chatCount || 0}
                  onPhotoChange={handlePhotoChange}
                />
              </div>

              {/* Right Content Area */}
              <div className="flex-1 space-y-6">
                <ProfileForm
                  isEditMode={isEditMode}
                  fullName={user.username}
                  username={user.username}
                  email={user.email}
                  dateJoined={new Date(user.createdAt)}
                  role={user.role}
                  emailVerified={true}
                  onUpdate={handleProfileUpdate}
                />

                <SecuritySettings/>
                <DangerZone />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Failed to load user data. Please try refreshing the page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

