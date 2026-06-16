"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function NewSopForm({ disabled, disabledReason }: { disabled: boolean; disabledReason?: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/sops", {
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

    setDescription("");
    router.push(`/dashboard/sops/${data.sop.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
      <label className="block text-sm font-medium text-slate-700">
        Describe a process you want documented
      </label>
      <textarea
        required
        minLength={10}
        disabled={disabled || loading}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="e.g. How we onboard a new client: send the welcome packet, schedule a kickoff call, set up their project in our tool, and assign an account manager..."
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
      />
      {disabled && disabledReason && <p className="mt-2 text-sm text-amber-600">{disabledReason}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={disabled || loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating SOP..." : "Generate SOP with AI"}
      </button>
    </form>
  );
}
