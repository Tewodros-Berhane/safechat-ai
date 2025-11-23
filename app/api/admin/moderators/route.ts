import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { Role } from "@prisma/client";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const moderators = await prisma.user.findMany({
      where: { role: Role.MODERATOR },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      moderators.map((mod) => ({
        ...mod,
        createdAt: mod.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderators" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, username, fullName, password } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: "Email and username are required" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password || "ChangeMe123!", 10);

    const moderator = await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        username,
        role: Role.MODERATOR,
      },
      create: {
        email,
        username,
        fullName,
        passwordHash,
        role: Role.MODERATOR,
        status: "ACTIVE",
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...moderator,
      createdAt: moderator.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating moderator:", error);
    return NextResponse.json(
      { error: "Failed to create moderator" },
      { status: 500 }
    );
  }
}
