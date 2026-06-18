import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon, type ContactKind } from '../components/ContactIcon';
import { BrandLogo } from '../components/BrandLogo';

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
}

/** Sticky, blurred dark header: brand + anchor nav + contact icon links. */
export function SiteHeader({
  logoText,
  logoImage,
  links,
  phone,
  whatsapp,
  telegram,
  instagram,
}: SiteHeaderProps) {
  const logoImg = safeImageUrl(logoImage);

  // Social icons (phone is rendered separately, as text).
  const socials: { kind: ContactKind; href: string }[] = [];
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: 'instagram', href: ig });
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: 'whatsapp', href: wa });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: 'telegram', href: tg });

  const phoneHref = phone
    ? safeHref(phone.startsWith('tel:') ? phone : `tel:${phone.replace(/\s+/g, '')}`)
    : undefined;

  return (
    <header className="sb-header">
      <div className="sb-header__inner">
        <a className="sb-header__brand" href="/">
          {logoImg ? (
            <img src={logoImg} alt={logoText || 'logo'} />
          ) : (
            <BrandLogo text={logoText || 'SHIBA CARS'} />
          )}
        </a>
        <nav className="sb-header__nav">
          {(links ?? []).map((link, index) => {
            const href = safeHref(link.href);
            return href ? (
              <a key={index} href={href}>
                {link.label}
              </a>
            ) : null;
          })}
        </nav>
        <div className="sb-header__contacts">
          {socials.map((contact, index) => (
            <a
              key={index}
              className="sb-icon-link"
              href={contact.href}
              aria-label={contact.kind}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ContactIcon kind={contact.kind} />
            </a>
          ))}
          {phoneHref ? (
            <a className="sb-header__phone" href={phoneHref}>
              {phone}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
