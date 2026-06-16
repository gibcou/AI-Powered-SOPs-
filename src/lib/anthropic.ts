import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
});

export type GeneratedSop = {
  title: string;
  category: string;
  purpose: string;
  scope: string;
  responsibilities: string[];
  toolsNeeded: string[];
  steps: { title: string; details: string }[];
  safetyNotes: string;
};

const SOP_TOOL = {
  name: "submit_sop",
  description: "Submit a structured standard operating procedure.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" },
      category: { type: "string" },
      purpose: { type: "string" },
      scope: { type: "string" },
      responsibilities: { type: "array", items: { type: "string" } },
      toolsNeeded: { type: "array", items: { type: "string" } },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            details: { type: "string" },
          },
          required: ["title", "details"],
        },
      },
      safetyNotes: { type: "string" },
    },
    required: [
      "title",
      "category",
      "purpose",
      "scope",
      "responsibilities",
      "toolsNeeded",
      "steps",
      "safetyNotes",
    ],
  },
};

export async function generateSop(params: {
  businessName: string;
  industry?: string | null;
  processDescription: string;
}): Promise<GeneratedSop> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    tools: [SOP_TOOL],
    tool_choice: { type: "tool", name: "submit_sop" },
    messages: [
      {
        role: "user",
        content: `You are an operations consultant writing a clear, professional Standard Operating Procedure (SOP) for a small business.

Business name: ${params.businessName}
Industry: ${params.industry ?? "unspecified"}

The business owner described the process as follows:
"""
${params.processDescription}
"""

Write a complete SOP for this process: a concise title, the right category (e.g. Operations, Customer Service, HR, Safety, Finance), a one-paragraph purpose, scope, a list of role responsibilities, tools/systems needed, numbered step-by-step instructions (each with a short title and detailed instructions), and any relevant safety or compliance notes. If no safety notes apply, say "No special safety considerations." Be specific and practical, tailored to a small business, not generic.`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured SOP");
  }

  return toolUse.input as GeneratedSop;
}
