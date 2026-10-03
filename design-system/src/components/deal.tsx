/**
 * BROADBAND ORGANISMS — every card in the ApTap interface, rebuilt on tokens.
 *
 *   Interface element                          → Component
 *   "Recommended for you" dark card            → <DealCard variant="featured">  (+ <DealCarousel>)
 *   "Other deals you could explore" card       → <DealCard variant="list">
 *   Deal detail hero (dark)                    → <DealCard variant="featured" hero>
 *   "Pricing transparency"                     → <PriceTimeline>
 *   "Exit fee check"                           → <ExitFeeCheck>
 *   "Why this provider"                        → <ProviderTrust>
 *   Detail-page summary + "Continue to switch" → <DealSummary>
 *   "SELECTED BROADBAND" (switch flow)         → <SelectedDeal>
 *   "2 deals side by side"                     → <CompareTable>
 *   Sticky "2 of 3 selected · Compare (2)"     → <CompareTray>
 *
 * Pattern: Understand → Compare → Trust → Choose → Switch.
 */
import type { CSSProperties, ReactNode } from "react";
import { Avatar, Button, Pill, cx } from "./atoms";
import { Gift, Info, Lock, TrendingUp, X } from "./icons";
import {
  type Deal, contractTotal, dealMeta, firstYearCost, formatContract, formatGBP, formatMonthYear, formatSetup, formatSpeed,
  getPriceStory, speedFit, technologyLabel, totalIsKnown,
} from "../lib/deal";

/* ---------------- small building blocks ---------------- */

/** Avatar + deal name + "Provider · Technology". */
export function Identity({ deal, logoSrc, logoFill, size = "md", headingLevel = 3, id }: { deal: Deal; logoSrc?: string; logoFill?: boolean; size?: "md" | "lg"; headingLevel?: 2 | 3 | 4; id?: string }) {
  const H = `h${headingLevel}` as const;
  return (
    <div className={cx("ap-identity", size === "lg" && "ap-identity--lg")}>
      <Avatar provider={deal.provider} src={logoSrc} fill={logoFill} />
      <div className="ap-identity__text">
        <H className="ap-identity__name" id={id}>{deal.name}</H>
        <span className="ap-identity__meta">{dealMeta(deal)}</span>
      </div>
    </div>
  );
}

/** Label-above-value stat group: Speed · Monthly price · Contract (· Setup fee). */
export function StatGroup({ items, grid }: { items: Array<{ label: string; value: ReactNode }>; grid?: boolean }) {
  return (
    <dl className={cx("ap-stats", grid && "ap-stats--grid")}>
      {items.map((it) => <div key={it.label}><dt>{it.label}</dt><dd>{it.value}</dd></div>)}
    </dl>
  );
}

/** The price-change pill. ALWAYS rendered on a deal card (Consumer Duty: no headline price without its future). */
export function PricePill({ deal }: { deal: Deal }) {
  const s = getPriceStory(deal);
  const tone = s.tone === "rise" ? "rise" : s.tone === "fixed" ? "fixed" : "neutral";
  const Icon = s.tone === "rise" ? TrendingUp : s.tone === "fixed" ? Lock : Info;
  return <Pill tone={tone} icon={<Icon size="xs" />} title={s.summary}>{s.pill}</Pill>;
}

/** Reward / incentive pill — only when the deal actually has one. */
export function PerkPill({ deal }: { deal: Deal }) {
  return deal.reward ? <Pill tone="perk" icon={<Gift size="xs" />}>{deal.reward}</Pill> : null;
}

/* ---------------- DealCard ---------------- */
export interface DealCardProps {
  deal: Deal;
  /** featured = dark recommended card (carousel, detail hero). list = white card in "Other deals". */
  variant?: "featured" | "list";
  /** Eyebrow on featured cards — must describe a real, checkable property: "Best value for you", "Fastest at your address", "Most flexible contract". */
  eyebrow?: string;
  /**
   * "Why we recommend it" — REQUIRED on featured cards (warns in dev).
   * Generated from real matching logic over quote inputs; never invented personalisation.
   */
  reason?: string;
  /** Override the default speed-based "Great for" copy. */
  fit?: string;
  logoSrc?: string;
  logoFill?: boolean;
  onChoose?: (deal: Deal) => void;
  onDetails?: (deal: Deal) => void;
  comparing?: boolean;
  onCompareChange?: (deal: Deal, next: boolean) => void;
  unavailable?: boolean;
  /** Detail-page hero: featured surface only, no actions, adds setup fee stat. */
  hero?: boolean;
  headingLevel?: 2 | 3;
  className?: string;
  style?: CSSProperties;
}

export function DealCard(props: DealCardProps) {
  const { deal, variant = "list" } = props;
  if (variant === "featured" && !props.reason && !props.hero && (import.meta as { env?: { DEV?: boolean } }).env?.DEV)
    console.warn(`[DealCard] featured deal ${deal.id} has no reason — recommendations must explain themselves.`);
  return variant === "featured" ? <FeaturedDealCard {...props} /> : <ListDealCard {...props} />;
}

function CompareToggle({ deal, comparing, onCompareChange }: Pick<DealCardProps, "deal" | "comparing" | "onCompareChange">) {
  if (!onCompareChange) return null;
  return (
    <label className="ap-choice ap-deal-card__compare">
      <input type="checkbox" className="ap-choice__control" checked={!!comparing} onChange={(e) => onCompareChange(deal, e.target.checked)} />
      <span className="ap-choice__label">Compare deals<span className="ap-visually-hidden">: {deal.provider} {deal.name}</span></span>
    </label>
  );
}

function FeaturedDealCard({ deal, eyebrow = "Recommended for you", reason, fit, logoSrc, logoFill, onChoose, onDetails, comparing, onCompareChange, hero, headingLevel = 3, className, style }: DealCardProps) {
  const titleId = `deal-${deal.id}-title`;
  const greatFor = fit ?? speedFit(deal.download_mbps);
  const stats = [
    { label: "Speed", value: deal.download_mbps != null ? formatSpeed(deal.download_mbps) : "Varies" },
    { label: "Contract", value: formatContract(deal.contract_months) },
    ...(hero ? [{ label: "Setup fee", value: formatSetup(deal) }] : []),
  ];
  return (
    <article className={cx("ap-deal-card ap-deal-card--featured", className)} style={style} aria-labelledby={titleId}>
      <div className="ap-deal-card__feature ap-on-feature">
        <div className="ap-deal-card__top">
          <span className="ap-deal-card__eyebrow">{eyebrow}</span>
          <CompareToggle deal={deal} comparing={comparing} onCompareChange={onCompareChange} />
        </div>
        <Identity deal={deal} logoSrc={logoSrc} logoFill={logoFill} size="lg" headingLevel={headingLevel} id={titleId} />
        {greatFor && <p className="ap-deal-card__fit">Great for {greatFor.charAt(0).toLowerCase() + greatFor.slice(1)}.</p>}
        {reason && !hero && <div className="ap-deal-card__why"><span className="ap-deal-card__why-title">Why we recommend it</span>{reason}</div>}
        {!hero && (
          <div>
            <span className="ap-deal-card__label">Monthly price</span>
            <div className="ap-deal-card__price">{formatGBP(deal.monthly_price)}<span className="ap-deal-card__price-period">a month</span></div>
          </div>
        )}
        <StatGroup items={stats} />
        <div className="ap-pills"><PerkPill deal={deal} /><PricePill deal={deal} /></div>
      </div>
      {!hero && (onChoose || onDetails) && (
        <div className="ap-deal-card__actions">
          {onChoose && <Button block onClick={() => onChoose(deal)} aria-describedby={titleId}>Choose the deal</Button>}
          {onDetails && <Button block variant="secondary" onClick={() => onDetails(deal)}>View full details<span className="ap-visually-hidden">: {deal.provider} {deal.name}</span></Button>}
        </div>
      )}
    </article>
  );
}

function ListDealCard({ deal, logoSrc, logoFill, onChoose, onDetails, comparing, onCompareChange, unavailable, headingLevel = 3, className, style }: DealCardProps) {
  const titleId = `deal-${deal.id}-title`;
  return (
    <article className={cx("ap-deal-card ap-deal-card--list", unavailable && "ap-deal-card--unavailable", className)} style={style} aria-labelledby={titleId}>
      <div className="ap-deal-card__row">
        <div className="ap-deal-card__identity-group">
          <Identity deal={deal} logoSrc={logoSrc} logoFill={logoFill} headingLevel={headingLevel} id={titleId} />
          {!unavailable && <div className="ap-deal-card__meta-pills"><PerkPill deal={deal} /><PricePill deal={deal} /></div>}
        </div>
        {unavailable ? (
          <p className="ap-deal-card__unavailable">Not available at this address</p>
        ) : (
          <>
            <StatGroup grid items={[
              { label: "Speed", value: deal.download_mbps != null ? formatSpeed(deal.download_mbps) : "Varies" },
              { label: "Monthly price", value: formatGBP(deal.monthly_price) },
              { label: "Contract", value: formatContract(deal.contract_months) },
            ]} />
            <div className="ap-deal-card__actions">
              {onDetails && <Button variant="secondary" size="sm" onClick={() => onDetails(deal)}>View full details<span className="ap-visually-hidden">: {deal.provider} {deal.name}</span></Button>}
              {onChoose && <Button size="sm" onClick={() => onChoose(deal)} aria-describedby={titleId}>Choose the deal</Button>}
            </div>
          </>
        )}
      </div>
      {(onCompareChange || deal.offer_ends) && !unavailable && (
        <div className="ap-cluster" style={{ justifyContent: "space-between", marginTop: "var(--ap-spacing-3)" }}>
          <CompareToggle deal={deal} comparing={comparing} onCompareChange={onCompareChange} />
          {deal.offer_ends && <span className="ap-deal-card__offer">Offer ends {new Date(deal.offer_ends).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
        </div>
      )}
    </article>
  );
}

/* ---------------- PriceBlock (kept for custom layouts) ---------------- */
export function PriceBlock({ deal, size = "lg", showTotal = false }: { deal: Deal; size?: "md" | "lg" | "xl"; showTotal?: boolean }) {
  const story = getPriceStory(deal);
  const total = showTotal ? contractTotal(deal) : null;
  const tone = story.tone;
  const StoryIcon = tone === "rise" ? TrendingUp : tone === "fixed" ? Lock : Info;
  return (
    <div className={cx("ap-price", size !== "lg" && `ap-price--${size}`)}>
      <div className="ap-price__main">
        <span className="ap-price__amount">{formatGBP(deal.monthly_price)}</span>
        <span className="ap-price__period">a month</span>
      </div>
      <p className={cx("ap-price__note", `ap-price__note--${tone}`)}><StoryIcon size="sm" /><span>{story.summary}</span></p>
      {total?.known && (
        <p className="ap-price__note ap-price__note--neutral">
          <span>{formatGBP(total.total)} over {deal.contract_months} months{total.includesSetup ? "" : " (excluding any setup fee)"}</span>
        </p>
      )}
    </div>
  );
}

/* ---------------- PriceTimeline ("Pricing transparency") ---------------- */
/**
 * Now → next price → first-year cost. Built only from published data:
 * dated rises → one row per price; provider note only → the note verbatim with a "May change" pill; rolling → "No fixed term".
 */
export function PriceTimeline({ deal }: { deal: Deal }) {
  const rises = [...deal.price_rises].sort((a, b) => a.from.localeCompare(b.from));
  const fy = firstYearCost(deal);
  return (
    <div className="ap-inset ap-price-timeline">
      <div className="ap-price-timeline__row">
        <div>
          <span className="ap-price-timeline__when">{rises.length ? `Now until ${formatMonthYear(rises[0].from)}` : deal.contract_months > 1 ? `For your ${deal.contract_months}-month contract` : "Each month"}</span>
          <div className="ap-price-timeline__amount">{formatGBP(deal.monthly_price)}<small>/month</small></div>
        </div>
        {deal.price_fixed && <Pill tone="fixed" icon={<Lock size="xs" />}>Price fixed</Pill>}
      </div>
      {rises.map((r) => (
        <div className="ap-price-timeline__row" key={r.from}>
          <div>
            <span className="ap-price-timeline__when">From {formatMonthYear(r.from)}</span>
            <div className="ap-price-timeline__amount ap-price-timeline__amount--rise">{formatGBP(r.monthly_price)}<small>/month</small></div>
          </div>
          <Pill tone="rise" icon={<TrendingUp size="xs" />}>Price rise</Pill>
        </div>
      ))}
      {!rises.length && !deal.price_fixed && deal.contract_months > 1 && (
        <div className="ap-price-timeline__row">
          <p className="ap-price-timeline__note">{deal.price_rise_note ?? "The provider hasn't published future prices. Check before you switch."}</p>
          <Pill icon={<Info size="xs" />}>May change</Pill>
        </div>
      )}
      {deal.out_of_contract_price != null && (
        <div className="ap-price-timeline__row">
          <span className="ap-price-timeline__when">After the contract ends</span>
          <span className="ap-price-timeline__amount">{formatGBP(deal.out_of_contract_price)}<small>/month</small></span>
        </div>
      )}
      <div className="ap-price-timeline__row">
        <p className="ap-price-timeline__note">
          {fy.known ? <>Estimated first-year cost: <strong>{formatGBP(fy.total)}</strong></> : <>First year at today's price: <strong>{formatGBP(fy.total)}</strong> — could be higher if prices change</>}
        </p>
      </div>
    </div>
  );
}

/* ---------------- ExitFeeCheck ---------------- */
export function ExitFeeCheck({ known = false, children }: { known?: boolean; children?: ReactNode }) {
  return (
    <div className="ap-callout" role="note">
      <strong className="ap-callout__title">{known ? "We'll check your exit fee" : "We don't know who you're with yet"}</strong>
      {children ?? "Tell us in the next step and we'll flag if you look like you're still in contract. It won't stop you continuing."}
    </div>
  );
}

/* ---------------- ProviderTrust ("Why this provider") ---------------- */
/** Rating appears ONLY with licensed, current review data (PRD E2-4). Trust tags must each be true for this deal. */
export function ProviderTrust({ deal, tags }: { deal: Deal; tags: string[] }) {
  return (
    <div className="ap-inset ap-trust">
      {deal.rating ? (
        <>
          <div className="ap-trust__score"><strong>{deal.rating.score.toFixed(1)}</strong><span>{deal.rating.count.toLocaleString("en-GB")} reviews</span></div>
          <p className="ap-trust__text">Rating from {deal.provider} customers on {deal.rating.source}.</p>
        </>
      ) : (
        <p className="ap-trust__text">We don't have verified reviews for {deal.provider} yet.</p>
      )}
      {tags.length > 0 && <div className="ap-pills">{tags.map((t) => <Pill key={t} tone="trust">{t}</Pill>)}</div>}
    </div>
  );
}

/* ---------------- DealSummary (detail page checkout card) ---------------- */
export function DealSummary({ deal, onContinue, onRemove, continueLabel = "Continue to switch" }: { deal: Deal; onContinue: (d: Deal) => void; onRemove?: (d: Deal) => void; continueLabel?: string }) {
  const s = getPriceStory(deal);
  const fy = firstYearCost(deal);
  return (
    <section className="ap-panel" aria-label={`Summary: ${deal.provider} ${deal.name}`}>
      <div>
        <p className="ap-deal-summary__heading">{deal.provider} · {deal.name}</p>
        <div className="ap-deal-summary__price">{formatGBP(deal.monthly_price)}<small> a month</small></div>
        <p className={cx("ap-deal-summary__story", s.tone === "rise" ? "ap-deal-summary__story--rise" : "ap-deal-summary__story--neutral")}>{s.summary}</p>
      </div>
      <hr className="ap-panel__divider" />
      <dl className="ap-kv">
        <div><dt>Speed</dt><dd>{formatSpeed(deal.download_mbps)}</dd></div>
        <div><dt>Contract</dt><dd>{formatContract(deal.contract_months)}</dd></div>
        <div><dt>Setup fee</dt><dd>{formatSetup(deal)}</dd></div>
        <div><dt>{fy.known ? "Est. first year" : "First year at today's price"}</dt><dd>{formatGBP(fy.total)}</dd></div>
      </dl>
      <div className="ap-deal-card__actions">
        <Button block onClick={() => onContinue(deal)}>{continueLabel}</Button>
        {onRemove && <Button block variant="secondary" onClick={() => onRemove(deal)}>Remove from compare</Button>}
      </div>
    </section>
  );
}

/* ---------------- SelectedDeal (switch flow) ---------------- */
export function SelectedDeal({ deal, logoSrc, logoFill, onChange }: { deal: Deal; logoSrc?: string; logoFill?: boolean; onChange: () => void }) {
  return (
    <section className="ap-panel" aria-labelledby="selected-deal-title">
      <span className="ap-panel__eyebrow">Selected broadband</span>
      <div className="ap-selected-deal__top">
        <Identity deal={deal} logoSrc={logoSrc} logoFill={logoFill} size="lg" headingLevel={2} id="selected-deal-title" />
        <PerkPill deal={deal} />
      </div>
      <div className="ap-pills"><PricePill deal={deal} /></div>
      <div><Button variant="tertiary" size="sm" onClick={onChange}>Change deal</Button></div>
      <StatGroup grid items={[
        { label: "Speed", value: formatSpeed(deal.download_mbps) },
        { label: "Monthly price", value: formatGBP(deal.monthly_price) },
        { label: "Contract", value: formatContract(deal.contract_months) },
      ]} />
    </section>
  );
}

/* ---------------- CompareTray ---------------- */
export function CompareTray({ deals, max = 3, onRemove, onCompare }: { deals: Deal[]; max?: number; onRemove: (d: Deal) => void; onCompare: () => void }) {
  if (!deals.length) return null;
  return (
    <div className="ap-compare-tray" role="region" aria-label="Deals to compare"><div className="ap-compare-tray__inner">
      <span className="ap-compare-tray__count" aria-live="polite">{deals.length} of {max} selected</span>
      <div className="ap-compare-tray__tags">
        {deals.map((d) => (
          <span key={d.id} className="ap-compare-tray__tag">{d.name}
            <button type="button" className="ap-compare-tray__remove" aria-label={`Remove ${d.provider} ${d.name} from compare`} onClick={() => onRemove(d)}><X /></button>
          </span>
        ))}
      </div>
      <Button onClick={onCompare} disabled={deals.length < 2}>{deals.length < 2 ? "Pick one more to compare" : `Compare (${deals.length})`}</Button>
    </div></div>
  );
}

/* ---------------- CompareTable ---------------- */
type Ranked = { value: ReactNode; score?: number | null };
type Row = { label: string; hint?: string; cell: (d: Deal) => Ranked; best?: "min" | "max"; show?: (ds: Deal[]) => boolean };

const ROWS: Row[] = [
  { label: "Monthly price", cell: (d) => ({ value: formatGBP(d.monthly_price), score: d.monthly_price }), best: "min" },
  { label: "Price after promo", cell: (d) => {
      const s = getPriceStory(d);
      if (s.kind === "rise") { const r = d.price_rises[0]; return { value: `${formatGBP(r.monthly_price)} from ${formatMonthYear(r.from)}` }; }
      if (s.kind === "fixed") return { value: "No change" };
      if (s.kind === "rolling") return { value: "No fixed term" };
      return { value: <span className="ap-compare__muted">{s.pill}</span> };
    } },
  { label: "Est. first-year cost", hint: "Monthly price × 12, plus any published rise in the first year", cell: (d) => {
      const fy = firstYearCost(d);
      return fy.known ? { value: formatGBP(fy.total), score: fy.total } : { value: <span className="ap-compare__muted">From {formatGBP(fy.total)}</span>, score: null };
    }, best: "min" },
  { label: "Total over contract", cell: (d) => totalIsKnown(d) && d.setup_fee != null ? { value: formatGBP(contractTotal(d).total), score: contractTotal(d).total } : { value: <span className="ap-compare__muted">Can't calculate</span>, score: null }, best: "min" },
  { label: "Download speed", cell: (d) => ({ value: formatSpeed(d.download_mbps), score: d.download_mbps }), best: "max" },
  { label: "Contract length", cell: (d) => ({ value: formatContract(d.contract_months) }) },
  { label: "Setup fee", cell: (d) => ({ value: formatSetup(d) }) },
  { label: "Connection", cell: (d) => ({ value: technologyLabel[d.technology] }) },
  { label: "Incentive", cell: (d) => ({ value: d.reward ?? "—" }) },
  { label: "Customer rating", show: (ds) => ds.some((d) => d.rating), cell: (d) => d.rating ? { value: `${d.rating.score.toFixed(1)} · ${d.rating.count.toLocaleString("en-GB")} reviews`, score: d.rating.score } : { value: "—", score: null }, best: "max" },
];

function bestId(deals: Deal[], row: Row): string | null {
  if (!row.best) return null;
  const xs = deals.map((d) => [d.id, row.cell(d).score] as const).filter(([, v]) => v != null) as Array<readonly [string, number]>;
  if (xs.length < 2) return null;
  const target = row.best === "min" ? Math.min(...xs.map(([, v]) => v)) : Math.max(...xs.map(([, v]) => v));
  const winners = xs.filter(([, v]) => v === target);
  return winners.length === 1 ? winners[0][0] : null;
}

/**
 * Interface "N deals side by side". Column headers are mini cards; `highlightId` tints the recommended column with "Best value".
 * Best cells: green tint + the word "Best" (never colour alone). Totals rank only on fully published prices.
 * Below 560px the attribute label moves above each row so all 2–3 columns fit without horizontal scrolling.
 */
export function CompareTable({ deals, highlightId, logo, onChoose, onRemove, caption }: {
  deals: Deal[]; highlightId?: string; logo?: (provider: string) => string | undefined;
  onChoose?: (d: Deal) => void; onRemove?: (d: Deal) => void; caption?: string;
}) {
  const rows = ROWS.filter((r) => !r.show || r.show(deals));
  return (
    <div className="ap-compare-wrap" style={{ ["--ap-compare-cols" as string]: deals.length } as CSSProperties}>
      <table className="ap-compare" role="table">
        {caption && <caption className="ap-visually-hidden">{caption}</caption>}
        <thead role="rowgroup">
          <tr role="row">
            <td className="ap-compare__corner" />
            {deals.map((d) => (
              <th key={d.id} scope="col" role="columnheader" className={cx("ap-compare__col", d.id === highlightId && "ap-compare__col--highlight")}>
                <div className="ap-compare__col-inner">
                  <span className="ap-compare__col-label">{d.id === highlightId ? "Best value" : ""}</span>
                  <Avatar provider={d.provider} src={logo?.(d.provider)} />
                  <span className="ap-compare__col-name">{d.name}</span>
                  <span className="ap-compare__col-provider">{d.provider}</span>
                  {onChoose && <Button size="sm" onClick={() => onChoose(d)}>Choose<span className="ap-visually-hidden"> {d.provider} {d.name}</span></Button>}
                  {onRemove && <Button variant="link" onClick={() => onRemove(d)} style={{ fontSize: "var(--ap-type-caption-size)" }}>Remove<span className="ap-visually-hidden"> {d.name}</span></Button>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((r) => {
            const best = bestId(deals, r);
            return (
              <tr key={r.label} role="row">
                <th scope="row" role="rowheader">{r.label}{r.hint && <span className="ap-compare__hint">{r.hint}</span>}</th>
                {deals.map((d) => (
                  <td key={d.id} role="cell" data-best={best === d.id || undefined}>
                    {r.cell(d).value}{best === d.id && <span className="ap-compare__best">Best</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Reassurance, StickyCTA, QuoteSummary (unchanged API) ---------------- */
export interface ReassuranceItem { icon: ReactNode; title: string; text: ReactNode }

export function Reassurance({ title = "Before you switch", items, grid }: { title?: string; items: ReassuranceItem[]; grid?: boolean }) {
  return (
    <section aria-labelledby="reassurance-title" className="ap-stack">
      <h2 id="reassurance-title" className="ap-text-h2">{title}</h2>
      <ul className={cx("ap-reassurance", grid && "ap-reassurance--grid")}>
        {items.map((it) => (
          <li key={it.title} className="ap-reassurance__item">
            <span className="ap-reassurance__icon" aria-hidden="true">{it.icon}</span>
            <div><p className="ap-reassurance__title">{it.title}</p><p className="ap-reassurance__text">{it.text}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StickyCTA({ deal, label = "Choose the deal", onChoose }: { deal: Deal; label?: string; onChoose: (d: Deal) => void }) {
  return (
    <div className="ap-sticky-cta">
      <div className="ap-sticky-cta__summary">
        <strong>{formatGBP(deal.monthly_price)} a month</strong>
        <span className="ap-muted">{deal.provider} · {deal.name}</span>
      </div>
      <Button onClick={() => onChoose(deal)}>{label}</Button>
    </div>
  );
}

export function QuoteSummary({ summary, onEdit }: { summary: string; onEdit: () => void }) {
  return (
    <div className="ap-quote-summary">
      <span><span className="ap-muted">Based on: </span>{summary}</span>
      <Button variant="link" onClick={onEdit}>Edit<span className="ap-visually-hidden"> your answers</span></Button>
    </div>
  );
}
