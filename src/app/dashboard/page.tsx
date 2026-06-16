import Link from "next/link";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";
import { NewSopForm } from "@/components/new-sop-form";

export default async function DashboardPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const [access, sops] = await Promise.all([
    getBusinessWithAccess(businessId),
    prisma.sop.findMany({ where: { businessId }, orderBy: { updatedAt: "desc" } }),
  ]);

  const disabled = !access?.hasActiveSubscription || !access.canCreateSop;
  let disabledReason: string | undefined;
  if (!access?.hasActiveSubscription) {
    disabledReason = "Subscribe to a plan to start generating SOPs.";
  } else if (!access.canCreateSop) {
    disabledReason = `You've reached your plan's limit of ${access.sopLimit} SOPs. Upgrade in Billing to add more.`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SOP Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          {access?.hasActiveSubscription
            ? `${access.sopCount} of ${access.sopLimit} SOPs used on the ${access.plan?.name} plan`
            : "Subscribe to start generating AI-written SOPs."}
        </p>
      </div>

      {!access?.hasActiveSubscription && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your account doesn&apos;t have an active subscription yet.{" "}
          <Link href="/dashboard/billing" className="font-semibold underline">
            Choose a plan
          </Link>{" "}
          to start generating SOPs.
        </div>
      )}

      <NewSopForm disabled={disabled} disabledReason={disabledReason} />

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
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      sop.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sop.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
