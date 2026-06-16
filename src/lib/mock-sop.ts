import type { GeneratedSop } from "@/lib/anthropic";

function titleCase(text: string) {
  const trimmed = text.trim().split(/\s+/).slice(0, 6).join(" ");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function mockGenerateSop(processDescription: string): GeneratedSop {
  const summary = processDescription.trim().replace(/\s+/g, " ");
  const sentences = summary.split(/(?<=[.!?])\s+/).filter(Boolean);
  const steps = (sentences.length > 0 ? sentences : [summary]).slice(0, 6).map((sentence, i) => ({
    title: `Step ${i + 1}`,
    details: sentence,
  }));

  return {
    title: `${titleCase(summary)} — SOP`,
    category: "Operations",
    purpose: `This procedure documents how the team should consistently complete: "${summary}".`,
    scope: "Applies to all team members responsible for this task.",
    responsibilities: ["Task owner: completes the steps below", "Manager: reviews for quality and sign-off"],
    toolsNeeded: ["Whatever systems/tools your team already uses for this task"],
    steps,
    safetyNotes: "No special safety considerations.",
  };
}
