import bt from "../assets/logos/bt.jpg";
import hyperoptic from "../assets/logos/hyperoptic.png";
import type { ProviderSlug } from "../types";

interface Props {
  provider: ProviderSlug;
  size?: number;
}

// Real provider logos we have on file. Providers not listed here still use a
// stylized placeholder badge below until their real logo is added.
// "cover" suits a square brand tile with its own baked-in padding (crops in
// to fill the circle); "contain" suits a wide wordmark on a transparent
// background (letterboxes instead of cropping off the text).
const REAL_LOGOS: Partial<Record<ProviderSlug, { src: string; fit: "cover" | "contain" }>> = {
  BT: { src: bt, fit: "cover" },
  Hyperoptic: { src: hyperoptic, fit: "contain" },
};

export default function ProviderLogo({ provider, size = 40 }: Props) {
  const style = { width: size, height: size };
  const realLogo = REAL_LOGOS[provider];

  if (realLogo) {
    const inner = realLogo.fit === "contain" ? Math.round(size * 0.82) : size;
    return (
      <div
        style={style}
        className="flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm shrink-0 overflow-hidden"
      >
        <img
          src={realLogo.src}
          alt={`${provider} logo`}
          style={{ width: inner, height: inner, objectFit: realLogo.fit }}
        />
      </div>
    );
  }

  const fontStyle = { ...style, fontSize: size * 0.34 };

  switch (provider) {
    case "Virgin Media":
      return (
        <div
          style={fontStyle}
          className="flex items-center justify-center rounded-full bg-white border border-red-100 shadow-sm shrink-0"
        >
          <span className="font-black italic text-red-600 leading-none" style={{ fontSize: size * 0.4 }}>
            ∞
          </span>
        </div>
      );
    case "Plusnet":
      return (
        <div
          style={fontStyle}
          className="flex items-center justify-center rounded-full bg-white border border-pink-100 shadow-sm shrink-0"
        >
          <span className="font-black text-[#ce0058]" style={{ fontSize: size * 0.42 }}>
            +
          </span>
        </div>
      );
    case "Sky":
      return (
        <div
          style={fontStyle}
          className="flex items-center justify-center rounded-full bg-white border border-blue-100 shadow-sm shrink-0"
        >
          <span className="font-black italic text-blue-600" style={{ fontSize: size * 0.28 }}>
            sky
          </span>
        </div>
      );
    case "Vodafone":
      return (
        <div style={fontStyle} className="flex items-center justify-center rounded-full bg-[#e60000] shrink-0">
          <span
            className="font-black text-white rounded-full border-2 border-white flex items-center justify-center"
            style={{ width: size * 0.6, height: size * 0.6, fontSize: size * 0.32 }}
          >
            !
          </span>
        </div>
      );
    default:
      return <div style={fontStyle} className="rounded-full bg-gray-200 shrink-0" />;
  }
}
