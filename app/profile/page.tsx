"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileForm from "./components/ProfileForm";
import SecuritySettings from "./components/SecuritySettings";
import DangerZone from "./components/DangerZone";

// TODO: Replace with actual session/user data from NextAuth
const mockUserData = {
  id: 1,
  fullName: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  profilePic: null as string | null,
  role: "USER" as const,
  dateJoined: new Date("2024-06-15"),
  chatCount: 24,
  emailVerified: true,
  twoFactorEnabled: false,
  darkMode: false,
  aiModerationReports: true,
  notificationEmails: true,
};

export default function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [preferences, setPreferences] = useState({
    twoFactorEnabled: mockUserData.twoFactorEnabled,
    darkMode: mockUserData.darkMode,
    aiModerationReports: mockUserData.aiModerationReports,
    notificationEmails: mockUserData.notificationEmails,
  });

  const handleSave = () => {
    // TODO: Implement actual API call to save profile data
    toast.success("Profile updated successfully");
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setUserData(mockUserData);
    setIsEditMode(false);
  };

  const handleProfileUpdate = (data: {
    fullName: string;
    username: string;
    email: string;
  }) => {
    setUserData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handlePhotoChange = async (file: File) => {
    // TODO: Implement actual photo upload API call
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData((prev) => ({
        ...prev,
        profilePic: reader.result as string,
      }));
      toast.success("Profile photo updated");
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
          {/* Left Sidebar */}
          <div className="lg:shrink-0">
            <ProfileSidebar
              isEditMode={isEditMode}
              profilePic={userData.profilePic}
              name={userData.fullName}
              username={userData.username}
              role={userData.role}
              dateJoined={userData.dateJoined}
              chatCount={userData.chatCount}
              onPhotoChange={handlePhotoChange}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            <ProfileForm
              isEditMode={isEditMode}
              fullName={userData.fullName}
              username={userData.username}
              email={userData.email}
              dateJoined={userData.dateJoined}
              role={userData.role}
              emailVerified={userData.emailVerified}
              onUpdate={handleProfileUpdate}
            />

            <SecuritySettings/>
            <DangerZone />
          </div>
        </div>
      </div>
    </div>
  );
}

