import {
  Accordion,
  ChipGroup,
  CompareTray,
  DealCard,
  DealCarousel,
  Panel,
  ProviderFilter,
  ResultsSummary,
} from "@aptap/design-system";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { providerLogo } from "../data/providers";
import { availableDealsFor, availableProvidersFor, getCoverage } from "../lib/availability";
import { currentMonthlyPrice } from "../lib/price";
import { getRecommendations } from "../lib/recommend";
import { useAppState } from "../store/AppState";
import type { Deal, ProviderSlug } from "../types";

type Tab = "all" | "cheapest" | "fastest" | "streaming";

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "streaming", label: "Best for streaming" },
];

const BEFORE_YOU_SWITCH = [
  {
    id: "installation",
    title: "Installation — what should I expect?",
    content:
      "Once you choose a deal, your new provider takes over from here and arranges an engineer visit or self-install kit directly with you. Timings vary by provider and by whether new cabling is needed at your address.",
  },
  {
    id: "current-broadband",
    title: "What happens to my current broadband?",
    content:
      "For most switches within the same network technology, your new provider handles the handover with your existing one, so there's no gap in service to manage yourself. If you're changing network type (for example moving onto full fibre), your old line stays live until the new one is confirmed working.",
  },
  {
    id: "contract",
    title: "What am I committing to?",
    content:
      "Each deal shows its contract length up front — most are 24 months, some are shorter, and a few run rolling monthly with no fixed term at all. You're not tied to ApTap itself; the contract is directly between you and the new provider.",
  },
  {
    id: "price",
    title: "Will my price change during the contract?",
    content:
      "Where a provider has published future price rises, the card shows the current price and what it rises to, and from when. Some providers only note that prices may change without giving exact figures, and some show what you'd pay if you stayed on past the end of your contract — all of that is shown on the card, not hidden until checkout.",
  },
  {
    id: "exit-fee",
    title: "Could I owe my current provider an exit fee?",
    content:
      "We don't have exit-fee data for every provider yet, so we can't show a figure here. In the next step you'll tell us who you're with now and when your contract ends, and we'll flag if you look like you might still be in contract — before you commit to anything.",
  },
];

export default function Deals() {
  const navigate = useNavigate();
  const { state, deals, setProviders, toggleCompare, chooseDeal } = useAppState();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    if (!state.selectedAddress) {
      navigate("/", { replace: true });
    }
  }, [state.selectedAddress, navigate]);

  const coverage = useMemo(() => getCoverage(state.postcode), [state.postcode]);

  const addressDeals = useMemo(() => availableDealsFor(deals.deals, state.postcode), [deals.deals, state.postcode]);

  const addressProviders = useMemo(
    () => availableProvidersFor(deals.deals, state.postcode),
    [deals.deals, state.postcode]
  );

  const filteredDeals = useMemo(
    () => addressDeals.filter((d) => state.selectedProviders.includes(d.provider)),
    [addressDeals, state.selectedProviders]
  );

  const recommended = useMemo(() => getRecommendations(filteredDeals), [filteredDeals]);
  const recommendedIds = useMemo(() => new Set(recommended.map((d) => d.id)), [recommended]);

  const otherDeals = useMemo(() => {
    const rest = filteredDeals.filter((d) => !recommendedIds.has(d.id));
    const sorted = [...rest];
    if (activeTab === "cheapest") sorted.sort((a, b) => currentMonthlyPrice(a) - currentMonthlyPrice(b));
    if (activeTab === "fastest") sorted.sort((a, b) => (b.download_mbps ?? 0) - (a.download_mbps ?? 0));
    if (activeTab === "streaming")
      sorted.sort(
        (a, b) =>
          ((b.download_mbps ?? 0) >= 100 ? 1 : 0) - ((a.download_mbps ?? 0) >= 100 ? 1 : 0) ||
          (b.download_mbps ?? 0) - (a.download_mbps ?? 0)
      );
    return sorted;
  }, [filteredDeals, recommendedIds, activeTab]);

  function handleChoose(deal: { id: string }) {
    chooseDeal(deal.id);
    navigate("/switch");
  }

  const compareDeals = state.compareIds
    .map((id) => deals.deals.find((d) => d.id === id))
    .filter((d): d is Deal => Boolean(d));

  if (!state.selectedAddress) return null;

  if (deals.loading) {
    return (
      <div>
        <Header />
        <div className="ap-container ap-container--reading" style={{ paddingBlock: "var(--ap-spacing-12)", textAlign: "center" }}>
          <p className="ap-muted">Finding deals near you…</p>
        </div>
      </div>
    );
  }

  if (deals.error) {
    return (
      <div>
        <Header />
        <div className="ap-container ap-container--reading" style={{ paddingBlock: "var(--ap-spacing-12)", textAlign: "center" }}>
          <p className="ap-text-h4">We couldn't load today's deals</p>
          <p className="ap-muted">{deals.error}. Try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: state.compareIds.length > 0 ? 96 : 0 }}>
      <Header />

      <div className="ap-container" style={{ paddingTop: "var(--ap-spacing-6)" }}>
        <ResultsSummary address={state.selectedAddress} network={coverage.label} onEdit={() => navigate("/")} />
      </div>

      <div className="ap-container" style={{ paddingBlock: "var(--ap-spacing-6)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          <ProviderFilter
            providers={addressProviders}
            selected={state.selectedProviders.filter((p) => addressProviders.includes(p))}
            onChange={(next) => setProviders(next as ProviderSlug[])}
          />

          <div className="ap-stack ap-stack--section">
            <Panel
              title="Recommended for you"
              subtitle={`We currently have ${recommended.length} deals that match your requirements`}
            >
              {recommended.length > 0 ? (
                <DealCarousel>
                  {recommended.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      variant="featured"
                      eyebrow={deal.reasonLabel}
                      reason={deal.reasonText}
                      fit={deal.greatFor}
                      logoSrc={providerLogo(deal.provider).src}
                      logoFill={providerLogo(deal.provider).fill}
                      comparing={state.compareIds.includes(deal.id)}
                      onCompareChange={() => toggleCompare(deal.id)}
                      onChoose={handleChoose}
                      onDetails={() => navigate(`/deal/${deal.id}`)}
                    />
                  ))}
                </DealCarousel>
              ) : (
                <p className="ap-muted">No recommended deals match your current provider filters.</p>
              )}
            </Panel>

            <Panel title="Other deals you could explore" subtitle="Not necessarily the best for you but they work">
              <div className="ap-stack ap-stack--sm">
                <ChipGroup label="Sort other deals by" options={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} />

                {otherDeals.length > 0 ? (
                  <div className="ap-stack">
                    {otherDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        variant="list"
                        logoSrc={providerLogo(deal.provider).src}
                        logoFill={providerLogo(deal.provider).fill}
                        comparing={state.compareIds.includes(deal.id)}
                        onCompareChange={() => toggleCompare(deal.id)}
                        onChoose={handleChoose}
                        onDetails={() => navigate(`/deal/${deal.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="ap-muted">No other deals match your current filters.</p>
                )}
              </div>
            </Panel>

            <Panel
              title="Before you switch"
              subtitle="Quick answers to the questions that usually come up before switching provider"
            >
              <Accordion items={BEFORE_YOU_SWITCH} boxed />
            </Panel>

            {deals.updatedAt && (
              <p className="ap-footnote">
                Prices checked{" "}
                {new Date(deals.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                , taken from each provider's own website. Actual price and availability depend on your
                address — we simulate coverage by postcode here since the feed itself isn't address-aware.
              </p>
            )}
          </div>
        </div>
      </div>

      {state.compareIds.length > 0 && (
        <CompareTray
          deals={compareDeals}
          max={3}
          onRemove={(d) => toggleCompare(d.id)}
          onCompare={() => navigate("/compare")}
        />
      )}
    </div>
  );
}
