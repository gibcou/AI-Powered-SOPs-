import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess, daysSince } from "@/lib/access";
import { SopDetail } from "@/components/sop-detail";

export default async function SopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const businessId = session!.user.businessId!;

  const access = await getBusinessWithAccess(businessId);
  if (!access?.hasAccess) {
    redirect("/dashboard");
  }

  const sop = await prisma.sop.findUnique({
    where: { id },
    include: { acknowledgments: { orderBy: { acknowledgedAt: "desc" } } },
  });
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
        lastReviewedAt: sop.lastReviewedAt.toISOString(),
        daysSinceReview: daysSince(sop.lastReviewedAt),
        acknowledgments: sop.acknowledgments.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          acknowledgedAt: a.acknowledgedAt.toISOString(),
        })),
      }}
    />
  );
}
