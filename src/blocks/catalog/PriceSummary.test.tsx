import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  PriceSummary,
  parsePriceQuote,
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
  currency: 'THB',
};
const en: PriceSummaryStrings = {
  title: 'Price',
  rental: 'Rental',
  free: 'free',
  delivery: 'Delivery',
  collection: 'Collection',
  ask: 'Enter address',
  total: 'Total',
  currency: 'THB',
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
    expect(label('rental')).toEqual(['Аренда · 35 дней × 1,167 THB']);
    expect(value('rental')).toEqual(['40,845 THB']);
    expect(label('total')).toEqual(['Итого']);
    expect(value('total')).toEqual(['40,845 THB']);
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
    expect(label('rental')).toEqual(['Аренда · 31 день × 1,100 THB', 'Аренда · 2 дня × 1,700 THB']);
    expect(value('rental')).toEqual(['34,100 THB', '3,400 THB']);
    expect(value('total')).toEqual(['37,500 THB']);
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
    expect(value('accessory')).toEqual(['500 THB', 'бесплатно']);
    expect(value('total')).toEqual(['41,345 THB']);
  });

  it('delivery on without address shows Enter address and excludes it from total', () => {
    const onAskAddress = vi.fn();
    renderSummary({ pickup: { enabled: true, hasLocation: false, cost: null }, onAskAddress });
    expect(label('pickup')).toEqual(['Доставка по адресу']);
    fireEvent.click(screen.getByRole('button', { name: 'Укажите адрес' }));
    expect(onAskAddress).toHaveBeenCalledWith('pickup');
    expect(value('total')).toEqual(['40,845 THB']);
  });

  it('priced delivery adds to total', () => {
    renderSummary({ pickup: { enabled: true, hasLocation: true, cost: { price: 500, matched: true } } });
    expect(value('pickup')).toEqual(['500 THB']);
    expect(value('total')).toEqual(['41,345 THB']);
  });

  it('unpriced delivery (matched false / null / loading) has no line', () => {
    for (const cost of [{ price: 0, matched: false }, null, 'loading' as const]) {
      renderSummary({ pickup: { enabled: true, hasLocation: true, cost } });
      expect(document.querySelector('[data-sum="pickup"]')).toBeNull();
      expect(value('total')).toEqual(['40,845 THB']);
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
    expect(value('dropoff')).toEqual(['600 THB']);
    expect(value('total')).toEqual(['41,845 THB']);
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
    expect(value('total')).toEqual(['0.6 THB']);
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
    expect(label('rental')).toEqual(['Rental · 1 day × 1,167 THB']);
    expect(value('accessory')).toEqual(['free']);
    expect(label('pickup')).toEqual(['Delivery']);
    expect(screen.getByRole('button', { name: 'Enter address' })).toBeTruthy();
    expect(label('dropoff')).toEqual(['Collection']);
    expect(label('total')).toEqual(['Total']);
    expect(value('total')).toEqual(['1,467 THB']);
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
