import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

// Helper function to get session from token
async function getSessionFromRequest() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"
    )?.value;

    if (!sessionToken) {
      return null;
    }

    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET || "",
    });

    if (!decoded || !decoded.email) {
      return null;
    }

    const exp = typeof decoded.exp === "number" ? decoded.exp : undefined;
    return {
      user: { email: decoded.email, id: decoded.sub },
      expires: exp ? new Date(exp * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error decoding session:", error);
    return null;
  }
}

// GET current user
export async function GET() {
  try {
    // Try getServerSession first
    let session = await getServerSession(authOptions);

    // If that doesn't work, try reading from cookies
    if (!session) {
      session = await getSessionFromRequest();
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        isPrivate: true,
        isOnline: true,
        lastSeen: true,
        isOnline: true,
        lastSeen: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            chats1: true,
            chats2: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total chat count
    const chatCount =
      (user._count.chats1 || 0) + (user._count.chats2 || 0);

    // Return user without passwordHash
    const { _count, ...userData } = user;

    return NextResponse.json({
      user: {
        ...userData,
        chatCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH update user
export async function PATCH(request: NextRequest) {
  try {
    // Try getServerSession first
    let session = await getServerSession(authOptions);

    // If that doesn't work, try reading from cookies
    if (!session) {
      session = await getSessionFromRequest();
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    const previousProfilePic = user.profilePic;

    let username: string | undefined;
    let age: number | undefined;
    let isPrivate: boolean | undefined;
    let profilePicPath: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const usernameValue = formData.get("username");
      const ageValue = formData.get("age");
      const profilePic = formData.get("profilePic");
      const isPrivateValue = formData.get("isPrivate");

      username = typeof usernameValue === "string" && usernameValue.trim() ? usernameValue : undefined;
      age = typeof ageValue === "string" && ageValue.trim() ? Number(ageValue) : undefined;
      if (age !== undefined && Number.isNaN(age)) {
        age = undefined;
      }

      if (typeof isPrivateValue === "string" && isPrivateValue.length > 0) {
        isPrivate = ["true", "1", "on"].includes(isPrivateValue.toLowerCase());
      }

      if (profilePic instanceof File) {
        const arrayBuffer = await profilePic.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
        await fs.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(profilePic.name) || ".png";
        const fileName = `${user.id}-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);
        profilePicPath = `/uploads/profiles/${fileName}`;
      }
    } else {
      const body = await request.json();
      username = body.username;
      age = typeof body.age === "number" ? body.age : undefined;
      if (typeof body.isPrivate === "boolean") {
        isPrivate = body.isPrivate;
      }

      // Accept direct path updates for future flexibility, but avoid storing base64 blobs.
      if (body.profilePic && typeof body.profilePic === "string" && body.profilePic.startsWith("/")) {
        profilePicPath = body.profilePic;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username && { username }),
        ...(age !== undefined && { age }),
        ...(profilePicPath !== undefined && { profilePic: profilePicPath }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        isPrivate: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Clean up old profile image if we successfully saved a new one
    if (
      profilePicPath &&
      previousProfilePic &&
      previousProfilePic.startsWith("/uploads/profiles/")
    ) {
      const oldFilePath = path.join(process.cwd(), "public", previousProfilePic);
      fs.unlink(oldFilePath).catch(() => {
        // Ignore cleanup errors
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

