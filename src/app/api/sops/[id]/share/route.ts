import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop || sop.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shareToken = sop.shareToken ?? randomBytes(16).toString("hex");
  const updated = await prisma.sop.update({ where: { id }, data: { shareToken } });

  return NextResponse.json({ shareToken: updated.shareToken });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop || sop.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.sop.update({ where: { id }, data: { shareToken: null } });
  return NextResponse.json({ success: true });
}
