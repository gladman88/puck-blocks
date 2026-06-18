import { ContactIcon, type ContactKind } from '../components/ContactIcon';
import { safeHref } from '../sanitize';

export interface MapContactsProps {
  /** Section anchor id (e.g. "contacts"). */
  anchorId?: string;
  heading?: string;
  /** Google Maps EMBED url (the `…/maps/embed?pb=…` iframe src). */
  mapEmbedUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
}

/**
 * Contacts on a full-width Google Map with a dark info card overlaid on the
 * left — mirrors the original site's contacts section.
 */
export function MapContacts({
  anchorId,
  heading,
  mapEmbedUrl,
  phone,
  email,
  address,
  whatsapp,
  telegram,
  instagram,
}: MapContactsProps) {
  const socials: { kind: ContactKind; href: string }[] = [];
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: 'instagram', href: ig });
  if (tg) socials.push({ kind: 'telegram', href: tg });
  if (wa) socials.push({ kind: 'whatsapp', href: wa });

  const map = safeHref(mapEmbedUrl);

  return (
    <section className="sb-map" id={anchorId || 'contacts'}>
      {map ? (
        <iframe
          className="sb-map__frame"
          src={map}
          title={heading || 'Карта'}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : null}

      <div className="sb-map__card">
        {heading ? <h2 className="sb-h2">{heading}</h2> : null}
        <div className="sb-map__lines">
          {phone ? (
            <a className="sb-map__line" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
              {phone}
            </a>
          ) : null}
          {email ? (
            <a className="sb-map__line" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          {address ? <p className="sb-map__line sb-map__address">{address}</p> : null}
        </div>
        {socials.length > 0 ? (
          <div className="sb-map__socials">
            {socials.map((s) => (
              <a key={s.kind} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.kind}>
                <ContactIcon kind={s.kind} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
