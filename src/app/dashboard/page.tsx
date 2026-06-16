import Link from "next/link";
import { FileText, Lock, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess, daysSince, REVIEW_INTERVAL_DAYS, FREE_TRIAL_SOP_LIMIT } from "@/lib/access";
import { NewSopForm } from "@/components/new-sop-form";

function needsReview(lastReviewedAt: Date) {
  return daysSince(lastReviewedAt) >= REVIEW_INTERVAL_DAYS;
}

export default async function DashboardPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const [access, sops] = await Promise.all([
    getBusinessWithAccess(businessId),
    prisma.sop.findMany({ where: { businessId }, orderBy: { updatedAt: "desc" } }),
  ]);

  if (!access?.hasAccess) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SOP Library</h1>
          <p className="mt-1 text-sm text-slate-500">Subscribe to access your SOP library.</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-lg font-semibold text-amber-900">
            {sops.length > 0
              ? `${sops.length} SOP${sops.length === 1 ? "" : "s"} are locked`
              : "Your library is empty"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-amber-800">
            {sops.length > 0
              ? "Your account doesn't have an active subscription, so your SOPs — including any public share links — are hidden until you resubscribe. Reactivate your plan to get them back instantly."
              : "Subscribe to a plan to start generating AI-written SOPs for your business."}
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {sops.length > 0 ? "Reactivate subscription" : "Choose a plan"}
          </Link>
        </div>
      </div>
    );
  }

  const disabled = !access.canCreateSop;
  const disabledReason = disabled
    ? access.inFreeTrial
      ? "You've used both of your free trial SOPs. Subscribe to a plan to create more."
      : `You've reached your plan's limit of ${access.sopLimit} SOPs. Upgrade in Billing to add more.`
    : undefined;

  const dueForReview = sops.filter((sop) => needsReview(sop.lastReviewedAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SOP Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          {access.inFreeTrial
            ? `${access.sopCount} of ${access.sopLimit} free trial SOPs used`
            : `${access.sopCount} of ${access.sopLimit} SOPs used on the ${access.plan?.name} plan`}
        </p>
      </div>

      {access.inFreeTrial && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
          You&apos;re on a free trial: your first {FREE_TRIAL_SOP_LIMIT} SOPs are free. Subscribe anytime to unlock more.
        </div>
      )}

      {dueForReview.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            {dueForReview.length} SOP{dueForReview.length === 1 ? "" : "s"} {dueForReview.length === 1 ? "hasn't" : "haven't"} been
            reviewed in over {REVIEW_INTERVAL_DAYS} days. Open them and confirm they&apos;re still accurate.
          </p>
        </div>
      )}

      <NewSopForm disabled={disabled} disabledReason={disabledReason} showSubscribeLink={disabled && access.inFreeTrial} />

      <div>
        {sops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No SOPs yet. Describe a process above to generate your first one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sops.map((sop) => (
              <Link
                key={sop.id}
                href={`/dashboard/sops/${sop.id}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">{sop.title}</h3>
                  {sop.category && <p className="mt-1 text-xs text-slate-500">{sop.category}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        sop.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sop.status}
                    </span>
                    {needsReview(sop.lastReviewedAt) && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Review due
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
