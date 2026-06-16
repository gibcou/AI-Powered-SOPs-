import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSop } from "@/lib/anthropic";
import { mockGenerateSop } from "@/lib/mock-sop";

const schema = z.object({
  processDescription: z.string().min(10).max(2000),
});

const RATE_LIMIT = 8;
const WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You've tried the demo a few times already — sign up for a free trial to keep going." },
      { status: 429 },
    );
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const sop = process.env.ANTHROPIC_API_KEY
      ? await generateSop({
          businessName: "Demo Business",
          industry: null,
          processDescription: parsed.data.processDescription,
        })
      : mockGenerateSop(parsed.data.processDescription);

    return NextResponse.json({ sop });
  } catch (error) {
    console.error("Demo SOP generation failed", error);
    return NextResponse.json({ error: "Failed to generate SOP. Please try again." }, { status: 500 });
  }
}
