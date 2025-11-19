"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, User, X } from "lucide-react";
import { format } from "date-fns";

interface ProfileSidebarProps {
  isEditMode: boolean;
  profilePic?: string | null;
  name: string;
  username: string;
  isPrivate?: boolean;
  role: "USER" | "MODERATOR" | "ADMIN";
  dateJoined: Date;
  chatCount?: number;
  onPhotoChange?: (file: File) => void;
  photoPreview?: string | null;
  pendingPhotoFile?: File | null;
  onCancelPhotoPreview?: () => void;
}

export default function ProfileSidebar({
  isEditMode,
  profilePic,
  name,
  username,
  isPrivate = false,
  role,
  dateJoined,
  chatCount = 0,
  onPhotoChange,
  photoPreview,
  pendingPhotoFile,
  onCancelPhotoPreview,
}: ProfileSidebarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoChange) {
      onPhotoChange(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "MODERATOR":
        return "Moderator";
      default:
        return "User";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full lg:w-[280px] shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative mb-4"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Avatar className="w-32 h-32 border-4 border-gray-100">
              <AvatarImage src={profilePic || undefined} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            {isEditMode && (
              <div
                className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
                  isHovering ? "opacity-100" : "opacity-0"
                }`}
              >
                <label className="cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>

          {isEditMode && (
            <>
              {photoPreview ? (
                <div className="w-full mb-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">Preview</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    onClick={onCancelPhotoPreview}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Preview
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-4 text-[#007AFF] border-[#007AFF] hover:bg-[#007AFF]/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              )}
            </>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-500 mb-2">@{username}</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {getRoleLabel(role)}
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Chats</span>
            <span className="font-medium text-gray-900">{chatCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Visibility</span>
            <span className="font-medium text-gray-900">{isPrivate ? "Private" : "Public"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Joined</span>
            <span className="font-medium text-gray-900">
              {format(dateJoined, "MMMM yyyy")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

