import { safeHref } from '../sanitize';
import { ContactIcon, type ContactKind } from '../components/ContactIcon';
import type { NavLink } from './SiteHeader';

export interface FooterProps {
  phone?: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  mapUrl?: string;
  links: NavLink[];
  note?: string;
}

/** Footer: contacts + nav + socials. */
export function Footer({
  phone,
  email,
  whatsapp,
  telegram,
  instagram,
  mapUrl,
  links,
  note,
}: FooterProps) {
  const phoneHref = phone
    ? safeHref(phone.startsWith('tel:') ? phone : `tel:${phone.replace(/\s+/g, '')}`)
    : undefined;
  const emailHref = email
    ? safeHref(email.startsWith('mailto:') ? email : `mailto:${email}`)
    : undefined;
  const mapHref = safeHref(mapUrl);

  const socials: { kind: ContactKind; href: string }[] = [];
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: 'whatsapp', href: wa });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: 'telegram', href: tg });
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: 'instagram', href: ig });

  const navLinks = (links ?? [])
    .map((link) => ({ label: link.label, href: safeHref(link.href) }))
    .filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer className="sb-footer" id="contacts">
      <div className="sb-footer__inner">
        <div className="sb-footer__col">
          <h4>Контакты</h4>
          <div className="sb-footer__list">
            {phoneHref ? <a href={phoneHref}>{phone}</a> : null}
            {emailHref ? <a href={emailHref}>{email}</a> : null}
            {mapHref ? (
              <a href={mapHref} target="_blank" rel="noopener noreferrer">
                На карте
              </a>
            ) : null}
          </div>
        </div>

        {navLinks.length > 0 ? (
          <div className="sb-footer__col">
            <h4>Навигация</h4>
            <div className="sb-footer__list">
              {navLinks.map((link, index) => (
                <a key={index} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {socials.length > 0 ? (
          <div className="sb-footer__col">
            <h4>Мы в соцсетях</h4>
            <div className="sb-footer__socials">
              {socials.map((social, index) => (
                <a
                  key={index}
                  className="sb-icon-link"
                  href={social.href}
                  aria-label={social.kind}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ContactIcon kind={social.kind} />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {note ? <p className="sb-footer__note">{note}</p> : null}
    </footer>
  );
}
