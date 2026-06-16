import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";

async function getOwnedSop(sopId: string, businessId: string) {
  const sop = await prisma.sop.findUnique({ where: { id: sopId } });
  if (!sop || sop.businessId !== businessId) return null;
  return sop;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getBusinessWithAccess(session.user.businessId);
  if (!access?.hasActiveSubscription) {
    return NextResponse.json({ error: "An active subscription is required." }, { status: 402 });
  }
  const { id } = await params;
  const sop = await getOwnedSop(id, session.user.businessId);
  if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ sop });
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  purpose: z.string().max(2000).optional(),
  scope: z.string().max(2000).optional(),
  safetyNotes: z.string().max(2000).optional(),
  responsibilities: z.array(z.string()).optional(),
  toolsNeeded: z.array(z.string()).optional(),
  steps: z.array(z.object({ title: z.string(), details: z.string() })).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getBusinessWithAccess(session.user.businessId);
  if (!access?.hasActiveSubscription) {
    return NextResponse.json({ error: "An active subscription is required." }, { status: 402 });
  }
  const { id } = await params;
  const sop = await getOwnedSop(id, session.user.businessId);
  if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await request.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.sop.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ sop: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sop = await getOwnedSop(id, session.user.businessId);
  if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.sop.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
