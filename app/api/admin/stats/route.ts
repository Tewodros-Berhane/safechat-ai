import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [totalUsers, activeUsers, flaggedMessages, totalChats, newReports] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.message.count({ where: { isFlagged: true } }),
        prisma.chat.count(),
        prisma.report.count({ where: { status: "PENDING" } }),
      ]);

    const uptime = 99.98;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      flaggedMessages,
      totalChats,
      newReports,
      uptime,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
