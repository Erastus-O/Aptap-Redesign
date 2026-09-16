export type ProviderSlug = "virgin" | "bt" | "plusnet" | "sky" | "ee";

export interface Provider {
  slug: ProviderSlug;
  name: string;
  color: string;
  textColor: string;
}

export type Incentive =
  | { type: "bill_credit"; amount: number }
  | { type: "reward_card"; amount: number };

export type Footprint = "cable-gig" | "cable" | "full-fibre" | "wide";

export interface Deal {
  id: string;
  provider: ProviderSlug;
  planName: string;
  connection: "Cable" | "Fibre" | "ADSL";
  description: string;
  speedMbps: number;
  priceMonthly: number;
  contractMonths: number;
  setupFee: number;
  incentive: Incentive;
  priceRise?: { amount: number; fromMonth: number };
  priceFixedForTerm?: boolean;
  rating: number;
  reviews: number;
  /** Which network footprint a customer's address needs for this deal to be orderable. */
  requiresFootprint: Footprint;
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
