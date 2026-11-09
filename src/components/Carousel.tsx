import { useRef, type ReactNode } from 'react';
import type { SiteLocale } from './LanguageSwitcher';

const LABELS: Record<SiteLocale, { prev: string; next: string }> = {
  ru: { prev: 'Назад', next: 'Вперёд' },
  en: { prev: 'Previous', next: 'Next' },
};

/**
 * Horizontal scroll-snap carousel with prev/next arrows in a top-right header.
 * Client-interactive (scrolls the track on click). Used for review rows.
 */
export function Carousel({
  title,
  children,
  locale = 'ru',
}: {
  title?: ReactNode;
  children: ReactNode;
  locale?: SiteLocale;
}) {
  const t = LABELS[locale];
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
          <button type="button" onClick={() => scrollByDir(-1)} aria-label={t.prev}>
            ‹
          </button>
          <button type="button" onClick={() => scrollByDir(1)} aria-label={t.next}>
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
