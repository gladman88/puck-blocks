// Inline line icons of the model / category pages (as in the approved
// mockups) — no icon dependency. Stroke takes `currentColor`.
import type { ReactNode } from 'react';

function Svg({ children, className = 'sb-mp-ic' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const PATHS = {
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" />
    </>
  ),
  gauge: (
    <>
      <path d="M12 14l4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="14" r="8" />
      <path d="M12 10v4l2 2M10 2h4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  engine: (
    <>
      <path d="M4 10h2V8h4V6h4v2h3l2 3h2v5h-2l-2 3H8l-2-3H4z" />
    </>
  ),
  battery: (
    <>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <path d="M22 11v2M6 11v2M10 11v2" />
    </>
  ),
  fuel: (
    <>
      <path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M3 22h12M3 10h12" />
      <path d="M15 13h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3" />
    </>
  ),
  gearbox: (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M5 8v8M12 8v8M19 8v4H5" />
    </>
  ),
  drive: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h8M8 18h8M12 6v12" />
    </>
  ),
  speed: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  car: (
    <>
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2" />
      <path d="M3 12h18" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
    </>
  ),
  height: <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />,
  weight: (
    <>
      <path d="M6 8h12l2 13H4z" />
      <circle cx="12" cy="5" r="3" />
    </>
  ),
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  contract: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  tag: (
    <>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" />
    </>
  ),
} as const;

export type PageIconName = keyof typeof PATHS;

export function PageIcon({ name, className }: { name: PageIconName; className?: string }) {
  return <Svg className={className}>{PATHS[name]}</Svg>;
}

/** Round gold-rimmed badge with an icon (facts, spec group headings). */
export function IconBadge({ name }: { name: PageIconName }) {
  return (
    <span className="sb-mp-badge" aria-hidden="true">
      <PageIcon name={name} />
    </span>
  );
}
