# Aptap Broadband Marketplace

An interactive broadband marketplace demo built with React, TypeScript, Tailwind CSS and React Router.

## Flow

1. **Home** — enter a postcode, pick an address from the results, or jump straight into a provider's deals from the "Top dealers" grid.
2. **Deals** — filter by provider, see the top 3 recommended deals plus a sortable list of other deals (All / Cheapest / Fastest / Best for Streaming). Select up to 3 deals to compare.
3. **Compare** — a side-by-side table that highlights the best value per row, using post-promo pricing rather than just the headline price.
4. **Switch** — a 3-step wizard (current setup → contact & install → review & confirm) ending in a confirmation screen with a reference number.

All data is mocked in `src/data`; application state (selected address, filters, compare list, in-progress switch form) lives in `src/store/AppState.tsx` and is persisted to `sessionStorage` so it survives a page refresh.

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
