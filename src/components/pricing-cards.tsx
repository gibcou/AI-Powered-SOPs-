import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";

export function PricingCards({ ctaHref = "/signup" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS.STARTER][]).map(
        ([key, plan]) => {
          const highlighted = key === "PRO";
          return (
            <div
              key={key}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                highlighted
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xl"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              {highlighted && (
                <span className="absolute -top-3 right-8 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className={highlighted ? "text-indigo-200" : "text-slate-500"}>/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        highlighted ? "text-amber-300" : "text-indigo-600"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                  highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                Get started with {plan.name}
              </Link>
            </div>
          );
        },
      )}
    </div>
  );
}
