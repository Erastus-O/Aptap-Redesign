import { useNavigate } from "react-router-dom";

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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-lg tracking-tight">
            <span className="text-xl" aria-hidden>
              📡
            </span>
            APTAP
          </div>
          <span className="text-gray-400 text-sm">in partnership with</span>
          <span className="text-sky-500 font-serif font-bold text-xl tracking-tight">BARCLAYS</span>
        </div>
      </div>
    </header>
  );
}
