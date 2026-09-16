import { DEALS } from "../data/deals";
import type { Deal, ProviderSlug } from "../types";
import { normalizePostcode } from "./address";

export type CoverageTier = "full-fibre-city" | "fibre-suburb" | "cable-town" | "rural";

export interface Coverage {
  tier: CoverageTier;
  label: string;
  areaType: "Urban" | "Suburban" | "Town" | "Rural";
  hasCable: boolean;
  hasGigCable: boolean;
  hasFullFibre: boolean;
  maxSpeedMbps: number;
}

const COVERAGE_PROFILES: Record<CoverageTier, Coverage> = {
  "full-fibre-city": {
    tier: "full-fibre-city",
    label: "Full fibre and cable network available",
    areaType: "Urban",
    hasCable: true,
    hasGigCable: true,
    hasFullFibre: true,
    maxSpeedMbps: 1130,
  },
  "fibre-suburb": {
    tier: "fibre-suburb",
    label: "Full fibre available, no cable network here",
    areaType: "Suburban",
    hasCable: false,
    hasGigCable: false,
    hasFullFibre: true,
    maxSpeedMbps: 900,
  },
  "cable-town": {
    tier: "cable-town",
    label: "Cable network available, full fibre not yet rolled out",
    areaType: "Town",
    hasCable: true,
    hasGigCable: false,
    hasFullFibre: false,
    maxSpeedMbps: 362,
  },
  rural: {
    tier: "rural",
    label: "Standard fibre-to-the-cabinet coverage only",
    areaType: "Rural",
    hasCable: false,
    hasGigCable: false,
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
 *  the full postcode. */
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
  if (deal.speedMbps > coverage.maxSpeedMbps) return false;
  switch (deal.requiresFootprint) {
    case "cable-gig":
      return coverage.hasGigCable;
    case "cable":
      return coverage.hasCable;
    case "full-fibre":
      return coverage.hasFullFibre;
    default:
      return true;
  }
}

export function availableDealsFor(deals: Deal[], postcode: string): Deal[] {
  const coverage = getCoverage(postcode);
  return deals.filter((d) => isDealAvailable(d, coverage));
}

export function availableProvidersFor(postcode: string): ProviderSlug[] {
  const coverage = getCoverage(postcode);
  const slugs = new Set<ProviderSlug>();
  for (const deal of DEALS) {
    if (isDealAvailable(deal, coverage)) slugs.add(deal.provider);
  }
  return [...slugs];
}
