import { useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode[];
}

export default function Carousel({ children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = children.length;

  function scrollToIndex(index: number) {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, count - 1));
    const card = container.children[clamped] as HTMLElement | undefined;
    if (!card) return;
    // Scroll only this container's own scrollLeft — never scrollIntoView, which
    // can also drag the whole page horizontally to bring the card into view.
    const delta = card.getBoundingClientRect().left - container.getBoundingClientRect().left;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: "smooth" });
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const containerLeft = container.getBoundingClientRect().left;
    let closest = 0;
    let closestDistance = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const distance = Math.abs(child.getBoundingClientRect().left - containerLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }

  if (count === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className="snap-start shrink-0 w-[85vw] max-w-[360px] sm:w-[360px]">
            {child}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous deal"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="hidden sm:flex absolute -left-4 top-[calc(50%-1.25rem)] -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next deal"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === count - 1}
            className="hidden sm:flex absolute -right-4 top-[calc(50%-1.25rem)] -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>

          <div className="flex justify-center gap-1.5 mt-3">
            {children.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to deal ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-5 bg-indigo-600" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
