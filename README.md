# SOPilot — AI-Powered SOPs for Small Businesses

A SaaS product that lets small business owners describe a process in plain
English and get back a structured, professional Standard Operating
Procedure, written by Claude. Built to be sold as a $150–$200/month
subscription.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (NextAuth v5) with email/password credentials
- Stripe for subscription billing (Starter $150/mo, Pro $200/mo)
- Anthropic (Claude) API for AI SOP generation
- jsPDF for client-side PDF export

## Features

- Marketing site with pricing, features, and signup flow
- Email/password auth, one business per account, multi-seat ready
- AI SOP generation (title, purpose, scope, responsibilities, tools, numbered
  steps, safety notes) via the Claude API
- Editable SOP library, scoped per business
- Shareable read-only public links (`/s/[token]`)
- Client-side PDF export
- Stripe Checkout + Customer Portal + webhook-driven subscription sync
- Plan-based SOP limits enforced server-side

## Local development

1. Install dependencies: `npm install`
2. Make sure PostgreSQL is running and `DATABASE_URL` in `.env` points to it.
3. Run migrations: `npx prisma migrate dev`
4. Fill in `.env` (see below).
5. `npm run dev` and open http://localhost:3000

### Environment variables (`.env`)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Random secret for signing sessions (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `https://app.yourdomain.com` in production) |
| `ANTHROPIC_API_KEY` | Claude API key, used to generate SOPs |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from your Stripe webhook endpoint |
| `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` | Stripe Price IDs for the $150 and $200 monthly plans |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` / `NEXT_PUBLIC_STRIPE_PRICE_PRO` | Same price IDs, exposed client-side if needed |

Without `ANTHROPIC_API_KEY` or the Stripe keys, the app still runs — AI
generation and checkout will return a clear error instead of crashing.

## Setting up Stripe

1. Create two recurring monthly Prices in the Stripe Dashboard: $150 (Starter)
   and $200 (Pro). Copy their Price IDs into `STRIPE_PRICE_STARTER` /
   `STRIPE_PRICE_PRO`.
2. Add a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   listening for `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, and `customer.subscription.deleted`. Copy
   the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Deploying

1. Provision a Postgres database (Neon, Supabase, Railway, Vercel Postgres,
   etc.) and set `DATABASE_URL`.
2. Run `npx prisma migrate deploy` against that database.
3. Deploy to Vercel (or any Node host) and set all environment variables above.
4. Point your Stripe webhook at the production URL.

## Project structure

- `src/app` — routes (marketing pages, auth pages, dashboard, API routes)
- `src/components` — shared UI and client components
- `src/lib` — Prisma client, Auth.js config, Stripe client, Anthropic client,
  plan definitions, access/limit checks
- `prisma/schema.prisma` — data model
