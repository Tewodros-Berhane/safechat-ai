import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, username: true, email: true } },
        chat: { select: { id: true, name: true, title: true } },
      },
    });

    return NextResponse.json(
      reports.map((report) => ({
        id: report.id,
        reporterId: report.reporterId,
        chatId: report.chatId,
        message: report.message,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        reporter:
          report.reporter && {
            id: report.reporter.id,
            username: report.reporter.username,
            email: report.reporter.email,
          },
        chat:
          report.chat && {
            id: report.chat.id,
            name: report.chat.name || report.chat.title,
          },
      }))
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
