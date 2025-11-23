import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { fullName, username, email, role, status } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
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
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
