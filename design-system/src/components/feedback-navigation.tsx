/**
 * FEEDBACK, NAVIGATION & OVERLAYS — Alert, Toast, EmptyState, AppBar, Tabs, Stepper, Accordion, Sheet.
 */
import { useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { cx, Button } from "./atoms";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronLeft, Info, X } from "./icons";

/* ---------------- Alert ---------------- */
export type AlertTone = "info" | "success" | "warning" | "danger" | "brand";
const ALERT_ICON = { info: Info, success: CheckCircle, warning: AlertTriangle, danger: AlertCircle, brand: Info };

/**
 * Inline message. Status is carried by icon + title text + accent bar, never tint alone.
 * `live` → role="status" (polite) or role="alert" for danger. Leave off for static, always-present notices.
 */
export function Alert({ tone = "info", title, children, action, live, icon }: { tone?: AlertTone; title?: string; children?: ReactNode; action?: ReactNode; live?: boolean; icon?: ReactNode }) {
  const Icon = ALERT_ICON[tone];
  const role = live ? (tone === "danger" ? "alert" : "status") : undefined;
  return (
    <div className={cx("ap-alert", tone !== "info" && `ap-alert--${tone}`)} role={role}>
      {icon ?? <Icon />}
      <div className="ap-alert__body">
        {title && <strong className="ap-alert__title">{title}</strong>}
        {children}
        {action && <div className="ap-alert__action">{action}</div>}
      </div>
    </div>
  );
}

/* ---------------- Toast ---------------- */
/** Transient confirmation ("Deal added to compare"). Render inside a single <div className="ap-toast-region" role="status">. Never use for errors that need action. */
export function Toast({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="ap-toast">{children}{action}</div>;
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ap-empty">
      {icon && <span className="ap-empty__icon" aria-hidden="true">{icon}</span>}
      <h3 className="ap-empty__title">{title}</h3>
      {children && <p className="ap-empty__text">{children}</p>}
      {action}
    </div>
  );
}

/* ---------------- App bar ---------------- */
/**
 * In-webview header. ApTap runs inside banking apps, so there is no native back chrome we can rely on —
 * a visible back action is REQUIRED on every screen except the marketplace root.
 */
export function AppBar({ title, partner, onBack, backLabel = "Back", end }: { title: string; partner?: string; onBack?: () => void; backLabel?: string; end?: ReactNode }) {
  return (
    <header className="ap-app-bar">
      {onBack ? <Button variant="ghost" iconOnly aria-label={backLabel} onClick={onBack}><ChevronLeft size="lg" /></Button> : <span />}
      <div className="ap-app-bar__title">
        {title}
        {partner && <span className="ap-app-bar__partner">{partner}</span>}
      </div>
      {end ?? <span />}
    </header>
  );
}

/* ---------------- Tabs ---------------- */
export interface TabItem { id: string; label: string; panel: ReactNode }

/** WAI-ARIA tabs with automatic activation and arrow-key navigation. */
export function Tabs({ items, label, defaultId }: { items: TabItem[]; label: string; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = items[(map[e.key] + items.length) % items.length];
    setActive(next.id);
    refs.current[next.id]?.focus();
  };
  return (
    <div>
      <div className="ap-tabs" role="tablist" aria-label={label}>
        {items.map((t, i) => (
          <button key={t.id} ref={(el) => { refs.current[t.id] = el; }} className="ap-tabs__tab" role="tab" type="button"
            id={`${base}-tab-${t.id}`} aria-controls={`${base}-panel-${t.id}`} aria-selected={active === t.id} tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)} onKeyDown={(e) => onKey(e, i)}>
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div key={t.id} role="tabpanel" id={`${base}-panel-${t.id}`} aria-labelledby={`${base}-tab-${t.id}`} hidden={active !== t.id} tabIndex={0}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Stepper ---------------- */
/** Switch-flow progress. The step count must not grow when fields are added (PRD E3-3). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="ap-stepper" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s} className="ap-stepper__step" data-state={i < current ? "complete" : undefined} aria-current={i === current ? "step" : undefined}>
          {s}{i < current && <span className="ap-visually-hidden"> (completed)</span>}
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Accordion ---------------- */
/** Native <details> — keyboard and screen-reader support for free. Use for FAQs and secondary detail, never for price-change info. */
export function Accordion({ items, onOpen, boxed }: { items: Array<{ id: string; title: string; content: ReactNode }>; onOpen?: (id: string) => void; /** interface "Before you switch" bordered list */ boxed?: boolean }) {
  return (
    <div className={cx("ap-accordion", boxed && "ap-accordion--boxed")}>
      {items.map((it) => (
        <details key={it.id} className="ap-accordion__item" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && onOpen?.(it.id)}>
          <summary className="ap-accordion__trigger">{it.title}</summary>
          <div className="ap-accordion__panel">{it.content}</div>
        </details>
      ))}
    </div>
  );
}

/* ---------------- Sheet (bottom sheet on mobile, centred modal ≥768px) ---------------- */
/**
 * Built on <dialog>.showModal(): focus trap, Esc to close, inert background and top-layer stacking come from the platform.
 * Focus returns to the opener on close.
 */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { opener.current = document.activeElement; d.showModal(); }
    if (!open && d.open) { d.close(); (opener.current as HTMLElement | null)?.focus?.(); }
  }, [open]);
  return (
    <dialog ref={ref} className="ap-sheet" aria-labelledby={titleId} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="ap-sheet__header">
        <h2 className="ap-sheet__title" id={titleId}>{title}</h2>
        <Button variant="ghost" iconOnly aria-label="Close" onClick={onClose}><X /></Button>
      </div>
      <div className="ap-sheet__body">{children}</div>
      {footer && <div className="ap-sheet__footer">{footer}</div>}
    </dialog>
  );
}
