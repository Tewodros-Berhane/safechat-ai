import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { Role } from "@prisma/client";

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
    return NextResponse.json({ error: "Invalid moderator id" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { role: Role.USER },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing moderator:", error);
    return NextResponse.json(
      { error: "Failed to remove moderator" },
      { status: 500 }
    );
  }
}
