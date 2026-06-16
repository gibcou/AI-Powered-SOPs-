import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200).optional().or(z.literal("")),
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sop = await prisma.sop.findUnique({ where: { shareToken: token } });
  if (!sop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await getBusinessWithAccess(sop.businessId);
  if (!access?.hasActiveSubscription) {
    return NextResponse.json({ error: "This SOP is no longer available." }, { status: 403 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const acknowledgment = await prisma.acknowledgment.create({
    data: {
      sopId: sop.id,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
    },
  });

  return NextResponse.json({ acknowledgment });
}
