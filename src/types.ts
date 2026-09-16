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

export interface Deal {
  id: string;
  provider: ProviderSlug;
  planName: string;
  connection: "Cable" | "Fibre" | "Full Fibre";
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
  bestFit?: boolean;
}

export interface SwitchFormData {
  fullName: string;
  currentProvider: ProviderSlug | "other" | "";
  contractEndMonth: string;
  contractEndYear: string;
  email: string;
  phone: string;
  installAddressConfirmed: boolean;
  preferredInstallDate: string;
  preferredInstallSlot: string;
}
