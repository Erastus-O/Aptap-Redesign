import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "../components/Accordion";
import Header from "../components/Header";
import DealCard from "../components/DealCard";
import DealRow from "../components/DealRow";
import { DEALS, getDeal } from "../data/deals";
import { PROVIDER_LIST } from "../data/providers";
import { availableDealsFor, availableProvidersFor, getCoverage } from "../lib/availability";
import { getRecommendations } from "../lib/recommend";
import { useAppState } from "../store/AppState";

type Tab = "all" | "cheapest" | "fastest" | "streaming";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
  { key: "streaming", label: "Best for Streaming" },
];

const BEFORE_YOU_SWITCH = [
  {
    id: "installation",
    question: "Installation — what should I expect?",
    answer:
      "Once you choose a deal, your new provider takes over from here and arranges an engineer visit or self-install kit directly with you. Timings vary by provider and by whether new cabling is needed at your address.",
  },
  {
    id: "current-broadband",
    question: "What happens to my current broadband?",
    answer:
      "For most switches within the same network technology, your new provider handles the handover with your existing one, so there's no gap in service to manage yourself. If you're changing network type (for example moving onto full fibre), your old line stays live until the new one is confirmed working.",
  },
  {
    id: "contract",
    question: "What am I committing to?",
    answer:
      "Each deal shows its contract length up front — typically 18 or 24 months. You're not tied to ApTap itself; the contract is directly between you and the new provider, and you can cancel within the provider's standard cooling-off period after signing up.",
  },
  {
    id: "price",
    question: "Will my price change during the contract?",
    answer:
      "Where a deal includes an introductory price, the card shows both the current price and what it rises to, and from which month. Some deals are price-fixed for the whole term instead — that's called out on the card too.",
  },
  {
    id: "exit-fee",
    question: "Could I owe my current provider an exit fee?",
    answer:
      "We don't have exit-fee data for every provider yet, so we can't show a figure here. In the next step you'll tell us who you're with now and when your contract ends, and we'll flag if you look like you might still be in contract — before you commit to anything.",
  },
];

export default function Deals() {
  const navigate = useNavigate();
  const { state, toggleProvider, clearProviders, setProviders, toggleCompare, chooseDeal } = useAppState();
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    if (!state.selectedAddress) {
      navigate("/", { replace: true });
    }
  }, [state.selectedAddress, navigate]);

  const coverage = useMemo(() => getCoverage(state.postcode), [state.postcode]);

  const addressDeals = useMemo(() => availableDealsFor(DEALS, state.postcode), [state.postcode]);

  const addressProviders = useMemo(() => availableProvidersFor(state.postcode), [state.postcode]);

  const filteredDeals = useMemo(
    () => addressDeals.filter((d) => state.selectedProviders.includes(d.provider)),
    [addressDeals, state.selectedProviders]
  );

  const recommended = useMemo(() => getRecommendations(filteredDeals), [filteredDeals]);
  const recommendedIds = useMemo(() => new Set(recommended.map((d) => d.id)), [recommended]);

  const otherDeals = useMemo(() => {
    const rest = filteredDeals.filter((d) => !recommendedIds.has(d.id));
    const sorted = [...rest];
    if (tab === "cheapest") sorted.sort((a, b) => a.priceMonthly - b.priceMonthly);
    if (tab === "fastest") sorted.sort((a, b) => b.speedMbps - a.speedMbps);
    if (tab === "streaming")
      sorted.sort((a, b) => (b.speedMbps >= 100 ? 1 : 0) - (a.speedMbps >= 100 ? 1 : 0) || b.rating - a.rating);
    return sorted;
  }, [filteredDeals, recommendedIds, tab]);

  function handleChoose(dealId: string) {
    chooseDeal(dealId);
    navigate("/switch");
  }

  const compareDeals = state.compareIds.map((id) => getDeal(id)).filter(Boolean);

  if (!state.selectedAddress) return null;

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Header />

      <section className="mx-auto max-w-[1728px] px-6 pt-8">
        <div className="rounded-2xl bg-white shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold">Your Broadband deals around you</h1>
            <p className="text-gray-500 text-sm mt-1">{state.selectedAddress}</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">{coverage.label}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-sm flex items-center gap-1.5 w-fit"
          >
            Edit your answers ✎
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-indigo-50 border border-indigo-100 px-5 py-3.5 flex items-start gap-3">
          <span aria-hidden className="text-lg leading-none">
            🛡️
          </span>
          <p className="text-sm text-indigo-900">
            <span className="font-semibold">We'll check your exit fees before you switch.</span> Tell us
            who you're with today in the next step and we'll flag it if you look like you're still in
            contract — it won't stop you from continuing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1728px] px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        <aside className="rounded-2xl bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold">Providers</h2>
            <button
              onClick={clearProviders}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">{state.selectedProviders.length} selected</p>
          <ul className="flex flex-col gap-3">
            {PROVIDER_LIST.map((provider) => {
              const isAvailable = addressProviders.includes(provider.slug);
              return (
                <li key={provider.slug}>
                  <label
                    className={`flex items-center gap-3 ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isAvailable && state.selectedProviders.includes(provider.slug)}
                      disabled={!isAvailable}
                      onChange={() => toggleProvider(provider.slug)}
                      className="w-4 h-4 rounded accent-emerald-500 disabled:opacity-40"
                    />
                    <span className={`text-sm ${isAvailable ? "" : "text-gray-400"}`}>{provider.name}</span>
                  </label>
                  {!isAvailable && (
                    <p className="text-[11px] text-gray-400 ml-7 mt-0.5">Not available at this address</p>
                  )}
                </li>
              );
            })}
          </ul>
          {state.selectedProviders.length === 0 && (
            <button
              onClick={() => setProviders(addressProviders)}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Select all available
            </button>
          )}
        </aside>

        <div className="rounded-2xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-extrabold">Recommended for you</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            We currently have {recommended.length} deals that match your requirements
          </p>

          {recommended.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {recommended.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  compareChecked={state.compareIds.includes(deal.id)}
                  compareDisabled={state.compareIds.length >= 3}
                  onToggleCompare={() => toggleCompare(deal.id)}
                  onChoose={() => handleChoose(deal.id)}
                  onViewDetails={() => navigate(`/deal/${deal.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-10">
              No recommended deals match your current provider filters.
            </p>
          )}

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-extrabold">Other deals you could explore</h3>
            <p className="text-gray-500 text-sm mt-1 mb-5">Not necessarily the best for you but they work</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "bg-[#0b0b12] text-white"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {otherDeals.length > 0 ? (
              <div>
                {otherDeals.map((deal) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    onChoose={() => handleChoose(deal.id)}
                    onViewDetails={() => navigate(`/deal/${deal.id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-6">No other deals match your current filters.</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-lg font-extrabold">Before you switch</h3>
            <p className="text-gray-500 text-sm mt-1 mb-5">
              Quick answers to the questions that usually come up before switching provider
            </p>
            <Accordion items={BEFORE_YOU_SWITCH} />
          </div>
        </div>
      </section>

      {state.compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-[1728px] px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {state.compareIds.length} of 3 selected
              </span>
              {compareDeals.map((deal) => (
                <span
                  key={deal!.id}
                  className="inline-flex items-center gap-2 bg-gray-100 rounded-full pl-3 pr-2 py-1.5 text-sm font-medium"
                >
                  {deal!.planName}
                  <button
                    onClick={() => toggleCompare(deal!.id)}
                    aria-label={`Remove ${deal!.planName} from compare`}
                    className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate("/compare")}
              disabled={state.compareIds.length < 2}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-white font-semibold whitespace-nowrap"
            >
              Compare ({state.compareIds.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
