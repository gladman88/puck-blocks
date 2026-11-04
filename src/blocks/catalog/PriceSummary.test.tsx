import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  PriceSummary,
  formatSummaryAmount,
  isPriceSummaryVisible,
  parsePriceQuote,
  priceSummaryTotalSatang,
  type PriceQuote,
  type PriceSummaryLeg,
  type PriceSummaryStrings,
} from './PriceSummary';

afterEach(() => cleanup());

const ru: PriceSummaryStrings = {
  title: 'Стоимость',
  rental: 'Аренда',
  free: 'бесплатно',
  delivery: 'Доставка по адресу',
  collection: 'Заберём по адресу',
  ask: 'Укажите адрес',
  total: 'Итого',
  currency: '฿',
};
const en: PriceSummaryStrings = {
  title: 'Price',
  rental: 'Rental',
  free: 'free',
  delivery: 'Delivery',
  collection: 'Collection',
  ask: 'Enter address',
  total: 'Total',
  currency: '฿',
};

const off: PriceSummaryLeg = { enabled: false, hasLocation: false, cost: null };

const oneRate: PriceQuote = {
  total_days: 35,
  rental: { total: '40845.00', lines: [{ days: 35, rate_per_day: '1167.00', amount: '40845.00' }] },
  accessories: [],
  total: '40845.00',
};

function renderSummary(
  props: Partial<{
    quote: PriceQuote;
    pickup: PriceSummaryLeg;
    dropoff: PriceSummaryLeg;
    locale: 'ru' | 'en';
    strings: PriceSummaryStrings;
    onAskAddress: (k: 'pickup' | 'dropoff') => void;
    names: Record<string, string>;
    stale: boolean;
  }> = {},
) {
  return render(
    <PriceSummary
      quote={props.quote ?? oneRate}
      accessoryNames={props.names ?? {}}
      pickup={props.pickup ?? off}
      dropoff={props.dropoff ?? off}
      locale={props.locale ?? 'ru'}
      strings={props.strings ?? ru}
      onAskAddress={props.onAskAddress ?? vi.fn()}
      stale={props.stale}
    />,
  );
}

const value = (kind: string) =>
  Array.from(document.querySelectorAll(`[data-sum="${kind}"] .sb-vd__sum-value`)).map((n) => n.textContent);
const label = (kind: string) =>
  Array.from(document.querySelectorAll(`[data-sum="${kind}"] .sb-vd__sum-label`)).map((n) => n.textContent);

describe('PriceSummary', () => {
  it('renders one rental line and total', () => {
    renderSummary();
    expect(screen.getByText('Стоимость')).toBeTruthy();
    expect(label('rental')).toEqual(['Аренда · 35 дней × 1\u00a0167\u00a0฿']);
    expect(value('rental')).toEqual(['40\u00a0845\u00a0฿']);
    expect(label('total')).toEqual(['Итого']);
    expect(value('total')).toEqual(['40\u00a0845\u00a0฿']);
  });

  it('renders a line per rate', () => {
    renderSummary({
      quote: {
        total_days: 33,
        rental: {
          total: '37500.00',
          lines: [
            { days: 31, rate_per_day: '1100.00', amount: '34100.00' },
            { days: 2, rate_per_day: '1700.00', amount: '3400.00' },
          ],
        },
        accessories: [],
        total: '37500.00',
      },
    });
    expect(label('rental')).toEqual(['Аренда · 31 день × 1\u00a0100\u00a0฿', 'Аренда · 2 дня × 1\u00a0700\u00a0฿']);
    expect(value('rental')).toEqual(['34\u00a0100\u00a0฿', '3\u00a0400\u00a0฿']);
    expect(value('total')).toEqual(['37\u00a0500\u00a0฿']);
  });

  it('an accessory without a name hides the whole block', () => {
    const { container } = renderSummary({
      quote: { ...oneRate, accessories: [{ accessory_id: 'gone', quantity: 1, amount: '500.00' }], total: '41345.00' },
      names: {},
    });
    expect(container.querySelector('.sb-vd__sum')).toBeNull();
  });

  it('stale sums are dimmed and marked busy', () => {
    const { container } = renderSummary({ stale: true });
    const root = container.querySelector('.sb-vd__sum')!;
    expect(root.classList.contains('is-stale')).toBe(true);
    expect(root.getAttribute('aria-busy')).toBe('true');
  });

  it('free accessory says free', () => {
    renderSummary({
      quote: {
        ...oneRate,
        accessories: [
          { accessory_id: 'a1', quantity: 1, amount: '500.00' },
          { accessory_id: 'a2', quantity: 2, amount: '0.00' },
        ],
        total: '41345.00',
      },
      names: { a1: 'Шлем Shark', a2: 'Держатель' },
    });
    expect(label('accessory')).toEqual(['Шлем Shark × 1', 'Держатель × 2']);
    expect(value('accessory')).toEqual(['500\u00a0฿', 'бесплатно']);
    expect(value('total')).toEqual(['41\u00a0345\u00a0฿']);
  });

  it('delivery on without address shows Enter address and excludes it from total', () => {
    const onAskAddress = vi.fn();
    renderSummary({ pickup: { enabled: true, hasLocation: false, cost: null }, onAskAddress });
    expect(label('pickup')).toEqual(['Доставка по адресу']);
    fireEvent.click(screen.getByRole('button', { name: 'Укажите адрес' }));
    expect(onAskAddress).toHaveBeenCalledWith('pickup');
    expect(value('total')).toEqual(['40\u00a0845\u00a0฿']);
  });

  it('priced delivery adds to total', () => {
    renderSummary({ pickup: { enabled: true, hasLocation: true, cost: { price: 500, matched: true } } });
    expect(value('pickup')).toEqual(['500\u00a0฿']);
    expect(value('total')).toEqual(['41\u00a0345\u00a0฿']);
  });

  it('unpriced delivery (matched false / null / loading) has no line', () => {
    for (const cost of [{ price: 0, matched: false }, null, 'loading' as const]) {
      renderSummary({ pickup: { enabled: true, hasLocation: true, cost } });
      expect(document.querySelector('[data-sum="pickup"]')).toBeNull();
      expect(value('total')).toEqual(['40\u00a0845\u00a0฿']);
      cleanup();
    }
    // toggle off → no line at all, even with a priced quote
    renderSummary({ pickup: { enabled: false, hasLocation: true, cost: { price: 500, matched: true } } });
    expect(document.querySelector('[data-sum="pickup"]')).toBeNull();
  });

  it('collection line like delivery', () => {
    const onAskAddress = vi.fn();
    renderSummary({ dropoff: { enabled: true, hasLocation: false, cost: null }, onAskAddress });
    expect(label('dropoff')).toEqual(['Заберём по адресу']);
    fireEvent.click(screen.getByRole('button', { name: 'Укажите адрес' }));
    expect(onAskAddress).toHaveBeenCalledWith('dropoff');
    cleanup();
    renderSummary({
      pickup: { enabled: true, hasLocation: true, cost: { price: 400, matched: true } },
      dropoff: { enabled: true, hasLocation: true, cost: { price: 600, matched: true } },
    });
    expect(value('dropoff')).toEqual(['600\u00a0฿']);
    expect(value('total')).toEqual(['41\u00a0845\u00a0฿']);
  });

  it('sum is exact in satang (0.1 + 0.2 case)', () => {
    renderSummary({
      quote: {
        total_days: 1,
        rental: { total: '0.10', lines: [{ days: 1, rate_per_day: '0.10', amount: '0.10' }] },
        accessories: [],
        total: '0.10',
      },
      pickup: { enabled: true, hasLocation: true, cost: { price: 0.2, matched: true } },
      dropoff: { enabled: true, hasLocation: true, cost: { price: 0.3, matched: true } },
    });
    // float: 0.1 + 0.2 + 0.3 = 0.6000000000000001; satang: 10 + 20 + 30 = 60
    expect(value('total')).toEqual(['0.6\u00a0฿']);
  });

  it('en strings', () => {
    renderSummary({
      locale: 'en',
      strings: en,
      quote: {
        ...oneRate,
        rental: { total: '1167.00', lines: [{ days: 1, rate_per_day: '1167.00', amount: '1167.00' }] },
        accessories: [{ accessory_id: 'a1', quantity: 1, amount: '0' }],
        total: '1167.00',
      },
      names: { a1: 'Helmet' },
      pickup: { enabled: true, hasLocation: false, cost: null },
      dropoff: { enabled: true, hasLocation: true, cost: { price: 300, matched: true } },
    });
    expect(screen.getByText('Price')).toBeTruthy();
    expect(label('rental')).toEqual(['Rental · 1 day × 1\u00a0167\u00a0฿']);
    expect(value('accessory')).toEqual(['free']);
    expect(label('pickup')).toEqual(['Delivery']);
    expect(screen.getByRole('button', { name: 'Enter address' })).toBeTruthy();
    expect(label('dropoff')).toEqual(['Collection']);
    expect(label('total')).toEqual(['Total']);
    expect(value('total')).toEqual(['1\u00a0467\u00a0฿']);
  });

  it('currency is ฿', () => {
    renderSummary({ pickup: { enabled: true, hasLocation: true, cost: { price: 500, matched: true } } });
    const card = document.querySelector('.sb-vd__sum-card')!;
    expect(card.textContent).not.toContain('THB');
    expect(label('rental')).toEqual(['Аренда · 35 дней × 1\u00a0167\u00a0฿']);
    for (const v of [...value('rental'), ...value('pickup'), ...value('total')]) expect(v).toMatch(/\u00a0฿$/);
  });

  it('total helper shared with success', () => {
    const pickup: PriceSummaryLeg = { enabled: true, hasLocation: true, cost: { price: 400, matched: true } };
    const dropoff: PriceSummaryLeg = { enabled: true, hasLocation: false, cost: null }; // «Укажите адрес» — not in the total
    const satang = priceSummaryTotalSatang(oneRate, pickup, dropoff);
    expect(satang).toBe(4124500);
    expect(formatSummaryAmount(satang, '฿')).toBe('41\u00a0245\u00a0฿');
    renderSummary({ pickup, dropoff });
    // The block's «Итого» is exactly the helper's result.
    expect(value('total')).toEqual([formatSummaryAmount(satang, '฿')]);
    // Unpriced legs (loading / no zone) add nothing.
    expect(
      priceSummaryTotalSatang(oneRate, { enabled: true, hasLocation: true, cost: 'loading' }, off),
    ).toBe(4084500);
  });
});

describe('isPriceSummaryVisible', () => {
  it('one predicate for the block and the success total', () => {
    const withAcc: PriceQuote = { ...oneRate, accessories: [{ accessory_id: 'a1', quantity: 1, amount: '500.00' }] };
    expect(isPriceSummaryVisible(oneRate, {})).toBe(true);
    expect(isPriceSummaryVisible(withAcc, { a1: 'Шлем' })).toBe(true);
    // An accessory we cannot name → no block (and no success total).
    expect(isPriceSummaryVisible(withAcc, {})).toBe(false);
    expect(isPriceSummaryVisible(null, {})).toBe(false);
    expect(isPriceSummaryVisible(undefined, {})).toBe(false);
    renderSummary({ quote: withAcc, names: {} });
    expect(document.querySelector('.sb-vd__sum')).toBeNull();
  });
});

describe('parsePriceQuote', () => {
  it('accepts the documented response and rejects rental: null', () => {
    expect(parsePriceQuote({ ...oneRate })).toEqual(oneRate);
    expect(parsePriceQuote({ total_days: 3, rental: null, accessories: [], total: null })).toBeNull();
    expect(parsePriceQuote({ id: 'v1', display_name: 'BMW' })).toBeNull();
    expect(parsePriceQuote(null)).toBeNull();
  });
});
