export type PlanKey = "STARTER" | "PRO";

export const PLANS: Record<
  PlanKey,
  {
    name: string;
    price: number;
    priceId: string | undefined;
    sopLimit: number;
    seats: number;
    features: string[];
  }
> = {
  STARTER: {
    name: "Starter",
    price: 150,
    priceId: process.env.STRIPE_PRICE_STARTER,
    sopLimit: 25,
    seats: 3,
    features: [
      "Up to 25 AI-generated SOPs",
      "3 team member seats",
      "PDF export",
      "Shareable read-only links",
      "Email support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 200,
    priceId: process.env.STRIPE_PRICE_PRO,
    sopLimit: 100,
    seats: 10,
    features: [
      "Up to 100 AI-generated SOPs",
      "10 team member seats",
      "PDF export",
      "Shareable read-only links",
      "Priority support",
      "Custom SOP categories & branding",
    ],
  },
};
