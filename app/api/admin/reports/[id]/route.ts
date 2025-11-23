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
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  try {
    const { status } = await req.json();
    const report = await prisma.report.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        reporterId: true,
        chatId: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...report,
      createdAt: report.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
