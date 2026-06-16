import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSop } from "@/lib/anthropic";
import { getBusinessWithAccess } from "@/lib/access";

export async function GET() {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sops = await prisma.sop.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ sops });
}

const createSchema = z.object({
  processDescription: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessWithAccess(session.user.businessId);
  if (!access) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }
  if (!access.hasActiveSubscription) {
    return NextResponse.json(
      { error: "An active subscription is required to generate SOPs." },
      { status: 402 },
    );
  }
  if (!access.canCreateSop) {
    return NextResponse.json(
      { error: `You've reached your plan's limit of ${access.sopLimit} SOPs. Upgrade to add more.` },
      { status: 402 },
    );
  }

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI generation is not configured. Set ANTHROPIC_API_KEY on the server." },
      { status: 503 },
    );
  }

  try {
    const generated = await generateSop({
      businessName: access.business.name,
      industry: access.business.industry,
      processDescription: parsed.data.processDescription,
    });

    const sop = await prisma.sop.create({
      data: {
        businessId: session.user.businessId,
        createdById: session.user.id,
        rawPrompt: parsed.data.processDescription,
        title: generated.title,
        category: generated.category,
        purpose: generated.purpose,
        scope: generated.scope,
        responsibilities: generated.responsibilities,
        toolsNeeded: generated.toolsNeeded,
        steps: generated.steps,
        safetyNotes: generated.safetyNotes,
      },
    });

    return NextResponse.json({ sop });
  } catch (error) {
    console.error("SOP generation failed", error);
    return NextResponse.json({ error: "Failed to generate SOP. Please try again." }, { status: 500 });
  }
}
