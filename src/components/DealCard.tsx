import type { RecommendedDeal } from "../types";
import { PROVIDERS } from "../data/providers";
import { formatPrice } from "../lib/format";
import { currentMonthlyPrice, daysUntil, formatSpeed, nextPriceRise, technologyLabel } from "../lib/price";
import ProviderLogo from "./ProviderLogo";

interface Props {
  deal: RecommendedDeal;
  compareChecked: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  onChoose: () => void;
  onViewDetails: () => void;
}

export default function DealCard({
  deal,
  compareChecked,
  compareDisabled,
  onToggleCompare,
  onChoose,
  onViewDetails,
}: Props) {
  const provider = PROVIDERS[deal.provider];
  const price = currentMonthlyPrice(deal);
  const rise = nextPriceRise(deal);
  const offerDaysLeft = deal.offer_ends ? daysUntil(deal.offer_ends) : null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col bg-white">
      <div className="bg-[#0b0b12] text-white p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold tracking-wide text-gray-300">{deal.reasonLabel}</span>
          <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareChecked}
              disabled={compareDisabled && !compareChecked}
              onChange={onToggleCompare}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            Compare deals
          </label>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <ProviderLogo provider={deal.provider} size={36} />
          <div>
            <h3 className="font-bold text-lg leading-tight">{deal.name}</h3>
            <p className="text-xs text-gray-400">
              {provider.name} · {technologyLabel(deal.technology)}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-3">{deal.greatFor}</p>

        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-4">
          <p className="text-[11px] font-semibold text-emerald-300 mb-0.5">Why we recommend it</p>
          <p className="text-xs text-gray-300">{deal.reasonText}</p>
        </div>

        <p className="text-xs text-gray-400 mb-1">Monthly price</p>
        <p className="text-3xl font-extrabold mb-4">{formatPrice(price)}</p>

        <div className="flex gap-8 mb-4">
          <div>
            <p className="text-xs text-gray-400">Speed</p>
            <p className="font-semibold">{formatSpeed(deal.download_mbps, deal.download_note)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Contract</p>
            <p className="font-semibold">
              {deal.contract_months === 1 ? "Rolling monthly" : `${deal.contract_months} months`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start">
          {deal.reward && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1">
              🎁 {deal.reward}
            </span>
          )}
          {rise ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
              ↑ {formatPrice(price)}/mo now, {formatPrice(rise.monthly_price)}/mo from{" "}
              {new Date(rise.from).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            </span>
          ) : deal.price_rise_note ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
              {deal.price_rise_note}
            </span>
          ) : null}
          {deal.out_of_contract_price && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 text-gray-300 rounded-full px-3 py-1">
              Then {formatPrice(deal.out_of_contract_price)}/mo after contract ends
            </span>
          )}
          {offerDaysLeft != null && offerDaysLeft >= 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/15 text-rose-300 rounded-full px-3 py-1">
              Offer ends in {offerDaysLeft} day{offerDaysLeft === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <button
          onClick={onChoose}
          className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold"
        >
          Choose the deal
        </button>
        <button
          onClick={onViewDetails}
          className="w-full py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
        >
          View full details
        </button>
      </div>
    </div>
  );
}
