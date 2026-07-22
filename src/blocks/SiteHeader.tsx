import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon, type ContactKind } from '../components/ContactIcon';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageSwitcher, type SiteLocale } from '../components/LanguageSwitcher';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  logoText?: string;
  logoImage?: string;
  links: NavLink[];
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  /** Override the Puck metadata locale (for non-Puck hosts). */
  locale?: SiteLocale;
}

type PuckInjected = { puck?: { metadata?: { locale?: string } } };

const STRINGS: Record<SiteLocale, { menu: string; close: string; call: string }> = {
  ru: { menu: 'Меню', close: 'Закрыть', call: 'Позвонить' },
  en: { menu: 'Menu', close: 'Close', call: 'Call' },
};

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

/**
 * Sticky, blurred dark header. Desktop: brand + anchor nav + language flags +
 * contact icons + phone. Mobile (≤900px): brand + WhatsApp/Telegram/call icons +
 * a hamburger that opens a full-screen drawer (nav + language flags + full
 * contacts). Locale comes from Puck metadata (page locale).
 */
export function SiteHeader({
  logoText,
  logoImage,
  links,
  phone,
  whatsapp,
  telegram,
  instagram,
  locale: localeProp,
  puck,
}: SiteHeaderProps & PuckInjected) {
  const locale: SiteLocale = localeProp ?? (puck?.metadata?.locale === 'en' ? 'en' : 'ru');
  const t = STRINGS[locale];

  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // While the drawer is open: lock body scroll, move focus into the dialog and
  // trap Tab within it (the mobile bar behind it stays in the DOM), close on
  // Esc, and restore focus to the opener (the burger) on close.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [open]);

  const logoImg = safeImageUrl(logoImage);
  const logoNode = logoImg ? (
    <img src={logoImg} alt={logoText || 'logo'} />
  ) : (
    <BrandLogo text={logoText || 'SHIBA CARS'} />
  );

  // Social icon links (phone is handled separately — text on desktop, icon on mobile).
  const ig = safeHref(instagram);
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);

  const phoneHref = phone
    ? safeHref(phone.startsWith('tel:') ? phone : `tel:${phone.replace(/\s+/g, '')}`)
    : undefined;

  const iconLink = (kind: ContactKind, href: string, extraClass = '') => (
    <a
      className={`sb-icon-link ${extraClass}`.trim()}
      href={href}
      aria-label={kind}
      target={kind === 'phone' ? undefined : '_blank'}
      rel={kind === 'phone' ? undefined : 'noopener noreferrer'}
    >
      <ContactIcon kind={kind} />
    </a>
  );

  const navLinks = (links ?? [])
    .map((link) => ({ label: link.label, href: safeHref(link.href) }))
    .filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <header className="sb-header">
      <div className="sb-header__inner">
        <a className="sb-header__brand" href="/">
          {logoNode}
        </a>

        <nav className="sb-header__nav">
          {navLinks.map((link, index) => (
            <a key={index} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="sb-header__right">
          {/* Desktop-only language flags (mobile flags live in the drawer). */}
          <LanguageSwitcher current={locale} className="sb-lang--header sb-only-desktop" />

          <div className="sb-header__contacts">
            {ig ? iconLink('instagram', ig, 'sb-only-desktop') : null}
            {wa ? iconLink('whatsapp', wa) : null}
            {tg ? iconLink('telegram', tg) : null}
            {/* Phone: full number as text on desktop, a call icon on mobile. */}
            {phoneHref ? (
              <a className="sb-header__phone sb-only-desktop" href={phoneHref}>
                {phone}
              </a>
            ) : null}
            {phoneHref ? iconLink('phone', phoneHref, 'sb-only-mobile') : null}
          </div>

          <button
            type="button"
            className="sb-header__burger sb-only-mobile"
            aria-label={t.menu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <BurgerIcon />
          </button>
        </div>
      </div>

      {/* Portaled to <body>: the header's `backdrop-filter` would otherwise make
          it the containing block for this fixed element, clipping the drawer to
          the header box instead of the viewport. `open` starts false, so this
          only ever runs on the client (never during SSR). */}
      {open
        ? createPortal(
            <div
              ref={drawerRef}
              className="sb-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t.menu}
            >
              <div className="sb-drawer__head">
                <span className="sb-drawer__brand">{logoNode}</span>
                <button
                  type="button"
                  ref={closeRef}
                  className="sb-drawer__close"
                  aria-label={t.close}
                  onClick={() => setOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <nav className="sb-drawer__nav">
                {navLinks.map((link, index) => (
                  <a key={index} href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </a>
                ))}
              </nav>

              <LanguageSwitcher current={locale} className="sb-lang--drawer" />

              <div className="sb-drawer__contacts">
                {phoneHref ? (
                  <a className="sb-drawer__phone" href={phoneHref}>
                    {phone}
                  </a>
                ) : null}
                <div className="sb-drawer__socials">
                  {ig ? iconLink('instagram', ig) : null}
                  {wa ? iconLink('whatsapp', wa) : null}
                  {tg ? iconLink('telegram', tg) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
