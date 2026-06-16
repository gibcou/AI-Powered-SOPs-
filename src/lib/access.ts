import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

export const REVIEW_INTERVAL_DAYS = 90;

export function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getBusinessWithAccess(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true, sops: { select: { id: true } } },
  });
  if (!business) return null;

  const hasActiveSubscription =
    business.subscription?.status === "ACTIVE" || business.subscription?.status === "TRIALING";

  const plan = business.subscription ? PLANS[business.subscription.plan] : null;
  const sopLimit = plan?.sopLimit ?? 0;
  const sopCount = business.sops.length;

  return {
    business,
    hasActiveSubscription,
    plan,
    sopLimit,
    sopCount,
    canCreateSop: hasActiveSubscription && sopCount < sopLimit,
  };
}
