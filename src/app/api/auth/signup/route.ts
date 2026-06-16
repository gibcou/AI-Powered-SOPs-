import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  businessName: z.string().min(1).max(100),
  industry: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = signupSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, businessName, industry } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      ownedBusiness: {
        create: {
          name: businessName,
          industry,
        },
      },
    },
    include: { ownedBusiness: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { businessId: user.ownedBusiness?.id },
  });

  return NextResponse.json({ success: true });
}
