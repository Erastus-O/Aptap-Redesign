/**
 * Deal domain model + formatting rules.
 * Types mirror deals.json (schema_version 1) from the Broadband Deals Feed.
 * These helpers encode the CONTENT RULES of the system (see docs/patterns/pricing-transparency.md):
 *   - never show a headline price without its price-change story
 *   - null means "not published" → render "—" or an honest phrase, never 0
 */

export type Technology = "full_fibre" | "part_fibre" | "cable";

export interface PriceRise { from: string; monthly_price: number }

export interface Deal {
  id: string;
  provider: string;
  name: string;
  technology: Technology;
  download_mbps: number | null;
  download_note?: string;
  upload_mbps: number | null;
  guaranteed_mbps: number | null;
  monthly_price: number;
  contract_months: number;
  setup_fee: number | null;
  setup_note?: string;
  price_rises: PriceRise[];
  price_rise_note?: string;
  out_of_contract_price?: number;
  reward: string | null;
  offer_ends: string | null;
  source_url: string;
  /** Set only when the provider explicitly guarantees no mid-contract rise (interface "Price fixed for the term"). Never infer it. */
  price_fixed?: boolean;
  /** Licensed, current review data only (PRD E2-4). Never estimate. */
  rating?: { score: number; count: number; source: string };
}

export interface DealsFeed {
  schema_version: number;
  generated_at: string;
  currency: "GBP";
  deals: Deal[];
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
const gbpWhole = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

/** £30.99 · £24 (drops .00) */
export function formatGBP(value: number | null | undefined): string {
  if (value == null) return "—";
  return Number.isInteger(value) ? gbpWhole.format(value) : gbp.format(value);
}

/**
 * "500 Mbps" · "1,136 Mbps" · "—". One unit everywhere so speeds scan in a column
 * (the prototype mixed "1130mb" / "1130Mb"; "mb" means millibits).
 */
export function formatSpeed(mbps: number | null | undefined): string {
  if (mbps == null) return "—";
  return `${mbps.toLocaleString("en-GB")} Mbps`;
}

/** "24 months" · "1 month (rolling)" */
export function formatContract(months: number): string {
  if (months <= 1) return "Rolling monthly";
  return `${months} months`;
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export const technologyLabel: Record<Technology, string> = {
  full_fibre: "Full fibre",
  part_fibre: "Part fibre",
  cable: "Cable fibre",
};

export type PriceStoryKind = "rise" | "may-change" | "fixed" | "rolling";
export type Tone = "rise" | "fixed" | "neutral";

export interface PriceStory {
  kind: PriceStoryKind;
  /** Short line shown directly under the price — mandatory, never hidden in a tooltip. */
  summary: string;
  /** Optional detail lines for an expanded view. */
  details: string[];
  /** Short form for the price pill on deal cards, e.g. "£33.99 now · £37.99 from Mar 2027". */
  pill: string;
  tone: Tone;
}

/**
 * The price-change story for a deal. Every price display MUST render `summary` adjacent to the price.
 * Order of precedence: published rises → provider note → out-of-contract price → rolling → unknown.
 */
export function getPriceStory(deal: Deal): PriceStory {
  const details: string[] = [];
  if (deal.out_of_contract_price != null) details.push(`${formatGBP(deal.out_of_contract_price)}/month after the contract ends`);

  if (deal.price_rises.length) {
    const lines = deal.price_rises.map((r) => `${formatGBP(r.monthly_price)}/month from ${formatMonthYear(r.from)}`);
    const first = deal.price_rises[0];
    return {
      kind: "rise", tone: "rise", summary: `Rises to ${lines[0]}`, details: [...lines, ...details],
      pill: `${formatGBP(deal.monthly_price)} now · ${formatGBP(first.monthly_price)} from ${formatMonthYear(first.from)}`,
    };
  }
  if (deal.contract_months <= 1) {
    return { kind: "rolling", tone: "neutral", summary: "No fixed term — leave any month", pill: "Rolling monthly", details: deal.price_rise_note ? [deal.price_rise_note, ...details] : details };
  }
  if (deal.price_fixed) {
    return { kind: "fixed", tone: "fixed", summary: "Price fixed for the term", pill: "Price fixed for the term", details };
  }
  if (deal.price_rise_note) {
    const short = deal.price_rise_note.length <= 44 ? deal.price_rise_note : "Price may change — see details";
    return { kind: "may-change", tone: "neutral", summary: deal.price_rise_note, pill: short, details };
  }
  // No data about changes. Do NOT claim "fixed" — we only know nothing was published.
  return { kind: "may-change", tone: "neutral", summary: "Check price changes with the provider before you switch", pill: "Price changes not published", details };
}

/**
 * Can we state a total over the contract honestly? Only when the provider publishes a dated price schedule.
 * A free-text note ("prices may change", "+£4 every April; prices vary by location") or no information at all
 * means any total would understate the real cost, so we don't show one.
 */
export function totalIsKnown(deal: Deal): boolean {
  return deal.contract_months > 1 && (deal.price_rises.length > 0 || !!deal.price_fixed);
}

/** Total over the minimum term using published rises (+ setup fee when published). Check totalIsKnown() before displaying it. */
export function contractTotal(deal: Deal, asOf: Date = new Date()): { total: number; includesSetup: boolean; known: boolean } {
  let total = deal.setup_fee ?? 0;
  const rises = [...deal.price_rises].sort((a, b) => a.from.localeCompare(b.from));
  for (let m = 0; m < Math.max(1, deal.contract_months); m++) {
    const month = new Date(asOf.getFullYear(), asOf.getMonth() + m, 1);
    const applicable = rises.filter((r) => new Date(r.from) <= month).pop();
    total += applicable ? applicable.monthly_price : deal.monthly_price;
  }
  return { total: Math.round(total * 100) / 100, includesSetup: deal.setup_fee != null, known: totalIsKnown(deal) };
}

/** Estimated cost of the first 12 months (published rises applied). Known only when rises are published or the price is fixed/rolling-free of notes. */
export function firstYearCost(deal: Deal, asOf: Date = new Date()): { total: number; known: boolean } {
  const months = 12;
  let total = 0;
  const rises = [...deal.price_rises].sort((a, b) => a.from.localeCompare(b.from));
  for (let m = 0; m < months; m++) {
    const month = new Date(asOf.getFullYear(), asOf.getMonth() + m, 1);
    const r = rises.filter((x) => new Date(x.from) <= month).pop();
    total += r ? r.monthly_price : deal.monthly_price;
  }
  const known = deal.price_rises.length > 0 || !!deal.price_fixed;
  return { total: Math.round(total * 100) / 100, known };
}

/** "Virgin Media · Cable fibre" — the identity meta line under a deal name. */
export const dealMeta = (deal: Deal) => `${deal.provider} · ${technologyLabel[deal.technology]}`;

export function formatSetup(deal: Deal): string {
  if (deal.setup_fee === 0) return "Free";
  if (deal.setup_fee == null) return deal.setup_note ? "May apply" : "—";
  return formatGBP(deal.setup_fee);
}

/**
 * Plain-language "Great for" guidance by download speed.
 * Content guidance only — validate thresholds with the product team before relying on them for recommendations.
 */
export function speedFit(mbps: number | null): string | null {
  if (mbps == null) return null;
  if (mbps < 50) return "Browsing, email and HD streaming for 1–2 people";
  if (mbps < 150) return "HD streaming and video calls for a small household";
  if (mbps < 500) return "4K streaming, gaming and home working for a busy household";
  return "Lots of people streaming, gaming and downloading at once";
}
