import bt from "../assets/logos/bt.jpg";
import hyperoptic from "../assets/logos/hyperoptic.png";
import type { Provider, ProviderSlug } from "../types";

export const PROVIDERS: Record<ProviderSlug, Provider> = {
  BT: { slug: "BT", name: "BT", textColor: "#ffffff", bgColor: "#5b1fb4" },
  Sky: { slug: "Sky", name: "Sky", textColor: "#0072c9", bgColor: "#ffffff" },
  "Virgin Media": { slug: "Virgin Media", name: "Virgin Media", textColor: "#e2001a", bgColor: "#ffffff" },
  Vodafone: { slug: "Vodafone", name: "Vodafone", textColor: "#ffffff", bgColor: "#e60000" },
  Plusnet: { slug: "Plusnet", name: "Plusnet", textColor: "#ce0058", bgColor: "#ffffff" },
  Hyperoptic: { slug: "Hyperoptic", name: "Hyperoptic", textColor: "#ffffff", bgColor: "#d2006e" },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

/**
 * Real logo artwork we have on file, for the design system's <Avatar>.
 * Providers not listed here fall back to the design system's own monogram —
 * honest default rather than an invented badge design.
 */
const PROVIDER_LOGOS: Partial<Record<ProviderSlug, { src: string; fill: boolean }>> = {
  BT: { src: bt, fill: true },
  Hyperoptic: { src: hyperoptic, fill: false },
};

export function providerLogo(slug: ProviderSlug): { src?: string; fill?: boolean } {
  return PROVIDER_LOGOS[slug] ?? {};
}
