import { useState, type FormEvent } from 'react';
import { Section } from '../components/Section';
import { safeImageUrl } from '../sanitize';

export interface LeadFormProps {
  heading?: string;
  text?: string;
  /** Label above the messenger select. */
  contactLabel?: string;
  buttonLabel?: string;
  successMessage?: string;
  /** Backend endpoint that receives { name, phone, contact_method }. */
  endpoint?: string;
  /** Photo shown beside the form (right column). */
  image?: string;
}

type Status = 'idle' | 'sending' | 'ok' | 'err';

/**
 * Lead/booking card: title + form on the left, a photo on the right (matches
 * the site's «подача за 2 часа» block). Client-interactive — posts JSON to
 * `endpoint`; with no endpoint it just shows the success message (editor
 * preview). Renders inside a client boundary, so no framework directive needed.
 */
export function LeadForm({
  heading,
  text,
  contactLabel = 'Как с вами связаться?',
  buttonLabel = 'Забронировать',
  successMessage = 'Спасибо! Мы скоро свяжемся с вами.',
  endpoint,
  image,
}: LeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('whatsapp');
  const [status, setStatus] = useState<Status>('idle');
  const img = safeImageUrl(image);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phone.trim()) return;
    if (!endpoint) {
      setStatus('ok');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, contact_method: method }),
      });
      setStatus(res.ok ? 'ok' : 'err');
    } catch {
      setStatus('err');
    }
  };

  return (
    <Section className="sb-leadform">
      <div className={`sb-leadform__card ${img ? '' : 'sb-leadform__card--solo'}`} id="leadform">
        <div className="sb-leadform__form">
          {heading ? <h2 className="sb-h2">{heading}</h2> : null}
          {text ? <p className="sb-lead">{text}</p> : null}

          {status === 'ok' ? (
            <p className="sb-form__status sb-form__status--ok">{successMessage}</p>
          ) : (
            <form className="sb-form" onSubmit={onSubmit}>
              <input
                className="sb-input"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="sb-input"
                type="tel"
                placeholder="Телефон"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              {contactLabel ? <label className="sb-leadform__label">{contactLabel}</label> : null}
              <select
                className="sb-select"
                aria-label={contactLabel || 'Способ связи'}
                value={method}
                onChange={(event) => setMethod(event.target.value)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="phone">Телефон</option>
              </select>
              <button className="sb-btn" type="submit" disabled={status === 'sending'}>
                {buttonLabel}
              </button>
              {status === 'err' ? (
                <p className="sb-form__status sb-form__status--err">
                  Ошибка отправки. Попробуйте ещё раз.
                </p>
              ) : null}
            </form>
          )}
        </div>

        {img ? (
          <div className="sb-leadform__media">
            <img src={img} alt={heading ?? ''} loading="lazy" />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
