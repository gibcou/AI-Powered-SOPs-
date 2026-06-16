import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { BillingActions } from "@/components/billing-actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { success, canceled } = await searchParams;
  const session = await auth();
  const businessId = session!.user.businessId!;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  });

  const subscription = business?.subscription;
  const currentPlan = subscription ? PLANS[subscription.plan] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your subscription and payment method.</p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Subscription updated! It may take a few seconds to reflect here.
        </div>
      )}
      {canceled && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">Checkout canceled.</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Current plan</h2>
        {subscription && currentPlan ? (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {currentPlan.name} — ${currentPlan.price}/mo
              </p>
              <p className="text-sm text-slate-500">
                Status: {subscription.status}
                {subscription.cancelAtPeriodEnd ? " (cancels at period end)" : ""}
              </p>
            </div>
            <BillingActions mode="portal" />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            You don&apos;t have an active subscription. Choose a plan below to get started.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS.STARTER][]).map(([key, plan]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ${plan.price}
              <span className="text-sm font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <BillingActions mode="checkout" plan={key} disabled={subscription?.plan === key && subscription.status === "ACTIVE"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
