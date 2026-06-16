"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Sparkles,
  Loader2,
  FileText,
  ArrowLeft,
  Download,
  Link2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type DemoSop = {
  id: string;
  title: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  purpose: string;
  scope: string;
  safetyNotes: string;
  responsibilities: string[];
  toolsNeeded: string[];
  steps: { title: string; details: string }[];
};

const SAMPLE_SOPS: DemoSop[] = [
  {
    id: "sample-1",
    title: "New Client Onboarding",
    category: "Operations",
    status: "PUBLISHED",
    purpose:
      "To ensure every new client has a consistent, professional onboarding experience that sets clear expectations and gets their project started quickly.",
    scope: "Applies to all account managers handling new client sign-ups.",
    safetyNotes: "No special safety considerations.",
    responsibilities: [
      "Account Manager: owns the relationship and runs the kickoff call",
      "Operations Coordinator: sets up the client in internal systems",
    ],
    toolsNeeded: ["CRM", "Project management tool", "E-signature software"],
    steps: [
      { title: "Send welcome packet", details: "Email the client a welcome packet with a contract, intake form, and what to expect in the first 30 days." },
      { title: "Schedule kickoff call", details: "Book a 30-minute kickoff call within 2 business days of signing to align on goals, timeline, and points of contact." },
      { title: "Set up client in project tool", details: "Create a new project workspace, invite the client's team, and add initial milestones based on the kickoff call." },
      { title: "Assign account manager", details: "Confirm the dedicated account manager in writing and introduce them via email to the client's main contact." },
    ],
  },
  {
    id: "sample-2",
    title: "End-of-Day Register Closing",
    category: "Retail",
    status: "PUBLISHED",
    purpose: "To ensure cash and card totals are reconciled accurately and the store is secured at close.",
    scope: "Applies to all shift leads closing the store.",
    safetyNotes: "Never count cash alone after dark; always close with a second staff member present.",
    responsibilities: [
      "Shift Lead: counts the till and completes the closing checklist",
      "Manager: reviews the closing report the next morning",
    ],
    toolsNeeded: ["POS system", "Cash drawer", "Closing checklist form"],
    steps: [
      { title: "Run end-of-day report", details: "Generate the daily sales report from the POS system before touching the cash drawer." },
      { title: "Count and reconcile cash", details: "Count the cash drawer, compare it to the POS-reported total, and note any discrepancy over $5." },
      { title: "Prepare bank deposit", details: "Place cash and a deposit slip in the bank bag and lock it in the safe." },
      { title: "Secure the store", details: "Turn off non-essential equipment, lock all doors and windows, and arm the alarm system before leaving." },
    ],
  },
];

export function DemoApp() {
  const [sops, setSops] = useState<DemoSop[]>(SAMPLE_SOPS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = sops.find((s) => s.id === selectedId) ?? null;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/demo/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processDescription: description }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const newSop: DemoSop = {
      id: `generated-${Date.now()}`,
      title: data.sop.title,
      category: data.sop.category,
      status: "DRAFT",
      purpose: data.sop.purpose,
      scope: data.sop.scope,
      safetyNotes: data.sop.safetyNotes,
      responsibilities: data.sop.responsibilities ?? [],
      toolsNeeded: data.sop.toolsNeeded ?? [],
      steps: data.sop.steps ?? [],
    };

    setSops((prev) => [newSop, ...prev]);
    setSelectedId(newSop.id);
    setDescription("");
  }

  function updateSelected(patch: Partial<DemoSop>) {
    if (!selected) return;
    setSops((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
  }

  async function handleExportPdf() {
    if (!selected) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 48;
    let y = margin;
    const lineHeight = 16;
    const maxWidth = 612 - margin * 2;

    function writeLine(text: string, size = 11, bold = false) {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > 750) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }
    }

    writeLine(selected.title, 20, true);
    if (selected.category) writeLine(selected.category, 11);
    y += 8;
    writeLine("Purpose", 13, true);
    writeLine(selected.purpose);
    y += 6;
    writeLine("Scope", 13, true);
    writeLine(selected.scope);
    y += 6;
    writeLine("Responsibilities", 13, true);
    selected.responsibilities.forEach((r) => writeLine(`• ${r}`));
    y += 6;
    writeLine("Tools Needed", 13, true);
    selected.toolsNeeded.forEach((t) => writeLine(`• ${t}`));
    y += 6;
    writeLine("Steps", 13, true);
    selected.steps.forEach((step, i) => {
      writeLine(`${i + 1}. ${step.title}`, 11, true);
      writeLine(step.details);
      y += 4;
    });
    writeLine("Safety Notes", 13, true);
    writeLine(selected.safetyNotes);

    doc.save(`${selected.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white sm:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 font-semibold text-slate-900">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          <span>SOPilot</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          <button
            onClick={() => setSelectedId(null)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <FileText className="h-4 w-4" /> SOP Library
          </button>
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Start free trial <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
          You&apos;re viewing a live demo — nothing here is saved.{" "}
          <Link href="/signup" className="font-semibold underline">
            Sign up
          </Link>{" "}
          to keep your SOPs.
        </div>

        <main className="mx-auto max-w-5xl px-6 py-10">
          {!selected ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">SOP Library</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Try generating a real SOP below, or open one of the examples.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="rounded-2xl border border-slate-200 bg-white p-6">
                <label className="block text-sm font-medium text-slate-700">
                  Describe a process you want documented
                </label>
                <textarea
                  required
                  minLength={10}
                  disabled={loading}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. How we handle a customer refund request: verify the order, check the return policy, process the refund in our payment system, and email the customer a confirmation..."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loading ? "Generating SOP..." : "Generate SOP with AI"}
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-2">
                {sops.map((sop) => (
                  <button
                    key={sop.id}
                    onClick={() => setSelectedId(sop.id)}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-indigo-300 hover:shadow-sm"
                  >
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{sop.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{sop.category}</p>
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
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back to library
              </button>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <input
                    value={selected.title}
                    onChange={(e) => updateSelected({ title: e.target.value })}
                    className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 focus:outline-none"
                  />
                  <input
                    value={selected.category}
                    onChange={(e) => updateSelected({ category: e.target.value })}
                    className="mt-1 w-full border-none bg-transparent text-sm text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateSelected({ status: selected.status === "DRAFT" ? "PUBLISHED" : "DRAFT" })
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selected.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {selected.status === "PUBLISHED" ? "Published" : "Mark as published"}
                  </button>
                  <button
                    disabled
                    title="Sign up to get a real shareable link"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-400"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Share link
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
                <Field label="Purpose" value={selected.purpose} onChange={(v) => updateSelected({ purpose: v })} />
                <Field label="Scope" value={selected.scope} onChange={(v) => updateSelected({ scope: v })} />

                <ListField
                  label="Responsibilities"
                  items={selected.responsibilities}
                  onChange={(items) => updateSelected({ responsibilities: items })}
                />
                <ListField
                  label="Tools Needed"
                  items={selected.toolsNeeded}
                  onChange={(items) => updateSelected({ toolsNeeded: items })}
                />

                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Steps</h3>
                  <div className="mt-3 space-y-4">
                    {selected.steps.map((step, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-4">
                        <input
                          value={step.title}
                          onChange={(e) => {
                            const steps = [...selected.steps];
                            steps[i] = { ...steps[i], title: e.target.value };
                            updateSelected({ steps });
                          }}
                          className="w-full border-none bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                        />
                        <textarea
                          value={step.details}
                          rows={2}
                          onChange={(e) => {
                            const steps = [...selected.steps];
                            steps[i] = { ...steps[i], details: e.target.value };
                            updateSelected({ steps });
                          }}
                          className="mt-1 w-full resize-none border-none bg-transparent text-sm text-slate-600 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Field label="Safety Notes" value={selected.safetyNotes} onChange={(v) => updateSelected({ safetyNotes: v })} />
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center text-sm text-indigo-700">
                Like what you see?{" "}
                <Link href="/signup" className="font-semibold underline">
                  Start your free trial
                </Link>{" "}
                to save SOPs, share real links, and invite your team.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-transparent px-1 py-1 text-sm text-slate-600 hover:border-slate-200 focus:border-indigo-300 focus:outline-none"
      />
    </div>
  );
}

function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
      <div className="mt-2 space-y-1">
        {items.map((item, i) => (
          <input
            key={i}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="w-full rounded-lg border border-transparent px-1 py-1 text-sm text-slate-600 hover:border-slate-200 focus:border-indigo-300 focus:outline-none"
          />
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          + Add item
        </button>
      </div>
    </div>
  );
}
