import type { Deal, PriceRise, Technology } from "../types";

/** The monthly price that currently applies, given published price rises. */
export function currentMonthlyPrice(deal: Deal, atDate: Date = new Date()): number {
  const passed = deal.price_rises
    .filter((r) => new Date(r.from).getTime() <= atDate.getTime())
    .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
  return passed[0]?.monthly_price ?? deal.monthly_price;
}

/** The next scheduled price rise after the given date, if any. */
export function nextPriceRise(deal: Deal, atDate: Date = new Date()): PriceRise | null {
  const upcoming = deal.price_rises
    .filter((r) => new Date(r.from).getTime() > atDate.getTime())
    .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  return upcoming[0] ?? null;
}

/** Estimated cost over the full contract term, applying published price rises as they land. */
export function contractCost(deal: Deal, atDate: Date = new Date()): number {
  let total = deal.setup_fee ?? 0;
  for (let m = 0; m < deal.contract_months; m++) {
    const month = new Date(atDate.getFullYear(), atDate.getMonth() + m, 1);
    total += currentMonthlyPrice(deal, month);
  }
  return Math.round(total * 100) / 100;
}

/** Estimated cost over the first 12 months, or the full contract if shorter. */
export function firstYearCost(deal: Deal, atDate: Date = new Date()): number {
  const months = Math.min(12, deal.contract_months);
  let total = deal.setup_fee ?? 0;
  for (let m = 0; m < months; m++) {
    const month = new Date(atDate.getFullYear(), atDate.getMonth() + m, 1);
    total += currentMonthlyPrice(deal, month);
  }
  return Math.round(total * 100) / 100;
}

export function daysUntil(dateStr: string, atDate: Date = new Date()): number {
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - atDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function technologyLabel(tech: Technology): string {
  switch (tech) {
    case "full_fibre":
      return "Full fibre";
    case "part_fibre":
      return "Part fibre (FTTC)";
    case "cable":
      return "Cable";
  }
}

export function formatSpeed(mbps: number | null, note?: string): string {
  if (mbps == null) return note ? "See details" : "—";
  return `${mbps}Mb`;
}

export function formatSetupFee(fee: number | null): string {
  if (fee === 0) return "Free";
  if (fee == null) return "Varies";
  return `£${fee.toFixed(2)}`;
}

export function formatContract(months: number): string {
  return months === 1 ? "Rolling monthly" : `${months} months`;
}
