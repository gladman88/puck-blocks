import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { CardPriceOverlay, CardTitle, type CardPriceOverlayProps } from './CardPriceOverlay';
import { STRINGS, type CardPrices } from '../VehicleCatalog';

afterEach(cleanup);

const NB = '\u00a0';
const prices: CardPrices = {
  per_day_min: '1666.01',
  per_day_max: '2200.00',
  quotes: [
    { days: 7, total: '12600.00' },
    { days: 14, total: '23800.40' },
    { days: 30, total: '126000.00' },
  ],
  month_discount_pct: 34.6,
};

function renderOverlay(over: Partial<CardPriceOverlayProps> = {}) {
  return render(
    <CardPriceOverlay
      statusText="Свободна сейчас"
      statusTone="available"
      prices={prices}
      minPricePerDay={1400}
      strings={STRINGS.ru}
      {...over}
    />,
  );
}

describe('CardPriceOverlay', () => {
  it('status, per-day range rounded up and 7/14/30 sums', () => {
    const { container } = renderOverlay();
    expect(container.querySelector('.sb-vcard__status--available')?.textContent).toBe('Свободна сейчас');
    const range = container.querySelector('.sb-vcard__range')!;
    expect(range.querySelector('small')?.textContent).toBe('в сутки');
    expect(range.querySelector('b')?.textContent).toBe(`1${NB}667 – 2${NB}200${NB}฿`);
    expect(Array.from(container.querySelectorAll('.sb-vcard__tile-sum')).map((n) => n.textContent)).toEqual([
      `12${NB}600${NB}฿`,
      `23${NB}801${NB}฿`,
      `126${NB}000${NB}฿`,
    ]);
    expect(container.querySelector('.sb-vcard__tiles')?.classList.contains('sb-vcard__tiles--xl')).toBe(true);
    expect(container.querySelector('.sb-vcard__tile--best .sb-vcard__flag')?.textContent).toBe('−35%');
    expect(container.querySelector('[class*="--fraction"]')).toBeNull();
  });

  it('equal min and max show one price', () => {
    const { container } = renderOverlay({ prices: { ...prices, per_day_min: '2000.00', per_day_max: '2000' } });
    expect(container.querySelector('.sb-vcard__range b')?.textContent).toBe(`2${NB}000${NB}฿`);
  });

  it('tones: free is amber, busy is plain', () => {
    const free = renderOverlay({ statusTone: 'free', statusText: 'Освободится 14 октября' });
    expect(free.container.querySelector('.sb-vcard__status--free')?.textContent).toBe('Освободится 14 октября');
    cleanup();
    const busy = renderOverlay({ statusTone: 'busy', statusText: 'Занята' });
    const status = busy.container.querySelector('.sb-vcard__status')!;
    expect(status.className).toBe('sb-vcard__status');
  });

  it('no prices: from-price, then on request; no tiles', () => {
    const from = renderOverlay({ prices: null, minPricePerDay: 5000 });
    expect(from.container.querySelector('.sb-vcard__range')?.textContent).toBe(`от 5${NB}000 ฿/день`);
    cleanup();
    // The fallback is rounded up to whole baht like the range.
    const ceil = renderOverlay({ prices: null, minPricePerDay: 1666.01, strings: STRINGS.en });
    expect(ceil.container.querySelector('.sb-vcard__from span')?.textContent).toBe(`1${NB}667`);
    expect(from.container.querySelector('.sb-vcard__tiles')).toBeNull();
    cleanup();
    const none = renderOverlay({ prices: null, minPricePerDay: null, strings: STRINGS.en });
    expect(none.container.querySelector('.sb-vcard__range')?.textContent).toBe('on request');
  });

  it('dimmed row and the status slot', () => {
    const { container } = renderOverlay({ dimmed: true, statusSlot: <span className="slot">x</span> });
    expect(container.querySelector('.sb-vcard__st.is-copied .slot')).not.toBeNull();
  });
});

describe('CardTitle', () => {
  it('name, year and category with a dot between', () => {
    const { container, getByRole } = render(<CardTitle name="BYD Seal 308" year={2024} categoryName="EVs" />);
    expect(getByRole('heading', { name: 'BYD Seal 308' })).toBeTruthy();
    expect(container.querySelector('.sb-vcard__sub')?.textContent).toBe('2024EVs');
    expect(container.querySelector('.sb-vcard__sub i')).not.toBeNull();
  });

  it('no year and no category → no sub line', () => {
    const { container } = render(<CardTitle name="X" year={null} categoryName={null} />);
    expect(container.querySelector('.sb-vcard__sub')).toBeNull();
  });
});
