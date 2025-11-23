import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const models = await prisma.aIModel.findMany({
      orderBy: { lastUpdated: "desc" },
    });

    return NextResponse.json(
      models.map((model) => ({
        ...model,
        lastUpdated: model.lastUpdated.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
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
    const { name, endpoint, status = "ACTIVE", threshold = 0.85 } = body;

    if (!name || !endpoint) {
      return NextResponse.json(
        { error: "Name and endpoint are required" },
        { status: 400 }
      );
    }

    const model = await prisma.aIModel.create({
      data: {
        name,
        endpoint,
        status,
        threshold,
      },
    });

    return NextResponse.json({
      ...model,
      lastUpdated: model.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return NextResponse.json(
      { error: "Failed to create model" },
      { status: 500 }
    );
  }
}
