import type { ProviderSlug } from "../types";

interface Props {
  provider: ProviderSlug;
  size?: number;
}

export default function ProviderLogo({ provider, size = 40 }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.34 };

  switch (provider) {
    case "Virgin Media":
      return (
        <div
          style={style}
          className="flex items-center justify-center rounded-full bg-white border border-red-100 shadow-sm shrink-0"
        >
          <span className="font-black italic text-red-600 leading-none" style={{ fontSize: size * 0.4 }}>
            ∞
          </span>
        </div>
      );
    case "BT":
      return (
        <div style={style} className="flex items-center justify-center rounded-full shrink-0">
          <div className="w-full h-full rounded-full bg-[#5b1fb4] flex items-center justify-center">
            <span className="font-extrabold text-white tracking-tight" style={{ fontSize: size * 0.32 }}>
              BT
            </span>
          </div>
        </div>
      );
    case "Plusnet":
      return (
        <div
          style={style}
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
          style={style}
          className="flex items-center justify-center rounded-full bg-white border border-blue-100 shadow-sm shrink-0"
        >
          <span className="font-black italic text-blue-600" style={{ fontSize: size * 0.28 }}>
            sky
          </span>
        </div>
      );
    case "Vodafone":
      return (
        <div style={style} className="flex items-center justify-center rounded-full bg-[#e60000] shrink-0">
          <span
            className="font-black text-white rounded-full border-2 border-white flex items-center justify-center"
            style={{ width: size * 0.6, height: size * 0.6, fontSize: size * 0.32 }}
          >
            !
          </span>
        </div>
      );
    case "Hyperoptic":
      return (
        <div
          style={style}
          className="flex items-center justify-center rounded-full bg-[#d2006e] shrink-0"
        >
          <span className="font-black text-white" style={{ fontSize: size * 0.4 }}>
            H
          </span>
        </div>
      );
    default:
      return <div style={style} className="rounded-full bg-gray-200 shrink-0" />;
  }
}
