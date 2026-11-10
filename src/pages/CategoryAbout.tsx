import { ContactIcon } from '../components/ContactIcon';
import { safeHref } from '../sanitize';
import { IconBadge } from './icons';
import { splitParagraphs } from './model';
import { PAGE_STRINGS } from './strings';

export interface CategoryAboutProps {
  locale: 'ru' | 'en';
  /** Heading of the text column (the host's: category / type h2). */
  heading?: string;
  eyebrow?: string;
  /** Category / type text; blank lines split paragraphs. */
  text: string;
  /** «Поможем выбрать» buttons — from the site's contacts, not literals. */
  telegramUrl?: string;
  whatsappUrl?: string;
}

/**
 * Bottom of a category / type page: the text on the left, the «Поможем
 * выбрать» card (badge, title, hint, Telegram + WhatsApp) on the right; one
 * column on ≤1024px. The card is drawn only with at least one contact link.
 */
export function CategoryAbout({ locale, heading, eyebrow, text, telegramUrl: tgRaw, whatsappUrl: waRaw }: CategoryAboutProps) {
  const telegramUrl = safeHref(tgRaw);
  const whatsappUrl = safeHref(waRaw);
  const t = PAGE_STRINGS[locale];
  const paragraphs = splitParagraphs(text);
  const help = Boolean(telegramUrl || whatsappUrl);
  if (paragraphs.length === 0 && !help) return null;

  return (
    <section className="sb-section sb-mp-sec">
      <div className="sb-container sb-mc-about">
        {paragraphs.length > 0 ? (
          <div>
            {eyebrow ? <p className="sb-mp-eyebrow">{eyebrow}</p> : null}
            {heading ? <h2 className="sb-h2">{heading}</h2> : null}
            {paragraphs.map((p, i) => (
              <p key={i} className="sb-mp-text">
                {p}
              </p>
            ))}
          </div>
        ) : null}
        {help ? (
          <aside className="sb-mc-help">
            <IconBadge name="chat" />
            <h3>{t.helpTitle}</h3>
            <p>{t.helpText}</p>
            <div className="sb-mc-help__btns">
              {telegramUrl ? (
                <a className="sb-mp-btn-ghost" href={telegramUrl} target="_blank" rel="noopener noreferrer">
                  <ContactIcon kind="telegram" className="sb-mp-ic" />
                  Telegram
                </a>
              ) : null}
              {whatsappUrl ? (
                <a className="sb-mp-btn-ghost" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <ContactIcon kind="whatsapp" className="sb-mp-ic" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
