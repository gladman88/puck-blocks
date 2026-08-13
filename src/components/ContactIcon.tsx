import type { SVGProps } from 'react';
import { siInstagram, siTelegram, siWhatsapp } from 'simple-icons';

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

const brandPaths: Partial<Record<ContactKind, string>> = {
  instagram: siInstagram.path,
  whatsapp: siWhatsapp.path,
  telegram: siTelegram.path,
};

/** Compact inline icon for a contact channel. */
export function ContactIcon({ kind }: { kind: ContactKind }) {
  const brandPath = brandPaths[kind];

  if (brandPath) {
    return (
      <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={brandPath} />
      </svg>
    );
  }

  switch (kind) {
    case 'phone':
      return (
        <svg {...base}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    default:
      return null;
  }
}
