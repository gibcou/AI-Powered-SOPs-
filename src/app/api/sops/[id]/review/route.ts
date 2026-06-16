import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getBusinessWithAccess(session.user.businessId);
  if (!access?.hasAccess) {
    return NextResponse.json({ error: "An active subscription is required." }, { status: 402 });
  }
  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop || sop.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.sop.update({ where: { id }, data: { lastReviewedAt: new Date() } });
  return NextResponse.json({ lastReviewedAt: updated.lastReviewedAt });
}
