import type { Deal } from "../types";

export function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function firstYearCost(deal: Deal): number {
  let total = 0;
  for (let month = 1; month <= 12; month++) {
    const price =
      deal.priceRise && month >= deal.priceRise.fromMonth ? deal.priceRise.amount : deal.priceMonthly;
    total += price;
  }
  return Math.round(total);
}

export function incentiveLabel(deal: Deal): string {
  if (deal.incentive.type === "bill_credit") return `£${deal.incentive.amount} bill credit`;
  return `£${deal.incentive.amount} reward card`;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function currentYearOptions(span = 3): string[] {
  const year = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => String(year + i));
}
