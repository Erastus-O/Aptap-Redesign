import { useState } from "react";
import type { Deal } from "../types";
import { PROVIDERS } from "../data/providers";
import { formatPrice, incentiveLabel } from "../lib/format";
import ProviderLogo from "./ProviderLogo";

interface Props {
  deal: Deal;
  onChoose: () => void;
}

export default function DealRow({ deal, onChoose }: Props) {
  const [expanded, setExpanded] = useState(false);
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
            onClick={() => setExpanded((v) => !v)}
            className="px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            View full details
            <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
          </button>
          <button
            onClick={onChoose}
            className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold text-sm whitespace-nowrap"
          >
            Choose the deal
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 ml-0 lg:ml-[52px] rounded-xl bg-gray-50 p-4 text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <p>{deal.description}</p>
          <div>
            <p className="text-xs text-gray-400">Setup fee</p>
            <p className="font-semibold text-gray-900">
              {deal.setupFee === 0 ? "Free" : formatPrice(deal.setupFee)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Customer rating</p>
            <p className="font-semibold text-gray-900">
              {deal.rating.toFixed(1)}. {deal.reviews.toLocaleString()} reviews
            </p>
          </div>
          {deal.priceRise && (
            <div>
              <p className="text-xs text-gray-400">Price after promo</p>
              <p className="font-semibold text-gray-900">
                {formatPrice(deal.priceRise.amount)} from month {deal.priceRise.fromMonth}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
