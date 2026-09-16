import type { ProviderSlug } from "../types";

interface Props {
  provider: ProviderSlug;
  size?: number;
}

export default function ProviderLogo({ provider, size = 40 }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.34 };

  switch (provider) {
    case "virgin":
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
    case "bt":
      return (
        <div
          style={style}
          className="flex items-center justify-center rounded-full shrink-0"
          data-color="#6534ac"
        >
          <div className="w-full h-full rounded-full bg-[#5b1fb4] flex items-center justify-center">
            <span className="font-extrabold text-white tracking-tight" style={{ fontSize: size * 0.32 }}>
              BT
            </span>
          </div>
        </div>
      );
    case "plusnet":
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
    case "sky":
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
    case "ee":
      return (
        <div
          style={style}
          className="flex items-center justify-center rounded-full bg-[#00b1a9] shrink-0"
        >
          <span className="font-black text-[#f5d800]" style={{ fontSize: size * 0.3 }}>
            EE
          </span>
        </div>
      );
    default:
      return <div style={style} className="rounded-full bg-gray-200 shrink-0" />;
  }
}
