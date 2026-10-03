/**
 * MARKETPLACE ORGANISMS — page chrome and section containers from the ApTap interface.
 *
 *   Interface element                                   → Component
 *   "← Go back to marketplace" + "APTAP in partnership" → <PartnerHeader>
 *   "← Back to deals"                                   → <BackLink>
 *   Dark hero + postcode box                            → <HeroSearch>
 *   "Select address · 5 addresses found"                → <AddressPicker>
 *   "Top dealers" tiles                                  → <DealerTile> in .ap-dealer-grid
 *   White section blocks                                 → <Panel>
 *   "Your broadband deals around you"                    → <ResultsSummary>
 *   "Providers · 5 selected · Clear"                     → <ProviderFilter>
 *   "All · Cheapest · Fastest · Best for streaming"      → <ChipGroup>
 *   "Recommended for you" slider                         → <DealCarousel>
 *   "Step 1 of 3 — Your current setup"                   → <StepProgress>
 */
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Avatar, Button, cx } from "./atoms";
import { ChevronLeft, ChevronRight, Pencil, X } from "./icons";

/* ---------------- Panel ---------------- */
export function Panel({ title, subtitle, eyebrow, action, titleSize = "md", as: As = "section", children, className, id }: {
  title?: ReactNode; subtitle?: ReactNode; eyebrow?: string; action?: ReactNode; titleSize?: "md" | "sm";
  as?: "section" | "div" | "aside"; children?: ReactNode; className?: string; id?: string;
}) {
  const hid = useId();
  return (
    <As className={cx("ap-panel", className)} aria-labelledby={title ? hid : undefined} id={id}>
      {(title || action || eyebrow) && (
        <header className="ap-panel__header">
          <div className="ap-panel__titles">
            {eyebrow && <span className="ap-panel__eyebrow">{eyebrow}</span>}
            {title && <h2 id={hid} className={cx("ap-panel__title", titleSize === "sm" && "ap-panel__title--sm")}>{title}</h2>}
            {subtitle && <p className="ap-panel__subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </As>
  );
}

/* ---------------- PartnerHeader ---------------- */
/** Required on every screen: a visible way back (no native chrome inside a banking webview) + the co-brand lockup. */
export function PartnerHeader({ onBack, backLabel = "Go back to marketplace", aptapLogo, partnerName, partnerLogo }: {
  onBack: () => void; backLabel?: string; aptapLogo?: string; partnerName: string; partnerLogo?: string;
}) {
  return (
    <header className="ap-partner-header"><div className="ap-partner-header__inner">
      <Button variant="secondary" size="sm" iconStart={<ChevronLeft size="sm" />} onClick={onBack}>{backLabel}</Button>
      <div className="ap-lockup">
        <span className="ap-lockup__brand">{aptapLogo && <img src={aptapLogo} alt="" />}<span className="ap-lockup__wordmark">APTAP</span></span>
        <span className="ap-lockup__with">in partnership with</span>
        <span className="ap-lockup__partner">{partnerLogo ? <img src={partnerLogo} alt={partnerName} /> : <span className="ap-lockup__partner-name">{partnerName}</span>}</span>
      </div>
    </div></header>
  );
}

export function BackLink({ children = "Back to deals", onClick, href }: { children?: ReactNode; onClick?: () => void; href?: string }) {
  const inner = <><ChevronLeft size="sm" />{children}</>;
  return href ? <a className="ap-back-link" href={href}>{inner}</a> : <button type="button" className="ap-back-link" onClick={onClick}>{inner}</button>;
}

/* ---------------- HeroSearch + AddressPicker ---------------- */
export function HeroSearch({ eyebrow = "Broadband marketplace", title, lede, onSearch, initialPostcode = "", children }: {
  eyebrow?: string; title: string; lede?: string; onSearch: (postcode: string) => void; initialPostcode?: string; children?: ReactNode;
}) {
  const [pc, setPc] = useState(initialPostcode);
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(pc.trim())) { setErr("Enter a UK postcode, like M1 1AE"); return; }
    setErr(null); onSearch(pc.trim().toUpperCase());
  };
  return (
    <section className="ap-hero-search" aria-labelledby={`${id}-t`}>
      <p className="ap-hero-search__eyebrow">{eyebrow}</p>
      <h1 id={`${id}-t`} className="ap-hero-search__title">{title}</h1>
      {lede && <p className="ap-hero-search__lede">{lede}</p>}
      <div className="ap-hero-search__anchor">
        <form className="ap-search-box" onSubmit={submit} noValidate>
          <label htmlFor={`${id}-pc`} className="ap-visually-hidden">Postcode</label>
          <input id={`${id}-pc`} className="ap-input" placeholder="Enter your postcode" autoComplete="postal-code" value={pc}
            onChange={(e) => setPc(e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={err ? `${id}-err` : undefined} />
          <Button type="submit">Check for availability</Button>
        </form>
        {err && <p id={`${id}-err`} role="alert" className="ap-hero-search__lede">{err}</p>}
        {children}
      </div>
    </section>
  );
}

export function AddressPicker({ postcode, addresses, onSelect, onClose }: { postcode: string; addresses: string[]; onSelect: (a: string) => void; onClose: () => void }) {
  const id = useId();
  return (
    <div className="ap-address-picker" role="dialog" aria-labelledby={`${id}-t`}>
      <div className="ap-address-picker__header">
        <div>
          <h2 id={`${id}-t`} className="ap-text-h4">Select address</h2>
          <p className="ap-text-caption ap-subtle">{addresses.length} addresses found around {postcode}</p>
        </div>
        <Button variant="secondary" size="sm" iconOnly aria-label="Close address list" onClick={onClose} style={{ minHeight: 32, width: 32, minWidth: 32 }}><X size="sm" /></Button>
      </div>
      <ul className="ap-address-picker__list">
        {addresses.map((a) => <li key={a}><button type="button" className="ap-address-picker__option" onClick={() => onSelect(a)}>{a}</button></li>)}
      </ul>
    </div>
  );
}

/* ---------------- DealerTile ---------------- */
export function DealerTile({ provider, logoSrc, logoFill, onView }: { provider: string; logoSrc?: string; logoFill?: boolean; onView: () => void }) {
  return (
    <div className="ap-dealer-tile">
      <Avatar provider={provider} src={logoSrc} size="lg" fill={logoFill} />
      <span className="ap-dealer-tile__name">{provider}</span>
      <Button size="sm" onClick={onView}>View deals<span className="ap-visually-hidden"> from {provider}</span></Button>
    </div>
  );
}

/* ---------------- ResultsSummary ---------------- */
export function ResultsSummary({ title = "Your broadband deals around you", address, network, onEdit }: { title?: string; address: string; network?: string; onEdit: () => void }) {
  return (
    <section className="ap-panel">
      <div className="ap-results-summary">
        <div className="ap-stack ap-stack--sm" style={{ gap: "var(--ap-spacing-1)" }}>
          <h1 className="ap-results-summary__title">{title}</h1>
          <p className="ap-results-summary__address">{address}</p>
          {network && <p className="ap-results-summary__network">{network}</p>}
        </div>
        <div><Button variant="tertiary" size="sm" iconEnd={<Pencil size="sm" />} onClick={onEdit}>Edit your answers</Button></div>
      </div>
    </section>
  );
}

/* ---------------- ProviderFilter ---------------- */
export function ProviderFilter({ providers, selected, onChange }: { providers: string[]; selected: string[]; onChange: (next: string[]) => void }) {
  const id = useId();
  const toggle = (p: string) => onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p]);
  return (
    <Panel title="Providers" titleSize="sm">
      <div className="ap-filter-summary">
        <span className="ap-filter-summary__count" aria-live="polite">{selected.length} selected</span>
        {selected.length > 0
          ? <Button variant="link" onClick={() => onChange([])}>Clear<span className="ap-visually-hidden"> provider filters</span></Button>
          : <Button variant="link" onClick={() => onChange(providers)}>Select all</Button>}
      </div>
      <fieldset className="ap-fieldset">
        <legend className="ap-visually-hidden">Show deals from</legend>
        <ul className="ap-filter-list">
          {providers.map((p) => (
            <li key={p}><label className="ap-choice"><input id={`${id}-${p}`} type="checkbox" className="ap-choice__control" checked={selected.includes(p)} onChange={() => toggle(p)} /><span className="ap-choice__label">{p}</span></label></li>
          ))}
        </ul>
      </fieldset>
    </Panel>
  );
}

/* ---------------- ChipGroup ---------------- */
/** Single-select presets. radiogroup semantics: one tab stop, arrow keys move selection. Selected = inverse pill. */
export function ChipGroup<T extends string>({ label, options, value, onChange }: { label: string; options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return; e.preventDefault();
    const n = (i + d + options.length) % options.length; onChange(options[n].value); refs.current[n]?.focus();
  };
  return (
    <div className="ap-chip-group" role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button key={o.value} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" className="ap-chip"
          aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- DealCarousel ---------------- */
/**
 * Scroll-snap carousel for featured deals. Swipe on touch, arrows + dots elsewhere.
 * Slides peek on mobile so it's obvious there's more; 2 up ≥768px, 3 up ≥1200px.
 * WAI-ARIA carousel: region with roledescription, each slide a labelled group; no autoplay.
 */
export function DealCarousel({ label = "Recommended deals", children }: { label?: string; children: ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = children.length;
  useEffect(() => {
    const el = track.current; if (!el) return;
    const onScroll = () => {
      const slides = [...el.children] as HTMLElement[];
      const left = el.scrollLeft;
      let best = 0; slides.forEach((s, i) => { if (Math.abs(s.offsetLeft - el.offsetLeft - left) < Math.abs(slides[best].offsetLeft - el.offsetLeft - left)) best = i; });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const go = (i: number) => {
    const el = track.current; if (!el) return;
    const s = el.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement;
    el.scrollTo({ left: s.offsetLeft - el.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <div className="ap-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="ap-carousel__track" ref={track} tabIndex={0} aria-live="polite">
        {children.map((c, i) => <div key={i} className="ap-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>{c}</div>)}
      </div>
      {count > 1 && (
        <div className="ap-carousel__controls">
          <button type="button" className="ap-carousel__arrow" aria-label="Previous deal" onClick={() => go(index - 1)} disabled={index === 0}><ChevronLeft /></button>
          <div className="ap-carousel__dots">
            {children.map((_, i) => <button key={i} type="button" className="ap-carousel__dot" aria-label={`Go to deal ${i + 1}`} aria-current={i === index} onClick={() => go(i)} />)}
          </div>
          <button type="button" className="ap-carousel__arrow" aria-label="Next deal" onClick={() => go(index + 1)} disabled={index === count - 1}><ChevronRight /></button>
        </div>
      )}
    </div>
  );
}

/* ---------------- StepProgress ---------------- */
export function StepProgress({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="ap-step-progress">
      <p className="ap-step-progress__label"><strong>Step {current} of {total}</strong> — {label}</p>
      <div className="ap-step-progress__bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-valuetext={`Step ${current} of ${total}: ${label}`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className="ap-step-progress__seg" data-done={i < current || undefined} />)}
      </div>
    </div>
  );
}
