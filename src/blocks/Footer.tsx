import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon, type ContactKind } from '../components/ContactIcon';
import { BrandLogo } from '../components/BrandLogo';
import type { NavLink } from './SiteHeader';

export interface FooterColumn {
  title: string;
  /** Optional link for the column heading itself (e.g. «Отзывы» → #reviews). */
  titleHref?: string;
  links?: NavLink[];
}

export interface FooterProps {
  logoText?: string;
  logoImage?: string;
  /** Legal line under the logo, e.g. «SHIBA TRAVEL CO. LTD». */
  note?: string;
  columns?: FooterColumn[];
  contactsTitle?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
}

/** Multi-column footer: wordmark + nav columns + a contacts column. */
export function Footer({
  logoText,
  logoImage,
  note,
  columns,
  contactsTitle = 'Контакты',
  phone,
  email,
  address,
  whatsapp,
  telegram,
  instagram,
}: FooterProps) {
  const phoneHref = phone
    ? safeHref(phone.startsWith('tel:') ? phone : `tel:${phone.replace(/\s+/g, '')}`)
    : undefined;
  const emailHref = email
    ? safeHref(email.startsWith('mailto:') ? email : `mailto:${email}`)
    : undefined;

  const socials: { kind: ContactKind; href: string }[] = [];
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: 'instagram', href: ig });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: 'telegram', href: tg });
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: 'whatsapp', href: wa });

  return (
    <footer className="sb-footer">
      <div className="sb-footer__inner">
        <div className="sb-footer__brand">
          {safeImageUrl(logoImage) ? (
            <img
              className="sb-footer__logo-img"
              src={safeImageUrl(logoImage)}
              alt={logoText || 'SHIBA CARS'}
            />
          ) : (
            <BrandLogo text={logoText || 'SHIBA CARS'} className="sb-footer__logo" />
          )}
          {note ? <p className="sb-footer__note">{note}</p> : null}
        </div>

        {(columns ?? []).map((col, index) => {
          const titleHref = safeHref(col.titleHref);
          const links = (col.links ?? [])
            .map((l) => ({ label: l.label, href: safeHref(l.href) }))
            .filter((l): l is { label: string; href: string } => Boolean(l.href));
          return (
            <div className="sb-footer__col" key={index}>
              <h4>{titleHref ? <a href={titleHref}>{col.title}</a> : col.title}</h4>
              {links.length > 0 ? (
                <div className="sb-footer__list">
                  {links.map((l, i) => (
                    <a key={i} href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="sb-footer__col sb-footer__col--contacts">
          <h4>{contactsTitle}</h4>
          <div className="sb-footer__list">
            {phoneHref ? <a href={phoneHref}>{phone}</a> : null}
            {emailHref ? <a href={emailHref}>{email}</a> : null}
            {address ? <p className="sb-footer__address">{address}</p> : null}
          </div>
          {socials.length > 0 ? (
            <div className="sb-footer__socials">
              {socials.map((s) => (
                <a
                  key={s.kind}
                  className="sb-icon-link"
                  href={s.href}
                  aria-label={s.kind}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ContactIcon kind={s.kind} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
