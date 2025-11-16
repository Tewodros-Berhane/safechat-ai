"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail, Calendar, Shield, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ProfileFormProps {
  isEditMode: boolean;
  fullName: string;
  username: string;
  email: string;
  dateJoined: Date;
  role: "USER" | "MODERATOR" | "ADMIN";
  emailVerified?: boolean;
  onUpdate: (data: { fullName: string; username: string; email: string }) => void;
}

export default function ProfileForm({
  isEditMode,
  fullName,
  username,
  email,
  dateJoined,
  role,
  emailVerified = false,
  onUpdate,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName,
    username,
    email,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = () => {
    if (isEditMode) {
      onUpdate(formData);
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

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <User className="w-5 h-5 text-gray-600" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onBlur={handleBlur}
              disabled={!isEditMode}
              className={`transition-all duration-200 ${
                isEditMode
                  ? "border-gray-300 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                  : "border-gray-100 bg-gray-50"
              }`}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700">
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              onBlur={handleBlur}
              disabled={!isEditMode}
              className={`transition-all duration-200 ${
                isEditMode
                  ? "border-gray-300 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                  : "border-gray-100 bg-gray-50"
              }`}
              placeholder="Enter your username"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={handleBlur}
              disabled={!isEditMode}
              className={`pl-10 transition-all duration-200 ${
                isEditMode
                  ? "border-gray-300 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                  : "border-gray-100 bg-gray-50"
              }`}
              placeholder="Enter your email"
            />
            {emailVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Joined (Read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Date Joined
          </Label>
          <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
            {format(dateJoined, "MMMM d, yyyy")}
          </div>
        </div>

        {/* Role (Read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            Role
          </Label>
          <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
            {getRoleLabel(role)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

