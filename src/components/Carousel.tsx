import { useRef, type ReactNode } from 'react';

/**
 * Horizontal scroll-snap carousel with prev/next arrows in a top-right header.
 * Client-interactive (scrolls the track on click). Used for review rows.
 */
export function Carousel({ title, children }: { title?: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollByDir = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="sb-carousel">
      <div className="sb-carousel__head">
        <div className="sb-carousel__title">{title}</div>
        <div className="sb-carousel__nav">
          <button type="button" onClick={() => scrollByDir(-1)} aria-label="Назад">
            ‹
          </button>
          <button type="button" onClick={() => scrollByDir(1)} aria-label="Вперёд">
            ›
          </button>
        </div>
      </div>
      <div className="sb-carousel__track" ref={ref}>
        {children}
      </div>
    </div>
  );
}
