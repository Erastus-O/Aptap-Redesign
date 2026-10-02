import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProviderLogo from "../components/ProviderLogo";
import { PROVIDERS } from "../data/providers";
import { formatPrice } from "../lib/format";
import {
  currentMonthlyPrice,
  firstYearCost,
  formatContract,
  formatSetupFee,
  formatSpeed,
  nextPriceRise,
  technologyLabel,
} from "../lib/price";
import { useAppState } from "../store/AppState";
import type { Deal } from "../types";

type Row = {
  label: string;
  sub?: string;
  better: "lower" | "higher" | "none";
  render: (deal: Deal) => string;
  value: (deal: Deal) => number;
};

const ROWS: Row[] = [
  {
    label: "Monthly price",
    better: "lower",
    render: (d) => `${formatPrice(currentMonthlyPrice(d))}/mo`,
    value: (d) => currentMonthlyPrice(d),
  },
  {
    label: "Next price change",
    better: "lower",
    render: (d) => {
      const rise = nextPriceRise(d);
      if (rise) {
        return `${formatPrice(rise.monthly_price)} from ${new Date(rise.from).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
      }
      return d.price_rise_note ?? "No published change";
    },
    value: (d) => nextPriceRise(d)?.monthly_price ?? currentMonthlyPrice(d),
  },
  {
    label: "Est. first-year cost",
    sub: "Current price × 12, plus any published rise that lands within the first year",
    better: "lower",
    render: (d) => formatPrice(firstYearCost(d)),
    value: (d) => firstYearCost(d),
  },
  {
    label: "After contract ends",
    sub: "What you'd pay per month if you didn't switch away when the contract finishes",
    better: "lower",
    render: (d) => (d.out_of_contract_price != null ? `${formatPrice(d.out_of_contract_price)}/mo` : "—"),
    value: (d) => d.out_of_contract_price ?? Infinity,
  },
  {
    label: "Download speed",
    better: "higher",
    render: (d) => formatSpeed(d.download_mbps, d.download_note),
    value: (d) => d.download_mbps ?? 0,
  },
  {
    label: "Upload speed",
    better: "higher",
    render: (d) => formatSpeed(d.upload_mbps),
    value: (d) => d.upload_mbps ?? 0,
  },
  {
    label: "Guaranteed minimum speed",
    sub: "The slowest the line is allowed to run before you can exit penalty-free",
    better: "higher",
    render: (d) => formatSpeed(d.guaranteed_mbps),
    value: (d) => d.guaranteed_mbps ?? 0,
  },
  {
    label: "Contract length",
    better: "none",
    render: (d) => formatContract(d.contract_months),
    value: () => 0,
  },
  {
    label: "Setup fee",
    better: "lower",
    render: (d) => formatSetupFee(d.setup_fee),
    value: (d) => d.setup_fee ?? Infinity,
  },
  {
    label: "Connection",
    better: "none",
    render: (d) => technologyLabel(d.technology),
    value: () => 0,
  },
  {
    label: "Reward",
    better: "none",
    render: (d) => d.reward ?? "—",
    value: () => 0,
  },
];

export default function Compare() {
  const navigate = useNavigate();
  const { state, deals: dealsFeed, chooseDeal, toggleCompare } = useAppState();

  const deals = state.compareIds
    .map((id) => dealsFeed.deals.find((d) => d.id === id))
    .filter((d): d is Deal => Boolean(d));

  useEffect(() => {
    if (!dealsFeed.loading && deals.length < 2) navigate("/deals", { replace: true });
  }, [dealsFeed.loading, deals.length, navigate]);

  if (deals.length < 2) return null;

  const bestValueId = [...deals].sort((a, b) => firstYearCost(a) - firstYearCost(b))[0].id;

  function handleChoose(dealId: string) {
    chooseDeal(dealId);
    navigate("/switch");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl bg-white shadow-sm p-6 sm:p-8">
          <p className="text-xs font-bold tracking-wide text-gray-400 mb-2">COMPARE DEALS</p>
          <div className="flex items-start justify-between gap-4 mb-1">
            <h1 className="text-2xl font-extrabold">{deals.length} deals side by side</h1>
            <button
              onClick={() => navigate("/deals")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
            >
              ← Back to deals
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Green cells show the best value in each row, we count the post-promo price, not just the
            headline
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-48" />
                  {deals.map((deal) => (
                    <th key={deal.id} className="p-0 align-bottom">
                      <div
                        className={`rounded-t-2xl p-5 text-center ${
                          deal.id === bestValueId ? "bg-indigo-50" : "bg-white"
                        }`}
                      >
                        {deal.id === bestValueId && (
                          <p className="text-xs font-bold text-indigo-600 mb-2">Best value</p>
                        )}
                        <div className="flex justify-center mb-2">
                          <ProviderLogo provider={deal.provider} size={40} />
                        </div>
                        <p className="font-bold">{deal.name}</p>
                        <p className="text-xs text-gray-500 mb-3">{PROVIDERS[deal.provider].name}</p>
                        <button
                          onClick={() => handleChoose(deal.id)}
                          className="px-5 py-2 rounded-full bg-[#0b0b12] hover:bg-black transition-colors text-white text-sm font-semibold"
                        >
                          Choose
                        </button>
                        <button
                          onClick={() => toggleCompare(deal.id)}
                          className="block mx-auto mt-2 text-xs text-gray-400 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const values = deals.map((d) => row.value(d));
                  const winningValue =
                    row.better === "lower"
                      ? Math.min(...values)
                      : row.better === "higher"
                        ? Math.max(...values)
                        : null;
                  const isTie = winningValue !== null && values.every((v) => v === winningValue);

                  return (
                    <tr key={row.label} className="border-t border-gray-100">
                      <td className="py-4 pr-4 align-top">
                        <p className="text-sm font-medium text-gray-700">{row.label}</p>
                        {row.sub && <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>}
                      </td>
                      {deals.map((deal, i) => {
                        const isBest =
                          winningValue !== null && isFinite(winningValue) && !isTie && values[i] === winningValue;
                        return (
                          <td
                            key={deal.id}
                            className={`py-4 px-4 text-center text-sm ${isBest ? "bg-emerald-50" : ""}`}
                          >
                            <p className="font-semibold text-gray-900">{row.render(deal)}</p>
                            {isBest && <p className="text-xs text-emerald-600 font-medium mt-0.5">Best</p>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
