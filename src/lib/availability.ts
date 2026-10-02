import type { Deal, ProviderSlug } from "../types";
import { normalizePostcode } from "./address";

export type CoverageTier = "full-fibre-city" | "fibre-suburb" | "cable-town" | "rural";

export interface Coverage {
  tier: CoverageTier;
  label: string;
  areaType: "Urban" | "Suburban" | "Town" | "Rural";
  hasCable: boolean;
  hasFullFibre: boolean;
  maxSpeedMbps: number;
}

const COVERAGE_PROFILES: Record<CoverageTier, Coverage> = {
  "full-fibre-city": {
    tier: "full-fibre-city",
    label: "Full fibre and cable network available",
    areaType: "Urban",
    hasCable: true,
    hasFullFibre: true,
    maxSpeedMbps: 2500,
  },
  "fibre-suburb": {
    tier: "fibre-suburb",
    label: "Full fibre available, no cable network here",
    areaType: "Suburban",
    hasCable: false,
    hasFullFibre: true,
    maxSpeedMbps: 900,
  },
  "cable-town": {
    tier: "cable-town",
    label: "Cable network available, full fibre not yet rolled out",
    areaType: "Town",
    hasCable: true,
    hasFullFibre: false,
    maxSpeedMbps: 362,
  },
  rural: {
    tier: "rural",
    label: "Standard fibre-to-the-cabinet coverage only",
    areaType: "Rural",
    hasCable: false,
    hasFullFibre: false,
    maxSpeedMbps: 76,
  },
};

const TIERS: CoverageTier[] = ["full-fibre-city", "fibre-suburb", "cable-town", "rural"];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** The outward code (e.g. "PE7" from "PE7 8PD") is what actually determines
 *  real-world broadband coverage, so the tier is derived from it rather than
 *  the full postcode. This is a simulated coverage model — the feed itself
 *  carries no per-address availability data — used only to make the demo
 *  reflect that real coverage (cable footprint, full-fibre rollout, FTTC-only
 *  areas) genuinely varies by address. */
function outwardCode(postcode: string): string {
  const clean = normalizePostcode(postcode).replace(/\s+/g, "");
  return clean.slice(0, Math.max(1, clean.length - 3));
}

export function getCoverage(postcode: string): Coverage {
  const seed = hashString(`${outwardCode(postcode)}|coverage`);
  const tier = TIERS[seed % TIERS.length];
  return COVERAGE_PROFILES[tier];
}

export function isDealAvailable(deal: Deal, coverage: Coverage): boolean {
  if (deal.download_mbps != null && deal.download_mbps > coverage.maxSpeedMbps) return false;
  switch (deal.technology) {
    case "cable":
      return coverage.hasCable;
    case "full_fibre":
      return coverage.hasFullFibre;
    case "part_fibre":
      return true;
  }
}

export function availableDealsFor(deals: Deal[], postcode: string): Deal[] {
  const coverage = getCoverage(postcode);
  return deals.filter((d) => isDealAvailable(d, coverage));
}

export function availableProvidersFor(deals: Deal[], postcode: string): ProviderSlug[] {
  const coverage = getCoverage(postcode);
  const slugs = new Set<ProviderSlug>();
  for (const deal of deals) {
    if (isDealAvailable(deal, coverage)) slugs.add(deal.provider);
  }
  return [...slugs];
}
