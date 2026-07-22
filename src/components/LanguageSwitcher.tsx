import { useEffect, useId, useState, type ReactElement } from 'react';

/**
 * Language switcher — two circular flag links (RU / EN) in a glassy pill.
 * Framework-neutral: no next/* — each flag is a plain <a> that swaps ONLY the
 * locale prefix of the current path (`/ru/… ↔ /en/…`), preserving the subpath,
 * query and hash. SSR renders `/${target}` (matches on both server and client
 * so there is no hydration mismatch); a mount-time effect then refines the href
 * from `window.location`.
 *
 * Inline SVG flags, NOT emoji: regional-indicator emoji render as bare letters
 * ("RU"/"GB") on Windows, so SVG is the only crisp, cross-platform option.
 */

export type SiteLocale = 'ru' | 'en';

const KNOWN: readonly string[] = ['ru', 'en'];
const ORDER: SiteLocale[] = ['ru', 'en'];

/** Same path with its leading locale segment swapped to `target`. */
function localeHref(target: SiteLocale): string {
  if (typeof window === 'undefined') return `/${target}`;
  const { pathname, search, hash } = window.location;
  const segs = pathname.split('/');
  // segs[0] is '' (leading slash); segs[1] is the first real segment.
  if (segs[1] && KNOWN.includes(segs[1])) {
    segs[1] = target;
    return segs.join('/') + search + hash;
  }
  // No locale prefix in the current path (e.g. the FMS Puck editor preview) —
  // fall back to the locale root rather than prepend a broken swap.
  return `/${target}`;
}

// Russia — three equal horizontal bands (white / blue / red).
function FlagRU() {
  return (
    <svg viewBox="0 0 9 6" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="9" height="6" fill="#fff" />
      <rect width="9" height="4" y="2" fill="#0039A6" />
      <rect width="9" height="2" y="4" fill="#D52B1E" />
    </svg>
  );
}

// English = GB (Union Jack) by i18n convention. clipPath ids are document-global
// — derive unique ones per instance so two toggles can't collide on a shared id.
function FlagEN() {
  const uid = useId().replace(/:/g, '');
  const clipAll = `uk-s-${uid}`;
  const clipDiag = `uk-t-${uid}`;
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <clipPath id={clipAll}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={clipDiag}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipAll})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${clipDiag})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

const FLAGS: Record<SiteLocale, { node: ReactElement; label: string }> = {
  ru: { node: <FlagRU />, label: 'Русский' },
  en: { node: <FlagEN />, label: 'English' },
};

export interface LanguageSwitcherProps {
  current: SiteLocale;
  className?: string;
}

export function LanguageSwitcher({ current, className = '' }: LanguageSwitcherProps) {
  const [hrefs, setHrefs] = useState<Record<SiteLocale, string>>({ ru: '/ru', en: '/en' });

  useEffect(() => {
    const sync = () => setHrefs({ ru: localeHref('ru'), en: localeHref('en') });
    sync();
    // Keep hrefs fresh if the surrounding app soft-navigates (back/forward)
    // while reusing this header instance.
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return (
    <div className={`sb-lang ${className}`.trim()} role="group" aria-label="Language / Язык">
      {ORDER.map((loc) => {
        const active = loc === current;
        return (
          <a
            key={loc}
            className={`sb-lang__flag${active ? ' is-active' : ''}`}
            href={hrefs[loc]}
            hrefLang={loc}
            aria-label={FLAGS[loc].label}
            aria-current={active ? 'true' : undefined}
            title={FLAGS[loc].label}
          >
            {FLAGS[loc].node}
          </a>
        );
      })}
    </div>
  );
}
