# Aptap Broadband Marketplace

An interactive broadband marketplace built with React, TypeScript, Tailwind CSS and React Router,
using real, provider-published deal data.

## Flow

1. **Home** — enter a postcode, pick an address from the results, or jump straight into a provider's deals from the "Top dealers" grid.
2. **Deals** — filter by provider, see the top 3 recommended deals (best value / fastest / most flexible, each with a stated reason) plus a sortable list of other deals (All / Cheapest / Fastest / Best for Streaming). Select up to 3 deals to compare.
3. **Deal details** — a dedicated page per deal: full pricing transparency (including scheduled future price rises), an honest exit-fee disclosure, and a link back to the provider's own page for the offer.
4. **Compare** — a side-by-side table that highlights the best value per row (price, speed, guaranteed minimum speed, post-contract price), using current pricing rather than just the headline price.
5. **Switch** — a 3-step wizard (current setup → contact & install → review & confirm) ending in a confirmation screen with a reference number.

## Data

Deal data comes from [`public/deals.json`](public/deals.json) — a feed of real, provider-published
broadband deals (BT, Sky, Virgin Media, Vodafone, Plusnet, Hyperoptic) fetched client-side at runtime
by `src/hooks/useDeals.ts`. The feed's own `scope`, `generated_at` and `providers_missing` fields
describe exactly what it covers and what it doesn't (TalkTalk and Community Fibre aren't included).

To refresh the data, replace `public/deals.json` with an updated export in the same shape and
redeploy — no code changes needed.

Real-world broadband availability varies by address (cable footprint, full-fibre rollout, FTTC-only
areas), but the feed itself isn't address-aware. `src/lib/availability.ts` simulates that variation
deterministically from the postcode, so different postcodes genuinely see different available
providers and deals — this part is a simulation layered on top of real deal data, not a claim about
any specific address's real coverage.

Application state (selected address, filters, compare list, in-progress switch form) lives in
`src/store/AppState.tsx` and is persisted to `sessionStorage` so it survives a page refresh.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Deployment

Pushing to `main` (or running the workflow manually) builds the app and deploys it to GitHub Pages
via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The app uses a relative Vite
`base` and hash-based routing (`HashRouter`), so it works correctly when served from a GitHub Pages
project subpath without any extra server configuration.
