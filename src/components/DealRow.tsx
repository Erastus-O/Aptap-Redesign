import type { Deal } from "../types";
import { PROVIDERS } from "../data/providers";
import { formatPrice, incentiveLabel } from "../lib/format";
import ProviderLogo from "./ProviderLogo";

interface Props {
  deal: Deal;
  onChoose: () => void;
  onViewDetails: () => void;
}

export default function DealRow({ deal, onChoose, onViewDetails }: Props) {
  const provider = PROVIDERS[deal.provider];

  return (
    <div className="border-b border-gray-100 last:border-0 py-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <ProviderLogo provider={deal.provider} size={36} />
          <div>
            <h4 className="font-bold">{deal.planName}</h4>
            <p className="text-xs text-gray-500">
              {provider.name} · {deal.connection}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 w-fit">
          🎁 {incentiveLabel(deal)}
        </span>

        <div className="flex gap-8 flex-1">
          <div>
            <p className="text-xs text-gray-400">Speed</p>
            <p className="font-semibold">{deal.speedMbps}mb</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Monthly price</p>
            <p className="font-semibold">{formatPrice(deal.priceMonthly)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Contract</p>
            <p className="font-semibold">{deal.contractMonths} months</p>
          </div>
        </div>

        {deal.priceFixedForTerm && (
          <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1 w-fit">
            Price fixed for the term
          </span>
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
