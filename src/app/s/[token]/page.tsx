import { notFound } from "next/navigation";
import { ClipboardCheck, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessWithAccess } from "@/lib/access";
import { AcknowledgeForm } from "@/components/acknowledge-form";

export default async function SharedSopPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sop = await prisma.sop.findUnique({ where: { shareToken: token } });
  if (!sop) notFound();

  const access = await getBusinessWithAccess(sop.businessId);
  if (!access?.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-sm text-center">
          <Lock className="mx-auto h-8 w-8 text-slate-400" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">This SOP is no longer available</h1>
          <p className="mt-2 text-sm text-slate-500">
            The business that shared this link doesn&apos;t have an active SOPilot subscription right now.
          </p>
        </div>
      </div>
    );
  }

  const responsibilities = (sop.responsibilities as string[] | null) ?? [];
  const toolsNeeded = (sop.toolsNeeded as string[] | null) ?? [];
  const steps = (sop.steps as { title: string; details: string }[] | null) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 flex items-center gap-2 font-semibold text-slate-900">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          <span>SOPilot</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">{sop.title}</h1>
          {sop.category && <p className="mt-1 text-sm text-slate-500">{sop.category}</p>}

          {sop.purpose && (
            <Section title="Purpose">
              <p className="text-sm text-slate-600">{sop.purpose}</p>
            </Section>
          )}
          {sop.scope && (
            <Section title="Scope">
              <p className="text-sm text-slate-600">{sop.scope}</p>
            </Section>
          )}
          {responsibilities.length > 0 && (
            <Section title="Responsibilities">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Section>
          )}
          {toolsNeeded.length > 0 && (
            <Section title="Tools Needed">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {toolsNeeded.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Section>
          )}
          {steps.length > 0 && (
            <Section title="Steps">
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i}>
                    <p className="text-sm font-semibold text-slate-900">
                      {i + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{step.details}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}
          {sop.safetyNotes && (
            <Section title="Safety Notes">
              <p className="text-sm text-slate-600">{sop.safetyNotes}</p>
            </Section>
          )}

          <div className="mt-8 border-t border-slate-200 pt-6">
            <AcknowledgeForm token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
