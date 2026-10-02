import type { Deal, RecommendedDeal, RecommendReason } from "../types";
import { currentMonthlyPrice } from "./price";

function greatForText(speedMbps: number | null): string {
  if (speedMbps == null) return "Speed varies by address — check the details for this deal.";
  if (speedMbps >= 500) {
    return "Great for a full household streaming in 4K, gaming and working from home at the same time.";
  }
  if (speedMbps >= 140) {
    return "Great for a few people streaming, gaming or on video calls at the same time.";
  }
  if (speedMbps >= 30) {
    return "Good for everyday browsing, HD streaming and video calls.";
  }
  return "Covers the basics — browsing, email and video calls — where faster lines aren't available yet.";
}

const REASON_LABELS: Record<RecommendReason, string> = {
  "best-value": "BEST VALUE FOR YOU",
  fastest: "FASTEST AT YOUR ADDRESS",
  flexible: "MOST FLEXIBLE CONTRACT",
};

function reasonText(reason: RecommendReason, deal: Deal, poolSize: number): string {
  switch (reason) {
    case "best-value":
      return `The best speed for the price among the ${poolSize} deal${poolSize === 1 ? "" : "s"} available at your address.`;
    case "fastest":
      return "The fastest connection available at your address today.";
    case "flexible":
      return deal.contract_months === 1
        ? "Rolling monthly — no fixed-term contract at all."
        : `Just a ${deal.contract_months}-month commitment — one of the shortest contracts available here.`;
  }
}

function tag(deal: Deal, reason: RecommendReason, poolSize: number): RecommendedDeal {
  return {
    ...deal,
    reasonTag: reason,
    reasonLabel: REASON_LABELS[reason],
    reasonText: reasonText(reason, deal, poolSize),
    greatFor: greatForText(deal.download_mbps),
  };
}

/**
 * Picks up to 3 distinct plans from the deals actually available at an address
 * and tags each with a statable, non-fabricated reason (speed-for-price, raw
 * speed, or contract flexibility) rather than a black-box "best match".
 */
export function getRecommendations(availableDeals: Deal[]): RecommendedDeal[] {
  const byPlan = new Map<string, Deal>();
  for (const deal of availableDeals) {
    const key = `${deal.provider}|${deal.name}`;
    const existing = byPlan.get(key);
    if (!existing || currentMonthlyPrice(deal) < currentMonthlyPrice(existing)) byPlan.set(key, deal);
  }
  const pool = [...byPlan.values()];
  if (pool.length === 0) return [];

  const used = new Set<string>();
  function pick(sorted: Deal[]): Deal | undefined {
    const found = sorted.find((d) => !used.has(d.id));
    if (found) used.add(found.id);
    return found;
  }

  const valueScore = (d: Deal) => (d.download_mbps ? d.download_mbps / currentMonthlyPrice(d) : 0);

  const byValue = [...pool].sort((a, b) => valueScore(b) - valueScore(a));
  const byFastest = [...pool].sort(
    (a, b) => (b.download_mbps ?? 0) - (a.download_mbps ?? 0) || currentMonthlyPrice(a) - currentMonthlyPrice(b)
  );
  const byFlexible = [...pool].sort(
    (a, b) => a.contract_months - b.contract_months || currentMonthlyPrice(a) - currentMonthlyPrice(b)
  );

  const results: RecommendedDeal[] = [];
  const bestValue = pick(byValue);
  if (bestValue) results.push(tag(bestValue, "best-value", pool.length));
  const fastest = pick(byFastest);
  if (fastest) results.push(tag(fastest, "fastest", pool.length));
  const flexible = pick(byFlexible);
  if (flexible) results.push(tag(flexible, "flexible", pool.length));

  return results;
}
