import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SopDetail } from "@/components/sop-detail";

export default async function SopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const businessId = session!.user.businessId!;

  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop || sop.businessId !== businessId) {
    notFound();
  }

  return (
    <SopDetail
      sop={{
        id: sop.id,
        title: sop.title,
        category: sop.category,
        status: sop.status,
        purpose: sop.purpose,
        scope: sop.scope,
        safetyNotes: sop.safetyNotes,
        responsibilities: (sop.responsibilities as string[] | null) ?? [],
        toolsNeeded: (sop.toolsNeeded as string[] | null) ?? [],
        steps: (sop.steps as { title: string; details: string }[] | null) ?? [],
        shareToken: sop.shareToken,
      }}
    />
  );
}
