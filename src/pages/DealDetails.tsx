import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import ProviderLogo from "../components/ProviderLogo";
import { DEALS, getDeal } from "../data/deals";
import { PROVIDERS } from "../data/providers";
import { availableDealsFor } from "../lib/availability";
import { firstYearCost, formatPrice, incentiveLabel } from "../lib/format";
import { getRecommendations } from "../lib/recommend";
import { useAppState } from "../store/AppState";

export default function DealDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, chooseDeal, toggleCompare } = useAppState();

  const deal = id ? getDeal(id) : undefined;

  useEffect(() => {
    if (!state.selectedAddress) {
      navigate("/", { replace: true });
    } else if (!deal) {
      navigate("/deals", { replace: true });
    }
  }, [state.selectedAddress, deal, navigate]);

  const filteredDeals = useMemo(
    () => availableDealsFor(DEALS, state.postcode).filter((d) => state.selectedProviders.includes(d.provider)),
    [state.postcode, state.selectedProviders]
  );
  const recommended = useMemo(() => getRecommendations(filteredDeals), [filteredDeals]);
  const recommendedMatch = deal ? recommended.find((r) => r.id === deal.id) : undefined;

  if (!state.selectedAddress || !deal) return null;

  const provider = PROVIDERS[deal.provider];

  const knownCurrentProvider =
    state.switchForm.currentProvider &&
    state.switchForm.currentProvider !== "other" &&
    state.switchForm.currentProvider !== "not_sure"
      ? PROVIDERS[state.switchForm.currentProvider].name
      : null;

  function handleContinue() {
    chooseDeal(deal!.id);
    navigate("/switch");
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Header />

      <div className="mx-auto max-w-[1728px] px-6 pt-8">
        <button
          onClick={() => navigate("/deals")}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-4"
        >
          ← Back to deals
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden shadow-sm bg-[#0b0b12] text-white p-6">
              <span className="text-[11px] font-bold tracking-wide text-gray-300">
                {recommendedMatch?.reasonLabel ?? "DEAL DETAILS"}
              </span>

              <div className="flex items-center gap-3 mt-4 mb-3">
                <ProviderLogo provider={deal.provider} size={40} />
                <div>
                  <h1 className="font-bold text-xl leading-tight">{deal.planName}</h1>
                  <p className="text-sm text-gray-400">
                    {provider.name} · {deal.connection}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-5">{recommendedMatch?.greatFor ?? deal.description}</p>

              <div className="flex gap-8 mb-5">
                <div>
                  <p className="text-xs text-gray-400">Speed</p>
                  <p className="font-semibold">{deal.speedMbps}mb</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contract</p>
                  <p className="font-semibold">{deal.contractMonths} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Setup fee</p>
                  <p className="font-semibold">{deal.setupFee === 0 ? "Free" : formatPrice(deal.setupFee)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1">
                  🎁 {incentiveLabel(deal)}
                </span>
                {deal.priceRise ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
                    ↑ {formatPrice(deal.priceMonthly)}/mo now, {formatPrice(deal.priceRise.amount)}/mo from
                    month {deal.priceRise.fromMonth}
                  </span>
                ) : deal.priceFixedForTerm ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
                    Price fixed for the term
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-extrabold mb-4">Pricing transparency</h2>
              <div className="rounded-xl border border-gray-100 p-5">
                {deal.priceRise ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Now until month {deal.priceRise.fromMonth - 1}</p>
                        <p className="text-xl font-bold">{formatPrice(deal.priceMonthly)}/m</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-xs text-gray-400">From month {deal.priceRise.fromMonth}</p>
                        <p className="text-xl font-bold text-amber-600">
                          {formatPrice(deal.priceRise.amount)}/m
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1 h-fit">
                        Price rise
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        {deal.priceFixedForTerm ? `Fixed for all ${deal.contractMonths} months` : "Every month"}
                      </p>
                      <p className="text-xl font-bold">{formatPrice(deal.priceMonthly)}/m</p>
                    </div>
                    {deal.priceFixedForTerm && (
                      <span className="text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 h-fit">
                        Price fixed
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  Estimated first year cost: <span className="font-semibold text-gray-900">£{firstYearCost(deal)}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-extrabold mb-4">Exit fee check</h2>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
                {knownCurrentProvider ? (
                  <>
                    <p className="font-semibold text-indigo-900 mb-1">You told us you're with {knownCurrentProvider}</p>
                    <p className="text-sm text-indigo-800">
                      When you switch, we'll confirm your contract end date and flag any exit fee before you
                      commit to anything.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-indigo-900 mb-1">We don't know who you're with yet</p>
                    <p className="text-sm text-indigo-800">
                      Tell us in the next step and we'll flag if you look like you're still in contract —
                      it won't stop you from continuing now.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-extrabold mb-4">Why this provider</h2>
              <div className="rounded-xl border border-gray-100 p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-extrabold">{deal.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">{deal.reviews.toLocaleString()} reviews</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Rating from {provider.name} customers who reviewed their service on ApTap.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 rounded-full px-3 py-1">
                    Hassle-free switch
                  </span>
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 rounded-full px-3 py-1">
                    14-day cooling-off period
                  </span>
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 rounded-full px-3 py-1">
                    Barclays partner marketplace
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-6 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {provider.name} | {deal.planName}
              </p>
              <p className="text-xs text-gray-400 mt-1">from</p>
              <p className="text-2xl font-extrabold">{formatPrice(deal.priceMonthly)}/m</p>
              {deal.priceRise && (
                <p className="text-sm font-medium text-amber-600 mt-1">
                  Rises to {formatPrice(deal.priceRise.amount)}/mo from month {deal.priceRise.fromMonth}
                </p>
              )}
              {deal.priceFixedForTerm && (
                <p className="text-sm font-medium text-emerald-600 mt-1">Price fixed for the term</p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Speed</span>
                <span className="font-semibold">{deal.speedMbps}Mb</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contract</span>
                <span className="font-semibold">{deal.contractMonths} months</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Setup fee</span>
                <span className="font-semibold">{deal.setupFee === 0 ? "Free" : formatPrice(deal.setupFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Est. first year</span>
                <span className="font-semibold">£{firstYearCost(deal)}</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold"
            >
              Continue to switch
            </button>
            <button
              onClick={() => toggleCompare(deal.id)}
              className="w-full py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {state.compareIds.includes(deal.id) ? "Remove from compare" : "Add to compare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
