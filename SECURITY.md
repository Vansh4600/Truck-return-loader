# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities privately by opening a GitHub
Security Advisory on this repository (Security tab → "Report a
vulnerability"), rather than a public issue. We will respond as soon as
possible.

## Security Practices in This Project

- **Row Level Security (RLS)** is enabled on every Supabase table. All
  cross-table access is checked at the database layer, not just in the
  frontend.
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is server-only and is
  never bundled into client code. See `lib/supabase/server.ts`.
- **All external input is validated with Zod** (`lib/validation/schemas.ts`)
  on the server before it reaches the database.
- **Booking state transitions** are enforced by a strict state machine
  (`lib/booking/state-machine.ts`) with actor-role authorization checks —
  clients cannot set an arbitrary booking status.
- **No real payment processing** — the mock/demo `PaymentProvider` never
  contacts a real payment gateway, eliminating a whole class of financial
  risk in the MVP.
- **Messaging** is only permitted between the two parties of an existing
  booking (enforced via RLS), and private contact details are not exposed
  until the appropriate booking stage.
- **Generic error messages** are returned to clients (e.g. login failures)
  to avoid leaking account existence or internal details.

## Environment Variables

Never commit `.env.local` or any file containing real secrets. `.env.example`
documents all required variables with placeholder values only.
