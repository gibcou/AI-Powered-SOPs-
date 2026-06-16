import type { Metadata } from "next";
import { DemoApp } from "@/components/demo-app";

export const metadata: Metadata = {
  title: "Live Demo — SOPilot",
  description: "Try SOPilot's AI-powered SOP generation right now, no signup required.",
};

export default function DemoPage() {
  return <DemoApp />;
}
