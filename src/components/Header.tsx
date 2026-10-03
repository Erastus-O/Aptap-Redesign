import { useNavigate } from "react-router-dom";
import aptapLogo from "../assets/logos/aptap.png";
import barclaysLogo from "../assets/logos/barclays.webp";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1728px] px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span aria-hidden>←</span>
          Go back to marketplace
        </button>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <img src={aptapLogo} alt="Aptap" className="h-10 w-auto" />
          <span className="text-gray-400 text-sm">in partnership with</span>
          <img src={barclaysLogo} alt="Barclays" className="h-12 w-auto" />
        </div>
      </div>
    </header>
  );
}
