"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Link2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";

const REVIEW_INTERVAL_DAYS = 90;

type Acknowledgment = {
  id: string;
  name: string;
  email: string | null;
  acknowledgedAt: string;
};

type SopData = {
  id: string;
  title: string;
  category: string | null;
  status: "DRAFT" | "PUBLISHED";
  purpose: string | null;
  scope: string | null;
  safetyNotes: string | null;
  responsibilities: string[];
  toolsNeeded: string[];
  steps: { title: string; details: string }[];
  shareToken: string | null;
  lastReviewedAt: string;
  daysSinceReview: number;
  acknowledgments: Acknowledgment[];
};

export function SopDetail({ sop: initialSop }: { sop: SopData }) {
  const router = useRouter();
  const [sop, setSop] = useState(initialSop);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialSop.shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/s/${initialSop.shareToken}`
      : null,
  );
  const [copied, setCopied] = useState(false);
  const [markingReviewed, setMarkingReviewed] = useState(false);

  const needsReview = sop.daysSinceReview >= REVIEW_INTERVAL_DAYS;

  async function handleMarkReviewed() {
    setMarkingReviewed(true);
    const res = await fetch(`/api/sops/${sop.id}/review`, { method: "POST" });
    const data = await res.json();
    setMarkingReviewed(false);
    if (res.ok) {
      setSop((prev) => ({ ...prev, lastReviewedAt: data.lastReviewedAt, daysSinceReview: 0 }));
      router.refresh();
    }
  }

  async function saveField(patch: Partial<SopData>) {
    setSaving(true);
    const res = await fetch(`/api/sops/${sop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      setSop((prev) => ({ ...prev, ...patch }));
      router.refresh();
    }
  }

  async function togglePublish() {
    await saveField({ status: sop.status === "DRAFT" ? "PUBLISHED" : "DRAFT" });
  }

  async function handleShare() {
    const res = await fetch(`/api/sops/${sop.id}/share`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      const url = `${window.location.origin}/s/${data.shareToken}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this SOP? This cannot be undone.")) return;
    const res = await fetch(`/api/sops/${sop.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleExportPdf() {
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

    writeLine(sop.title, 20, true);
    if (sop.category) writeLine(sop.category, 11);
    y += 8;
    if (sop.purpose) {
      writeLine("Purpose", 13, true);
      writeLine(sop.purpose);
      y += 6;
    }
    if (sop.scope) {
      writeLine("Scope", 13, true);
      writeLine(sop.scope);
      y += 6;
    }
    if (sop.responsibilities.length > 0) {
      writeLine("Responsibilities", 13, true);
      sop.responsibilities.forEach((r) => writeLine(`• ${r}`));
      y += 6;
    }
    if (sop.toolsNeeded.length > 0) {
      writeLine("Tools Needed", 13, true);
      sop.toolsNeeded.forEach((t) => writeLine(`• ${t}`));
      y += 6;
    }
    if (sop.steps.length > 0) {
      writeLine("Steps", 13, true);
      sop.steps.forEach((step, i) => {
        writeLine(`${i + 1}. ${step.title}`, 11, true);
        writeLine(step.details);
        y += 4;
      });
    }
    if (sop.safetyNotes) {
      writeLine("Safety Notes", 13, true);
      writeLine(sop.safetyNotes);
    }

    doc.save(`${sop.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <input
            value={sop.title}
            onChange={(e) => setSop((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={() => saveField({ title: sop.title })}
            className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 focus:outline-none"
          />
          <input
            value={sop.category ?? ""}
            placeholder="Category"
            onChange={(e) => setSop((prev) => ({ ...prev, category: e.target.value }))}
            onBlur={() => saveField({ category: sop.category ?? "" })}
            className="mt-1 w-full border-none bg-transparent text-sm text-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={togglePublish}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
              sop.status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {sop.status === "PUBLISHED" ? "Published" : "Mark as published"}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Link2 className="h-3.5 w-3.5" /> {copied ? "Link copied!" : "Share link"}
          </button>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button
            onClick={handleMarkReviewed}
            disabled={markingReviewed}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Mark as reviewed
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
          Public link: <span className="font-mono">{shareUrl}</span>
        </div>
      )}

      {needsReview ? (
        <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          This SOP hasn&apos;t been reviewed in {sop.daysSinceReview} days. Confirm it&apos;s still accurate and mark it as reviewed.
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Last reviewed {sop.daysSinceReview === 0 ? "today" : `${sop.daysSinceReview} day${sop.daysSinceReview === 1 ? "" : "s"} ago`}.
        </p>
      )}

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
        <Field label="Purpose" value={sop.purpose ?? ""} onChange={(v) => setSop((p) => ({ ...p, purpose: v }))} onBlur={() => saveField({ purpose: sop.purpose ?? "" })} />
        <Field label="Scope" value={sop.scope ?? ""} onChange={(v) => setSop((p) => ({ ...p, scope: v }))} onBlur={() => saveField({ scope: sop.scope ?? "" })} />

        <ListField
          label="Responsibilities"
          items={sop.responsibilities}
          onChange={(items) => setSop((p) => ({ ...p, responsibilities: items }))}
          onBlur={(items) => saveField({ responsibilities: items })}
        />
        <ListField
          label="Tools Needed"
          items={sop.toolsNeeded}
          onChange={(items) => setSop((p) => ({ ...p, toolsNeeded: items }))}
          onBlur={(items) => saveField({ toolsNeeded: items })}
        />

        <div>
          <h3 className="text-sm font-semibold text-slate-700">Steps</h3>
          <div className="mt-3 space-y-4">
            {sop.steps.map((step, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-4">
                <input
                  value={step.title}
                  onChange={(e) => {
                    const steps = [...sop.steps];
                    steps[i] = { ...steps[i], title: e.target.value };
                    setSop((p) => ({ ...p, steps }));
                  }}
                  onBlur={() => saveField({ steps: sop.steps })}
                  className="w-full border-none bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                  placeholder={`Step ${i + 1} title`}
                />
                <textarea
                  value={step.details}
                  rows={2}
                  onChange={(e) => {
                    const steps = [...sop.steps];
                    steps[i] = { ...steps[i], details: e.target.value };
                    setSop((p) => ({ ...p, steps }));
                  }}
                  onBlur={() => saveField({ steps: sop.steps })}
                  className="mt-1 w-full resize-none border-none bg-transparent text-sm text-slate-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <Field
          label="Safety Notes"
          value={sop.safetyNotes ?? ""}
          onChange={(v) => setSop((p) => ({ ...p, safetyNotes: v }))}
          onBlur={() => saveField({ safetyNotes: sop.safetyNotes ?? "" })}
        />
      </div>

      {saving && <p className="text-xs text-slate-400">Saving...</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Users className="h-4 w-4 text-indigo-600" /> Acknowledgments
        </h3>
        {sop.acknowledgments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No one has acknowledged this SOP yet. Share the public link so staff can read and sign off on it.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {sop.acknowledgments.map((ack) => (
              <li key={ack.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{ack.name}</p>
                  {ack.email && <p className="text-xs text-slate-500">{ack.email}</p>}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ack.acknowledgedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
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
  onBlur,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  onBlur: (items: string[]) => void;
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
            onBlur={() => onBlur(items)}
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
