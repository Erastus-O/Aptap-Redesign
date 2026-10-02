import { useEffect, useMemo, useState } from "react";
import type { Deal, DealsFeed } from "../types";

// Served from /public/deals.json — see that file's own "scope" field for
// what it covers and its generated_at for freshness. Resolved against
// BASE_URL so this also works when the app is deployed under a subpath
// (e.g. a GitHub Pages project site).
const DEALS_URL = `${import.meta.env.BASE_URL}deals.json`;

export interface UseDealsResult {
  deals: Deal[];
  providersChecked: string[];
  providersMissing: { provider: string; reason: string }[];
  scope: string;
  updatedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useDeals(): UseDealsResult {
  const [data, setData] = useState<DealsFeed | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(DEALS_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Couldn't load deals (HTTP ${r.status})`);
        return r.json() as Promise<DealsFeed>;
      })
      .then((json) => {
        if (alive) setData(json);
      })
      .catch((e: Error) => {
        if (alive) setError(e.message || "Couldn't load deals");
      });
    return () => {
      alive = false;
    };
  }, []);

  const deals = useMemo(() => data?.deals ?? [], [data]);

  return {
    deals,
    providersChecked: data?.providers_checked ?? [],
    providersMissing: data?.providers_missing ?? [],
    scope: data?.scope ?? "",
    updatedAt: data?.generated_at ?? null,
    loading: !data && !error,
    error,
  };
}
