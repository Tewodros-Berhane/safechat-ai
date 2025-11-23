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
    return NextResponse.json({ error: "Invalid model id" }, { status: 400 });
  }

  try {
    const updates = await req.json();
    const model = await prisma.aIModel.update({
      where: { id },
      data: {
        ...updates,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      ...model,
      lastUpdated: model.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { error: "Failed to update model" },
      { status: 500 }
    );
  }
}
