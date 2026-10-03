/**
 * ATOMS — Button, Badge, Chip, Spinner, Skeleton, ProviderLogo.
 * Styling lives in src/styles/components.css (.ap-*). These wrappers add semantics, a11y and a typed API.
 */
import { forwardRef, useState, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode, type HTMLAttributes } from "react";

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export { cx };

/* ---------------- Button ---------------- */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full-width. Use for the primary CTA on mobile. */
  block?: boolean;
  /** Shows a spinner, keeps width, sets aria-busy and blocks clicks. Keep the label meaningful ("Choosing deal…" is read out via loadingLabel). */
  loading?: boolean;
  loadingLabel?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** Icon-only button. REQUIRES aria-label. */
  iconOnly?: boolean;
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block, loading, loadingLabel = "Loading", iconStart, iconEnd, iconOnly, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("ap-btn", variant !== "primary" && `ap-btn--${variant}`, size !== "md" && `ap-btn--${size}`, block && "ap-btn--block", iconOnly && "ap-btn--icon", className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
      {loading && (<><span className="ap-spinner" aria-hidden="true" /><span className="ap-visually-hidden" role="status">{loadingLabel}</span></>)}
    </button>
  );
});

/** Link styled as a button — use when the action navigates (e.g. "View full details"). */
export function ButtonLink({ variant = "primary", size = "md", block, iconStart, iconEnd, className, children, ...rest }: ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx("ap-btn", variant !== "primary" && `ap-btn--${variant}`, size !== "md" && `ap-btn--${size}`, block && "ap-btn--block", className)} {...rest}>
      {iconStart}{children}{iconEnd}
    </a>
  );
}

/* ---------------- Badge ---------------- */
export type BadgeTone = "neutral" | "brand" | "brand-solid" | "success" | "warning" | "danger" | "info";

/** Non-interactive label. The text must carry the meaning on its own — tone is reinforcement only. */
export function Badge({ tone = "neutral", icon, className, children, ...rest }: { tone?: BadgeTone; icon?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ap-badge", tone !== "neutral" && `ap-badge--${tone}`, className)} {...rest}>{icon}{children}</span>;
}

/* ---------------- Chip (toggle filter) ---------------- */
export function Chip({ selected, icon, className, children, ...rest }: { selected: boolean; icon?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx("ap-chip", className)} aria-pressed={selected} {...rest}>
      {icon}{children}
    </button>
  );
}

/* ---------------- Spinner ---------------- */
export function Spinner({ label = "Loading" }: { label?: string }) {
  return <span role="status" className="ap-cluster"><span className="ap-spinner" aria-hidden="true" /><span className="ap-visually-hidden">{label}</span></span>;
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ width = "100%", height = 16, radius, className }: { width?: number | string; height?: number | string; radius?: string; className?: string }) {
  return <span aria-hidden="true" className={cx("ap-skeleton", className)} style={{ width, height, borderRadius: radius }} />;
}

/* ---------------- Avatar (provider logo disc) ---------------- */
/** Providers whose artwork is a full-bleed square/circle (fills the disc instead of sitting inside it). */
export const fullBleedLogos = new Set(["BT", "EE"]);

export interface AvatarProps { provider: string; src?: string; size?: "sm" | "md" | "lg"; /** logo artwork that is itself a filled square/circle (BT, EE) */ fill?: boolean }

/**
 * White disc with the provider mark — the interface's 40px circle on every deal card, compare header and selected-deal card;
 * 56px on dealer tiles. Falls back to a monogram if the image is missing or fails.
 * Decorative (alt=""): the provider name is ALWAYS rendered as text next to it.
 */
export function Avatar({ provider, src, size = "md", fill = fullBleedLogos.has(provider) }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const monogram = provider.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className={cx("ap-avatar", size !== "md" && `ap-avatar--${size}`, fill && "ap-avatar--fill")}>
      {src && !failed
        ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
        : <span className="ap-avatar__fallback" aria-hidden="true">{monogram}</span>}
    </span>
  );
}
/** @deprecated use Avatar */
export const ProviderLogo = ({ provider, src, size }: { provider: string; src?: string; size?: "md" | "lg" }) => <Avatar provider={provider} src={src} size={size} />;

/** Map provider name (as in deals.json) → asset path. Keep in sync with assets/providers/. `fill` = artwork is a full-bleed square. */
export const providerLogos: Record<string, string> = {
  BT: "/assets/providers/bt.jpg",
  "Virgin Media": "/assets/providers/virgin-media.webp",
  Vodafone: "/assets/providers/vodafone.png",
  Plusnet: "/assets/providers/plusnet.png",
  Hyperoptic: "/assets/providers/hyperoptic.png",
  EE: "/assets/providers/ee.png",
};

/* ---------------- Pill ---------------- */
export type PillTone = "neutral" | "perk" | "rise" | "fixed" | "trust";

/**
 * Small status pill used on deal cards: perk ("£100 bill credit"), price rise, price fixed, trust tags.
 * Automatically switches to the feature-surface colours inside `.ap-on-feature`. Text carries the meaning.
 */
export function Pill({ tone = "neutral", icon, className, children, ...rest }: { tone?: PillTone; icon?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ap-pill", `ap-pill--${tone}`, className)} {...rest}>{icon}{children}</span>;
}
