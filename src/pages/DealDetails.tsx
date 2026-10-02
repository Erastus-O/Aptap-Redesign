import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import ProviderLogo from "../components/ProviderLogo";
import { PROVIDERS } from "../data/providers";
import { availableDealsFor } from "../lib/availability";
import { formatPrice } from "../lib/format";
import {
  currentMonthlyPrice,
  firstYearCost,
  formatContract,
  formatSetupFee,
  formatSpeed,
  technologyLabel,
} from "../lib/price";
import { getRecommendations } from "../lib/recommend";
import { useAppState } from "../store/AppState";

export default function DealDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, deals, chooseDeal, toggleCompare } = useAppState();

  const deal = id ? deals.deals.find((d) => d.id === id) : undefined;

  useEffect(() => {
    if (!state.selectedAddress) {
      navigate("/", { replace: true });
    } else if (!deals.loading && !deal) {
      navigate("/deals", { replace: true });
    }
  }, [state.selectedAddress, deals.loading, deal, navigate]);

  const filteredDeals = useMemo(
    () => availableDealsFor(deals.deals, state.postcode).filter((d) => state.selectedProviders.includes(d.provider)),
    [deals.deals, state.postcode, state.selectedProviders]
  );
  const recommended = useMemo(() => getRecommendations(filteredDeals), [filteredDeals]);
  const recommendedMatch = deal ? recommended.find((r) => r.id === deal.id) : undefined;

  if (!state.selectedAddress || !deal) return null;

  const provider = PROVIDERS[deal.provider];
  const price = currentMonthlyPrice(deal);

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
                  <h1 className="font-bold text-xl leading-tight">{deal.name}</h1>
                  <p className="text-sm text-gray-400">
                    {provider.name} · {technologyLabel(deal.technology)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-5">
                {recommendedMatch?.greatFor ?? formatSpeed(deal.download_mbps, deal.download_note)}
              </p>

              <div className="flex gap-8 mb-5">
                <div>
                  <p className="text-xs text-gray-400">Download</p>
                  <p className="font-semibold">{formatSpeed(deal.download_mbps, deal.download_note)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Upload</p>
                  <p className="font-semibold">{formatSpeed(deal.upload_mbps)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contract</p>
                  <p className="font-semibold">{formatContract(deal.contract_months)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Setup fee</p>
                  <p className="font-semibold">{formatSetupFee(deal.setup_fee)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {deal.reward && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1">
                    🎁 {deal.reward}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-extrabold mb-4">Pricing transparency</h2>
              <div className="rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-400">Now</p>
                  <p className="text-xl font-bold">{formatPrice(price)}/m</p>
                </div>

                {deal.price_rises.map((rise) => (
                  <div
                    key={rise.from}
                    className="flex items-center justify-between pt-4 border-t border-gray-100"
                  >
                    <div>
                      <p className="text-xs text-gray-400">
                        From{" "}
                        {new Date(rise.from).toLocaleDateString("en-GB", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xl font-bold text-amber-600">{formatPrice(rise.monthly_price)}/m</p>
                    </div>
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1 h-fit">
                      Price rise
                    </span>
                  </div>
                ))}

                {deal.price_rises.length === 0 && deal.price_rise_note && (
                  <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border-t-0">
                    {deal.price_rise_note}
                  </p>
                )}

                {deal.out_of_contract_price != null && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">
                        After your {formatContract(deal.contract_months).toLowerCase()} contract ends
                      </p>
                      <p className="text-lg font-bold text-gray-700">
                        {formatPrice(deal.out_of_contract_price)}/m
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
                  Estimated first-year cost:{" "}
                  <span className="font-semibold text-gray-900">{formatPrice(firstYearCost(deal))}</span>
                  {deal.setup_fee ? ` (includes a ${formatPrice(deal.setup_fee)} setup fee)` : null}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-extrabold mb-4">Exit fee check</h2>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
                {knownCurrentProvider ? (
                  <>
                    <p className="font-semibold text-indigo-900 mb-1">
                      You told us you're with {knownCurrentProvider}
                    </p>
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
              <h2 className="text-lg font-extrabold mb-4">More about this deal</h2>
              <div className="rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
                {deal.guaranteed_mbps != null && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Guaranteed minimum speed</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{deal.guaranteed_mbps}Mb</span> — the
                      slowest this line is allowed to run before you can exit penalty-free, under the
                      provider's speed guarantee.
                    </p>
                  </div>
                )}
                {deal.setup_note && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Setup</p>
                    <p className="text-sm text-gray-700">{deal.setup_note}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 rounded-full px-3 py-1">
                    14-day cooling-off period
                  </span>
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 rounded-full px-3 py-1">
                    Barclays partner marketplace
                  </span>
                </div>
                <a
                  href={deal.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 w-fit"
                >
                  View this offer on {provider.name}'s website ↗
                </a>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-6 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {provider.name} | {deal.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">from</p>
              <p className="text-2xl font-extrabold">{formatPrice(price)}/m</p>
              {deal.price_rises.length > 0 ? (
                <p className="text-sm font-medium text-amber-600 mt-1">
                  Rising to {formatPrice(deal.price_rises[deal.price_rises.length - 1].monthly_price)}/mo by{" "}
                  {new Date(deal.price_rises[deal.price_rises.length - 1].from).getFullYear()}
                </p>
              ) : deal.price_rise_note ? (
                <p className="text-xs text-amber-600 mt-1">{deal.price_rise_note}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Download</span>
                <span className="font-semibold">{formatSpeed(deal.download_mbps, deal.download_note)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contract</span>
                <span className="font-semibold">{formatContract(deal.contract_months)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Setup fee</span>
                <span className="font-semibold">{formatSetupFee(deal.setup_fee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Est. first year</span>
                <span className="font-semibold">{formatPrice(firstYearCost(deal))}</span>
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
