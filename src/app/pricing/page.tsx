import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PricingCards } from "@/components/pricing-cards";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-center text-4xl font-bold text-slate-900">Plans for every team</h1>
          <p className="mt-3 text-center text-slate-600">
            Flat monthly pricing, billed per business. Upgrade or downgrade anytime.
          </p>
          <div className="mt-12">
            <PricingCards />
          </div>
          <div className="mx-auto mt-16 max-w-2xl text-center text-sm text-slate-500">
            <p>
              Questions about a custom plan for a larger team or multiple locations? Email us at{" "}
              <a className="font-medium text-indigo-600" href="mailto:hello@sopilot.app">
                hello@sopilot.app
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
