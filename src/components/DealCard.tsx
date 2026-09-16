import type { Deal } from "../types";
import { PROVIDERS } from "../data/providers";
import { formatPrice, incentiveLabel } from "../lib/format";
import ProviderLogo from "./ProviderLogo";

interface Props {
  deal: Deal;
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

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col bg-white">
      <div className="bg-[#0b0b12] text-white p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold tracking-wide text-gray-300">BEST FIT FOR YOU</span>
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
            <h3 className="font-bold text-lg leading-tight">{deal.planName}</h3>
            <p className="text-xs text-gray-400">
              {provider.name} · {deal.connection}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4">{deal.description}</p>

        <p className="text-xs text-gray-400 mb-1">Monthly price</p>
        <p className="text-3xl font-extrabold mb-4">{formatPrice(deal.priceMonthly)}</p>

        <div className="flex gap-8 mb-4">
          <div>
            <p className="text-xs text-gray-400">Speed</p>
            <p className="font-semibold">{deal.speedMbps}mb</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Contract</p>
            <p className="font-semibold">{deal.contractMonths} months</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1">
            🎁 {incentiveLabel(deal)}
          </span>
          {deal.priceRise ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
              ↑ Rises to {formatPrice(deal.priceRise.amount)} from month {deal.priceRise.fromMonth}
            </span>
          ) : deal.priceFixedForTerm ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-400/15 text-amber-200 rounded-full px-3 py-1">
              Price fixed for the term
            </span>
          ) : null}
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
