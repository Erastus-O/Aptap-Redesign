import { CompareTable, firstYearCost } from "@aptap/design-system";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { providerLogo } from "../data/providers";
import { useAppState } from "../store/AppState";
import type { Deal } from "../types";

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

  function handleChoose(deal: { id: string }) {
    chooseDeal(deal.id);
    navigate("/switch");
  }

  return (
    <div>
      <Header />
      <div className="ap-container">
        <div className="ap-panel">
          <p className="ap-panel__eyebrow">Compare deals</p>
          <div className="ap-cluster" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <h1 className="ap-text-h2">{deals.length} deals side by side</h1>
            <button type="button" className="ap-back-link" onClick={() => navigate("/deals")}>
              Back to deals
            </button>
          </div>
          <p className="ap-muted">
            The highlighted column shows the best value by estimated first-year cost, not just the headline
            price.
          </p>

          <CompareTable
            deals={deals}
            highlightId={[...deals].sort((a, b) => firstYearCost(a).total - firstYearCost(b).total)[0]?.id}
            logo={(provider) => providerLogo(provider as Deal["provider"]).src}
            onChoose={handleChoose}
            onRemove={(d) => toggleCompare(d.id)}
            caption={`Comparison of ${deals.length} broadband deals`}
          />
        </div>
      </div>
    </div>
  );
}
