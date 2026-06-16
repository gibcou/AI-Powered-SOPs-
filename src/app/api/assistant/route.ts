import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";
import { askAssistant } from "@/lib/anthropic";

const schema = z.object({
  question: z.string().min(3).max(1000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getBusinessWithAccess(session.user.businessId);
  if (!access?.hasActiveSubscription) {
    return NextResponse.json({ error: "An active subscription is required." }, { status: 402 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI generation is not configured. Set ANTHROPIC_API_KEY on the server." },
      { status: 503 },
    );
  }

  const sops = await prisma.sop.findMany({
    where: { businessId: session.user.businessId },
    select: { title: true, category: true, purpose: true, scope: true, steps: true },
  });

  try {
    const answer = await askAssistant({
      businessName: access.business.name,
      question: parsed.data.question,
      sops: sops.map((sop) => ({
        title: sop.title,
        category: sop.category,
        purpose: sop.purpose,
        scope: sop.scope,
        steps: (sop.steps as { title: string; details: string }[] | null) ?? [],
      })),
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Assistant query failed", error);
    return NextResponse.json({ error: "Failed to get an answer. Please try again." }, { status: 500 });
  }
}
