import type { Deal } from "../types";
import { PROVIDERS } from "../data/providers";
import { formatPrice } from "../lib/format";
import { currentMonthlyPrice, formatSpeed, nextPriceRise } from "../lib/price";
import ProviderLogo from "./ProviderLogo";

interface Props {
  deal: Deal;
  onChoose: () => void;
  onViewDetails: () => void;
}

export default function DealRow({ deal, onChoose, onViewDetails }: Props) {
  const provider = PROVIDERS[deal.provider];
  const price = currentMonthlyPrice(deal);
  const rise = nextPriceRise(deal);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <ProviderLogo provider={deal.provider} size={36} />
          <div>
            <h4 className="font-bold">{deal.name}</h4>
            <p className="text-xs text-gray-500">{provider.name}</p>
          </div>
        </div>

        {deal.reward && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 w-fit">
            🎁 {deal.reward}
          </span>
        )}

        <div className="flex gap-8 flex-1">
          <div>
            <p className="text-xs text-gray-400">Speed</p>
            <p className="font-semibold">{formatSpeed(deal.download_mbps, deal.download_note)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Monthly price</p>
            <p className="font-semibold">{formatPrice(price)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Contract</p>
            <p className="font-semibold">
              {deal.contract_months === 1 ? "Rolling monthly" : `${deal.contract_months} months`}
            </p>
          </div>
        </div>

        {rise ? (
          <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1 w-fit">
            Rises to {formatPrice(rise.monthly_price)}/mo
          </span>
        ) : (
          deal.price_rise_note && (
            <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1 w-fit max-w-[220px]">
              {deal.price_rise_note}
            </span>
          )
        )}

        <div className="flex gap-3 lg:ml-auto">
          <button
            onClick={onViewDetails}
            className="px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm whitespace-nowrap"
          >
            View full details
          </button>
          <button
            onClick={onChoose}
            className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold text-sm whitespace-nowrap"
          >
            Choose the deal
          </button>
        </div>
      </div>
    </div>
  );
}
