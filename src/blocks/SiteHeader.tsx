import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon, type ContactKind } from '../components/ContactIcon';

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

  const contacts: { kind: ContactKind; href: string }[] = [];
  const phoneHref = phone
    ? safeHref(phone.startsWith('tel:') ? phone : `tel:${phone.replace(/\s+/g, '')}`)
    : undefined;
  if (phoneHref) contacts.push({ kind: 'phone', href: phoneHref });
  const wa = safeHref(whatsapp);
  if (wa) contacts.push({ kind: 'whatsapp', href: wa });
  const tg = safeHref(telegram);
  if (tg) contacts.push({ kind: 'telegram', href: tg });
  const ig = safeHref(instagram);
  if (ig) contacts.push({ kind: 'instagram', href: ig });

  return (
    <header className="sb-header">
      <div className="sb-header__inner">
        <a className="sb-header__brand" href="/">
          {logoImg ? <img src={logoImg} alt={logoText || 'logo'} /> : logoText || 'SHIBA CARS'}
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
          {contacts.map((contact, index) => (
            <a
              key={index}
              className="sb-icon-link"
              href={contact.href}
              aria-label={contact.kind}
              {...(contact.kind === 'phone' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <ContactIcon kind={contact.kind} />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
