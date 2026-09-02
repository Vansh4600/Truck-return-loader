# BackHaul

> **Turn empty miles into earning miles.**

BackHaul is an open-source **return-load logistics marketplace**. Trucks
often deliver goods and return empty — BackHaul helps truck/fleet owners
discover suitable return loads going in the same or similar direction, and
helps shippers find available trucks, using a **route-aware matching
engine** (not naive pickup==destination matching).

> The name "BackHaul" is a temporary working name and can be changed easily
> (see `app/layout.tsx` metadata and `components/landing/*`).

## Problem

A huge share of truck trips in India (and globally) return empty after
delivery — a pure cost with no revenue. Shippers separately struggle to find
available trucks going their way. Both sides lose.

## Solution

A marketplace with a deterministic, explainable **route-aware matching
engine** that scores every open load against every available truck across
7 weighted dimensions (route overlap, capacity, schedule, vehicle type,
detour, price, reliability) and returns a 0–100 score with human-readable
reasons — so recommendations are transparent, not a black box.

## Features implemented in this MVP

- **Route-aware matching engine** (`lib/matching/engine.ts`) — weighted,
  explainable, rule-based, with 14 passing unit tests covering exact
  reverse routes, partial/continuation routes, wrong-direction rejection,
  capacity/vehicle/time disqualification, detour and price scoring.
- **Booking lifecycle state machine** (`lib/booking/state-machine.ts`) with
  strict transition + actor-authorization rules and 14 passing tests.
- **MapProvider abstraction** (`lib/maps/`) with a fully working mock
  provider covering demo Indian corridors (Delhi ↔ Kanpur ↔ Lucknow ↔ Agra
  ↔ Jaipur, Mumbai ↔ Pune) — no API key required to run the project.
- **PaymentProvider abstraction** (`lib/payments/`) with a clearly-labelled
  Demo/Mock implementation. No real payment processing.
- **Notification abstraction** (`lib/notifications/`) with an in-app
  channel; designed for email/SMS/WhatsApp/push to be added later.
- **Full relational database schema** with Row Level Security
  (`supabase/migrations/`), realistic seed data (`supabase/seed.sql`).
- **Supabase Auth** wiring (browser/server/middleware clients, sign up /
  log in server actions, role selection).
- **Zod validation** for all core inputs (`lib/validation/schemas.ts`).
- **Landing page** with hero, how-it-works, role sections, smart matching
  explainer, trust & verification, route visualization, stats, FAQ, and
  open-source sections.
- **shadcn-style UI kit** (`components/ui/`) and match-score visualization
  components (`components/matching/match-score.tsx`).

## Architecture

```
app/                     Next.js App Router pages
  (auth)/login, signup    Auth pages (Supabase Auth)
  page.tsx                 Landing page
components/
  ui/                      Base UI primitives (Button, Card, Badge, ...)
  landing/                 Landing page sections
  matching/                Match score / reasons visualization
lib/
  matching/                RuleBasedMatchingEngine (weighted, explainable)
  booking/                 Booking state machine
  maps/                    MapProvider abstraction + mock provider
  payments/                PaymentProvider abstraction + mock provider
  notifications/           Notification abstraction + in-app channel
  supabase/                Browser / server / middleware Supabase clients
  validation/              Zod schemas
  demo/                    Static fallback dataset
supabase/
  migrations/              SQL schema, RLS policies, views/triggers
  seed.sql                 Demo seed data (5 owners, 5 shippers, 1 admin, 11 trucks, 20 loads)
types/database.ts         Domain types mirroring the DB schema
tests/                    Vitest unit tests (matching engine, booking state machine)
```

## Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React, Tailwind CSS, shadcn-style UI
- **Backend**: Next.js server actions / API routes, clean service boundaries in `lib/`
- **Database**: Supabase PostgreSQL (Auth, RLS, Storage-ready)
- **Validation**: Zod
- **Testing**: Vitest
- **Deployment target**: Vercel (frontend/backend) + Supabase (data)

## Local setup

```bash
git clone https://github.com/Vansh4600/Truck-return-loader.git
cd Truck-return-loader
npm install
cp .env.example .env.local   # see "Supabase setup" below
npm run dev
```

The app runs fully without Supabase configured for browsing the landing
page (uses a static demo dataset fallback), but auth/dashboards require a
real Supabase project.

## Supabase setup

1. Create a project at https://supabase.com.
2. Copy `Project URL` and `anon public` key into `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Copy the
   `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (server-only, never
   exposed to the client).
3. Run the migrations against your project (via the Supabase SQL editor or
   the Supabase CLI):
   ```bash
   # Using Supabase CLI (recommended)
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   Or paste the contents of `supabase/migrations/0001_initial_schema.sql`,
   `0002_row_level_security.sql`, and `0003_views_and_triggers.sql` into the
   SQL editor, in that order.
4. **Local development only** — seed demo data:
   ```bash
   supabase db execute -f supabase/seed.sql
   ```
   ⚠️ `seed.sql` inserts directly into `auth.users` for local dev
   convenience. **Do not run it against a production project.**
5. Demo login (after seeding): `owner1@demo.backhaul.dev` /
   `shipper1@demo.backhaul.dev`, password `Demo@12345`.

## Environment variables

See `.env.example` for the full list and descriptions. Required:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. Maps and payments run in mock mode with no
extra keys needed.

## Development commands

```bash
npm run dev         # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint          # ESLint
npm run typecheck     # TypeScript strict type checking
npm run test          # Vitest unit tests
```

## Testing

`tests/matching-engine.test.ts` and `tests/booking-state-machine.test.ts`
cover the two most important pieces of business logic:

- Exact return route → high match score
- Partial/continuation route → moderate viable score
- Wrong direction (e.g. Delhi↔Kanpur truck vs Mumbai↔Pune load) → rejected
- Capacity, vehicle type, availability disqualification
- Detour and price scoring
- Full booking lifecycle transitions + actor authorization + terminal states

Run with `npm run test`. All 28 tests pass as of this commit.

## Roadmap (not implemented in this MVP, intentionally)

- Real MapProvider (Google Maps / Mapbox / OpenRouteService) behind the
  existing abstraction
- Real payment gateway integration (Razorpay/Stripe) behind
  `PaymentProvider`
- Email/SMS/WhatsApp/push notification channels
- Truck owner & shipper dashboards with live Supabase data, load posting
  flow, booking/trip pages, messaging UI, admin dashboard — scaffolding
  and data layer are in place; UI pages are the next milestone
- `AIMatchingEngine` implementing the existing `MatchingEngine` interface
  for demand forecasting, dynamic pricing, ETA prediction

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). This project follows the
[Code of Conduct](./CODE_OF_CONDUCT.md). See [SECURITY.md](./SECURITY.md)
for the security policy.

## License

MIT — see [LICENSE](./LICENSE).
