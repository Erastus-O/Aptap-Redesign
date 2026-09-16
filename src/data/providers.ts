import type { Provider, ProviderSlug } from "../types";

export const PROVIDERS: Record<ProviderSlug, Provider> = {
  virgin: { slug: "virgin", name: "Virgin Media", color: "#ffffff", textColor: "#e2001a" },
  bt: { slug: "bt", name: "BT Broadband", color: "#6534ac", textColor: "#ffffff" },
  plusnet: { slug: "plusnet", name: "Plusnet", color: "#ffffff", textColor: "#ce0058" },
  sky: { slug: "sky", name: "Sky", color: "#ffffff", textColor: "#0072c9" },
  ee: { slug: "ee", name: "EE", color: "#00b1a9", textColor: "#f5d800" },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);
