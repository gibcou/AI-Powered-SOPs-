import Link from "next/link";
import {
  Sparkles,
  FileText,
  Share2,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PricingCards } from "@/components/pricing-cards";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-written in minutes",
    description:
      "Describe a process in plain English and Claude writes a complete, professional SOP — purpose, scope, steps, tools, and safety notes included.",
  },
  {
    icon: FileText,
    title: "A real SOP library",
    description:
      "Every procedure lives in one searchable library, organized by category, so your whole team always has the latest version.",
  },
  {
    icon: Share2,
    title: "Share with anyone",
    description:
      "Export to PDF or send a read-only link to contractors and new hires — no account required on their end.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Invite your managers and staff, assign ownership, and keep every role's responsibilities crystal clear.",
  },
  {
    icon: ShieldCheck,
    title: "Consistency you can audit",
    description:
      "Standardized procedures reduce mistakes, speed up onboarding, and make it easy to prove you follow your own process.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Tell us about a process",
    description: "Write a few sentences about how a task gets done today — even messy, informal notes work.",
  },
  {
    step: "2",
    title: "AI drafts the SOP",
    description: "In seconds you get a structured, professional procedure ready to review and tweak.",
  },
  {
    step: "3",
    title: "Publish & share",
    description: "Save it to your library, export to PDF, or share a link with your team and new hires.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" /> Powered by Claude AI
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Turn how your business runs into
              <span className="text-indigo-600"> documented SOPs</span> in minutes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              SOPilot uses AI to write, organize, and share Standard Operating Procedures for your
              small business — so training, delegation, and consistency stop living only in your
              head.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500"
              >
                Start your free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Try the live demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card to start. Plans from $150/month.
            </p>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Most small businesses run on tribal knowledge
              </h2>
              <p className="mt-4 text-slate-600">
                When the one person who knows how to close the register, onboard a client, or
                handle a return is out sick — or leaves — the process disappears with them.
                Writing it all down properly takes hours nobody has.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">SOPilot writes it down for you</h2>
              <p className="mt-4 text-slate-600">
                Describe how a task happens today in a sentence or two. SOPilot turns it into a
                clear, professional SOP your whole team can follow — ready to train new hires,
                hand off responsibilities, and keep quality consistent as you grow.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900">
              Everything you need to operationalize your business
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                  <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900">Simple, flat pricing</h2>
            <p className="mt-3 text-center text-slate-600">
              One flat monthly price per business. Cancel anytime.
            </p>
            <div className="mt-12">
              <PricingCards />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Stop being the only one who knows how things work
          </h2>
          <p className="mt-4 text-slate-600">
            Get your first SOPs written today — no credit card required to try it.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500"
          >
            Start your free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
