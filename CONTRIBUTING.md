# Contributing to BackHaul

Thanks for your interest in contributing! BackHaul is an open-source
return-load logistics marketplace, and we welcome PRs of all sizes.

## Development setup

```bash
git clone https://github.com/Vansh4600/Truck-return-loader.git
cd Truck-return-loader
npm install
cp .env.example .env.local   # fill in your Supabase project keys
npm run dev
```

See `README.md` for full Supabase setup and migration instructions.

## Workflow

1. Fork the repo and create a feature branch: `git checkout -b feat/short-description`
2. Make focused commits with clear messages (`feat: ...`, `fix: ...`, `docs: ...`, `test: ...`)
3. Run the full check suite before opening a PR:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
4. Open a PR describing the change, why it's needed, and how you tested it.

## Code style

- TypeScript strict mode; avoid `any` unless genuinely unavoidable.
- Validate all external input with Zod (`lib/validation/schemas.ts`).
- Keep business logic (matching, booking state machine, payments,
  notifications) in `lib/`, decoupled from UI and from Supabase specifics
  where possible, so it stays unit-testable.
- Never bypass Row Level Security from application code; add/adjust RLS
  policies in `supabase/migrations/` instead.

## Priority areas for contribution

- Real MapProvider implementations (Google Maps / Mapbox / OpenRouteService)
- Additional matching engine test scenarios
- Truck owner mobile UX polish
- Admin dashboard analytics
- i18n / additional Indian language support
- A future `AIMatchingEngine` implementing the existing `MatchingEngine`
  interface (see `lib/matching/engine.ts`)

## Reporting bugs / requesting features

Please open a GitHub issue with clear reproduction steps (for bugs) or a
clear problem statement (for feature requests).

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). Please
read it before participating.
