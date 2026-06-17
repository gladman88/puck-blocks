import type { SVGProps } from 'react';

export type ContactKind = 'phone' | 'whatsapp' | 'telegram' | 'instagram';

const base: SVGProps<SVGSVGElement> = {
  className: 'sb-ico',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/** Compact inline icon for a contact channel (no icon-font dependency). */
export function ContactIcon({ kind }: { kind: ContactKind }) {
  switch (kind) {
    case 'phone':
      return (
        <svg {...base}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...base}>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z" />
          <path d="M8.5 9c.4 3.2 3.3 6.1 6.5 6.5" />
        </svg>
      );
    case 'telegram':
      return (
        <svg {...base}>
          <path d="m22 3-9.5 18-2.8-6.7L3 11.5 22 3z" />
          <path d="M22 3 9.7 14.3" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...base}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}
