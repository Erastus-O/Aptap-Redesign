import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProviderSlug, SwitchFormData } from "../types";

const STORAGE_KEY = "aptap-broadband-state-v1";

export interface AppStateShape {
  postcode: string;
  addresses: string[];
  selectedAddress: string | null;
  selectedProviders: ProviderSlug[];
  compareIds: string[];
  chosenDealId: string | null;
  switchStep: number;
  switchForm: SwitchFormData;
}

const emptySwitchForm: SwitchFormData = {
  fullName: "",
  currentProvider: "",
  contractEndMonth: "",
  contractEndYear: "",
  email: "",
  phone: "",
  installAddressConfirmed: false,
  preferredInstallDate: "",
  preferredInstallSlot: "",
};

const defaultState: AppStateShape = {
  postcode: "",
  addresses: [],
  selectedAddress: null,
  selectedProviders: ["virgin", "bt", "plusnet", "sky", "ee"],
  compareIds: [],
  chosenDealId: null,
  switchStep: 1,
  switchForm: emptySwitchForm,
};

function loadInitial(): AppStateShape {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed, switchForm: { ...emptySwitchForm, ...parsed.switchForm } };
  } catch {
    return defaultState;
  }
}

interface AppStateContextValue {
  state: AppStateShape;
  setPostcodeSearch: (postcode: string, addresses: string[]) => void;
  selectAddress: (address: string) => void;
  toggleProvider: (slug: ProviderSlug) => void;
  clearProviders: () => void;
  selectAllProviders: () => void;
  setOnlyProvider: (slug: ProviderSlug) => void;
  toggleCompare: (dealId: string) => void;
  clearCompare: () => void;
  chooseDeal: (dealId: string) => void;
  setSwitchStep: (step: number) => void;
  updateSwitchForm: (patch: Partial<SwitchFormData>) => void;
  resetSwitchFlow: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppStateShape>(loadInitial);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [state]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setPostcodeSearch: (postcode, addresses) =>
        setState((s) => ({ ...s, postcode, addresses, selectedAddress: null })),
      selectAddress: (address) => setState((s) => ({ ...s, selectedAddress: address })),
      toggleProvider: (slug) =>
        setState((s) => ({
          ...s,
          selectedProviders: s.selectedProviders.includes(slug)
            ? s.selectedProviders.filter((p) => p !== slug)
            : [...s.selectedProviders, slug],
        })),
      clearProviders: () => setState((s) => ({ ...s, selectedProviders: [] })),
      selectAllProviders: () =>
        setState((s) => ({ ...s, selectedProviders: ["virgin", "bt", "plusnet", "sky", "ee"] })),
      setOnlyProvider: (slug) => setState((s) => ({ ...s, selectedProviders: [slug] })),
      toggleCompare: (dealId) =>
        setState((s) => {
          if (s.compareIds.includes(dealId)) {
            return { ...s, compareIds: s.compareIds.filter((id) => id !== dealId) };
          }
          if (s.compareIds.length >= 3) return s;
          return { ...s, compareIds: [...s.compareIds, dealId] };
        }),
      clearCompare: () => setState((s) => ({ ...s, compareIds: [] })),
      chooseDeal: (dealId) =>
        setState((s) => ({ ...s, chosenDealId: dealId, switchStep: 1, switchForm: emptySwitchForm })),
      setSwitchStep: (step) => setState((s) => ({ ...s, switchStep: step })),
      updateSwitchForm: (patch) =>
        setState((s) => ({ ...s, switchForm: { ...s.switchForm, ...patch } })),
      resetSwitchFlow: () =>
        setState((s) => ({ ...s, chosenDealId: null, switchStep: 1, switchForm: emptySwitchForm })),
    }),
    [state]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
