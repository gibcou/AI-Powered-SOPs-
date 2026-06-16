import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

export const REVIEW_INTERVAL_DAYS = 90;
export const FREE_TRIAL_SOP_LIMIT = 2;

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

  // Businesses that have never started a paid subscription get a free trial
  // covering their first FREE_TRIAL_SOP_LIMIT SOPs. Once they've subscribed
  // (even if they later cancel), the trial no longer applies.
  const everSubscribed = business.subscription !== null;
  const inFreeTrial = !everSubscribed;

  const plan = business.subscription ? PLANS[business.subscription.plan] : null;
  const sopCount = business.sops.length;
  const sopLimit = hasActiveSubscription ? plan?.sopLimit ?? 0 : inFreeTrial ? FREE_TRIAL_SOP_LIMIT : 0;

  // Can the business use the dashboard / view and manage existing SOPs at all?
  const hasAccess = hasActiveSubscription || inFreeTrial;
  const canCreateSop = hasActiveSubscription
    ? sopCount < (plan?.sopLimit ?? 0)
    : inFreeTrial && sopCount < FREE_TRIAL_SOP_LIMIT;

  return {
    business,
    hasActiveSubscription,
    hasAccess,
    inFreeTrial,
    plan,
    sopLimit,
    sopCount,
    canCreateSop,
  };
}
