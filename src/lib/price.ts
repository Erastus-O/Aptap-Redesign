import type { Deal } from "../types";

/**
 * The monthly price that currently applies, given published price rises.
 * Internal sort/recommendation logic only — for display, use the design
 * system's `getPriceStory` / `formatGBP` so every price shows its story.
 */
export function currentMonthlyPrice(deal: Deal, atDate: Date = new Date()): number {
  const passed = deal.price_rises
    .filter((r) => new Date(r.from).getTime() <= atDate.getTime())
    .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
  return passed[0]?.monthly_price ?? deal.monthly_price;
}
