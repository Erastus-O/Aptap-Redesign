import { useState, type ReactNode } from "react";

interface Item {
  id: string;
  question: string;
  answer: ReactNode;
}

interface Props {
  items: Item[];
  onOpen?: (id: string) => void;
}

export default function Accordion({ items, onOpen }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => {
                const next = isOpen ? null : item.id;
                setOpenId(next);
                if (next) onOpen?.(item.id);
              }}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:-outline-offset-2"
            >
              <span className="font-semibold text-sm">{item.question}</span>
              <span className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                ⌄
              </span>
            </button>
            {isOpen && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
