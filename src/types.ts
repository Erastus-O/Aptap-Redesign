// Provider names are used exactly as published in the deals feed (deals.json),
// so they double as both the lookup key and the display name.
export type ProviderSlug = "BT" | "Sky" | "Virgin Media" | "Vodafone" | "Plusnet" | "Hyperoptic";

export interface Provider {
  slug: ProviderSlug;
  name: string;
  textColor: string;
  bgColor: string;
}

export type Technology = "full_fibre" | "part_fibre" | "cable";

export interface PriceRise {
  from: string; // ISO date
  monthly_price: number;
}

/** Shape of a single deal exactly as published in /public/deals.json. */
export interface Deal {
  id: string;
  provider: ProviderSlug;
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
}

export interface DealsFeed {
  schema_version: number;
  generated_at: string;
  currency: string;
  scope: string;
  providers_checked: string[];
  providers_missing: { provider: string; reason: string }[];
  deals: Deal[];
}

export type RecommendReason = "best-value" | "fastest" | "flexible";

export interface RecommendedDeal extends Deal {
  reasonTag: RecommendReason;
  reasonLabel: string;
  reasonText: string;
  greatFor: string;
}

export interface SwitchFormData {
  fullName: string;
  currentProvider: ProviderSlug | "other" | "not_sure" | "";
  contractEndMonth: string;
  contractEndYear: string;
  email: string;
  phone: string;
  installAddressConfirmed: boolean;
  preferredInstallDate: string;
  preferredInstallSlot: string;
}
