/**
 * Icon set — Lucide-style (24px grid, 2px stroke, round caps/joins).
 * Icons inherit `currentColor`, so colour comes from the semantic token on the parent.
 * Decorative by default (aria-hidden). Pass `label` only when the icon is the sole content of a control.
 * Swap for `lucide-react` 1:1 if the product adopts it — names match.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: "xs" | "sm" | "md" | "lg" | "xl"; label?: string };

const SIZE = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 } as const;

function make(paths: React.ReactNode, displayName: string) {
  const Icon = ({ size = "md", label, ...rest }: IconProps) => (
    <svg
      width={SIZE[size]} height={SIZE[size]} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const ChevronLeft  = make(<path d="m15 18-6-6 6-6" />, "ChevronLeft");
export const ChevronRight = make(<path d="m9 18 6-6-6-6" />, "ChevronRight");
export const ChevronDown  = make(<path d="m6 9 6 6 6-6" />, "ChevronDown");
export const X            = make(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>, "X");
export const Check        = make(<path d="M20 6 9 17l-5-5" />, "Check");
export const Info         = make(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>, "Info");
export const AlertTriangle = make(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></>, "AlertTriangle");
export const AlertCircle  = make(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></>, "AlertCircle");
export const CheckCircle  = make(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>, "CheckCircle");
export const TrendingUp   = make(<><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></>, "TrendingUp");
export const Lock         = make(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, "Lock");
export const Sparkles     = make(<path d="M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" />, "Sparkles");
export const Wifi         = make(<><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><path d="M12 20h.01" /></>, "Wifi");
export const Calendar     = make(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>, "Calendar");
export const Wrench       = make(<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />, "Wrench");
export const ArrowRightLeft = make(<><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>, "ArrowRightLeft");
export const PoundSterling = make(<><path d="M18 7c0-5.33-8-5.33-8 0" /><path d="M10 7v14" /><path d="M6 21h12" /><path d="M6 13h10" /></>, "PoundSterling");
export const ShieldCheck  = make(<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>, "ShieldCheck");
export const Search       = make(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>, "Search");
export const Pencil       = make(<><path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" /></>, "Pencil");
export const Gift         = make(<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>, "Gift");
export const SlidersHorizontal = make(<><path d="M21 4h-7" /><path d="M10 4H3" /><path d="M21 12h-9" /><path d="M8 12H3" /><path d="M21 20h-5" /><path d="M12 20H3" /><path d="M14 2v4" /><path d="M8 10v4" /><path d="M16 18v4" /></>, "SlidersHorizontal");
