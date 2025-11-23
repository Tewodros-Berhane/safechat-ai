import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roleParam = req.nextUrl.searchParams.get("role");
  const roleFilter =
    roleParam && Object.values(Role).includes(roleParam as Role)
      ? (roleParam as Role)
      : undefined;

  try {
    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter } : undefined,
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

    const serialized = users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
