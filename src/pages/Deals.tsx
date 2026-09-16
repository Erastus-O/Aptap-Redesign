import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import DealCard from "../components/DealCard";
import DealRow from "../components/DealRow";
import { DEALS, getDeal } from "../data/deals";
import { PROVIDER_LIST } from "../data/providers";
import { useAppState } from "../store/AppState";

type Tab = "all" | "cheapest" | "fastest" | "streaming";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
  { key: "streaming", label: "Best for Streaming" },
];

export default function Deals() {
  const navigate = useNavigate();
  const { state, toggleProvider, clearProviders, selectAllProviders, toggleCompare, chooseDeal } =
    useAppState();
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    if (!state.selectedAddress) {
      navigate("/", { replace: true });
    }
  }, [state.selectedAddress, navigate]);

  const filteredDeals = useMemo(
    () => DEALS.filter((d) => state.selectedProviders.includes(d.provider)),
    [state.selectedProviders]
  );

  const recommended = useMemo(
    () => filteredDeals.filter((d) => d.bestFit).slice(0, 3),
    [filteredDeals]
  );

  const otherDeals = useMemo(() => {
    const rest = filteredDeals.filter((d) => !recommended.includes(d));
    const sorted = [...rest];
    if (tab === "cheapest") sorted.sort((a, b) => a.priceMonthly - b.priceMonthly);
    if (tab === "fastest") sorted.sort((a, b) => b.speedMbps - a.speedMbps);
    if (tab === "streaming")
      sorted.sort((a, b) => (b.speedMbps >= 100 ? 1 : 0) - (a.speedMbps >= 100 ? 1 : 0) || b.rating - a.rating);
    return sorted;
  }, [filteredDeals, recommended, tab]);

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
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-sm flex items-center gap-1.5 w-fit"
          >
            Edit your answers ✎
          </button>
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
            {PROVIDER_LIST.map((provider) => (
              <li key={provider.slug}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.selectedProviders.includes(provider.slug)}
                    onChange={() => toggleProvider(provider.slug)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-sm">{provider.name}</span>
                </label>
              </li>
            ))}
          </ul>
          {state.selectedProviders.length === 0 && (
            <button
              onClick={selectAllProviders}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Select all
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
                  onViewDetails={() => handleChoose(deal.id)}
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
                  <DealRow key={deal.id} deal={deal} onChoose={() => handleChoose(deal.id)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-6">No other deals match your current filters.</p>
            )}
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
