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
