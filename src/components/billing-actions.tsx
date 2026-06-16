"use client";

import { useState } from "react";

export function BillingActions({
  mode,
  plan,
  disabled,
}: {
  mode: "checkout" | "portal";
  plan?: "STARTER" | "PRO";
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    const url = mode === "checkout" ? "/api/stripe/checkout" : "/api/stripe/portal";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: mode === "checkout" ? JSON.stringify({ plan }) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading
          ? "Loading..."
          : mode === "portal"
            ? "Manage subscription"
            : disabled
              ? "Current plan"
              : "Choose plan"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
