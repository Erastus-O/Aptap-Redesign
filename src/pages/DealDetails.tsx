import {
  BackLink,
  Button,
  DealCard,
  DealSummary,
  ExitFeeCheck,
  Panel,
  PriceTimeline,
  ProviderTrust,
  StatGroup,
} from "@aptap/design-system";
import { formatSpeed } from "@aptap/design-system";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { PROVIDERS, providerLogo } from "../data/providers";
import { availableDealsFor } from "../lib/availability";
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

  const logo = providerLogo(deal.provider);
  const comparing = state.compareIds.includes(deal.id);

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
    <div>
      <Header />

      <div className="ap-container" style={{ paddingTop: "var(--ap-spacing-6)" }}>
        <BackLink onClick={() => navigate("/deals")}>Back to deals</BackLink>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start"
          style={{ marginTop: "var(--ap-spacing-4)" }}
        >
          <div className="ap-stack ap-stack--section">
            <DealCard
              deal={deal}
              variant="featured"
              hero
              eyebrow={recommendedMatch?.reasonLabel ?? "Deal details"}
              fit={recommendedMatch?.greatFor}
              logoSrc={logo.src}
              logoFill={logo.fill}
              headingLevel={2}
            />

            <Panel title="Pricing transparency">
              <PriceTimeline deal={deal} />
            </Panel>

            <Panel title="Exit fee check">
              <ExitFeeCheck known={!!knownCurrentProvider}>
                {knownCurrentProvider
                  ? `You told us you're with ${knownCurrentProvider}. When you switch, we'll confirm your contract end date and flag any exit fee before you commit to anything.`
                  : "Tell us in the next step and we'll flag if you look like you're still in contract — it won't stop you from continuing now."}
              </ExitFeeCheck>
            </Panel>

            <Panel title="More about this deal">
              <StatGroup
                items={[
                  { label: "Upload speed", value: formatSpeed(deal.upload_mbps) },
                  ...(deal.guaranteed_mbps != null
                    ? [{ label: "Guaranteed minimum speed", value: formatSpeed(deal.guaranteed_mbps) }]
                    : []),
                ]}
              />
              {deal.setup_note && <p className="ap-muted">{deal.setup_note}</p>}
              <a className="ap-text-body-sm" href={deal.source_url} target="_blank" rel="noopener noreferrer">
                View this offer on {PROVIDERS[deal.provider].name}'s website ↗
              </a>
            </Panel>

            <Panel title="Why this provider">
              <ProviderTrust deal={deal} tags={["14-day cooling-off period", "Barclays partner marketplace"]} />
            </Panel>
          </div>

          <div style={{ position: "sticky", top: "var(--ap-spacing-6)" }} className="ap-stack ap-stack--sm">
            <DealSummary deal={deal} onContinue={handleContinue} continueLabel="Continue to switch" />
            <Button block variant="secondary" onClick={() => toggleCompare(deal.id)}>
              {comparing ? "Remove from compare" : "Add to compare"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
