import { useState, type FormEvent } from 'react';
import { Section } from '../components/Section';

export interface LeadFormProps {
  heading?: string;
  text?: string;
  buttonLabel?: string;
  successMessage?: string;
  /** Backend endpoint that receives { name, phone, contact_method }. */
  endpoint?: string;
}

type Status = 'idle' | 'sending' | 'ok' | 'err';

/**
 * Lead/booking form. Client-interactive (manages its own state), posts JSON to
 * `endpoint`. With no endpoint configured it just shows the success message
 * (useful in the editor preview). The whole tree renders inside a client
 * boundary on the site, so this needs no framework-specific directive.
 */
export function LeadForm({
  heading,
  text,
  buttonLabel = 'Отправить заявку',
  successMessage = 'Спасибо! Мы скоро свяжемся с вами.',
  endpoint,
}: LeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('whatsapp');
  const [status, setStatus] = useState<Status>('idle');

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
      <div className="sb-leadform__inner" id="leadform">
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
            <select
              className="sb-select"
              aria-label="Способ связи"
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
    </Section>
  );
}
