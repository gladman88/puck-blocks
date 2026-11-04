import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react';
import { VehicleCard, type VehicleCardProps } from './VehicleCard';
import { STRINGS, VehicleCatalog, type CardPrices, type CatalogVehicle } from '../VehicleCatalog';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (navigator as unknown as { share?: unknown }).share;
  window.history.replaceState(null, '', '/');
});

const NB = '\u00a0';

const prices: CardPrices = {
  per_day_min: '1400.00',
  per_day_max: '2000.00',
  quotes: [
    { days: 7, total: '12600.00' },
    { days: 14, total: '23800.00' },
    { days: 30, total: '42000.00' },
  ],
  month_discount_pct: 30,
};

const cat = { id: 'c1', name: 'Электрокары', name_en: 'EVs', color: '#00f' };
const vehicle: CatalogVehicle = {
  id: 'v1',
  display_name: 'BYD Seal 308',
  brand: 'BYD',
  model: 'Seal',
  color: 'white',
  photo_url: 'https://cdn.example/seal.jpg',
  vehicle_type: 'car',
  year: 2024,
  category: cat,
  min_price_per_day: 1400,
  is_available: true,
  free_from: null,
  free_from_time: null,
  card_prices: prices,
};

function renderCard(over: Partial<VehicleCardProps> = {}) {
  const onOpen = vi.fn();
  const utils = render(
    <VehicleCard
      vehicle={vehicle}
      total={1}
      availableCount={1}
      categoryName="Электрокары"
      hasCompleteDateRange={false}
      locale="ru"
      strings={STRINGS.ru}
      onOpen={onOpen}
      {...over}
    />,
  );
  return { ...utils, onOpen };
}

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

function stubCatalogFetch(vehicles: unknown[], categories: unknown[] = [cat]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve(
        new Response(JSON.stringify(String(url).includes('/categories/') ? categories : vehicles), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    ),
  );
}

describe('VehicleCard', () => {
  it('renders name, year, status, per-day range and three sums', () => {
    const { container } = renderCard();
    expect(screen.getByRole('heading', { name: 'BYD Seal 308' })).toBeTruthy();
    expect(container.querySelector('.sb-vcard__sub')?.textContent).toContain('2024');
    expect(container.querySelector('.sb-vcard__status--available')?.textContent).toBe('Свободно сегодня');
    const range = container.querySelector('.sb-vcard__range')!;
    expect(range.querySelector('small')?.textContent).toBe('в сутки');
    expect(range.querySelector('b')?.textContent).toBe(`1${NB}400 – 2${NB}000${NB}฿`);
    expect(range.querySelector('b span')?.textContent).toBe(`1${NB}400`); // min is the gold part
    const tiles = Array.from(container.querySelectorAll('.sb-vcard__tile'));
    expect(tiles.map((t) => t.querySelector('.sb-vcard__tile-days')?.textContent)).toEqual(['7 дней', '14 дней', '30 дней']);
    expect(tiles.map((t) => t.querySelector('.sb-vcard__tile-sum')?.textContent)).toEqual([
      `12${NB}600${NB}฿`,
      `23${NB}800${NB}฿`,
      `42${NB}000${NB}฿`,
    ]);
    // No «per day» line inside a tile.
    expect(tiles.some((t) => t.textContent?.includes('в сутки'))).toBe(false);
    // Selected window → «Свободно».
    cleanup();
    const again = renderCard({ hasCompleteDateRange: true });
    expect(again.container.querySelector('.sb-vcard__status')?.textContent).toBe('Свободно');
  });

  it('month tile shows discount only when > 0', () => {
    const { container } = renderCard();
    const best = container.querySelector('.sb-vcard__tile--best')!;
    expect(best.querySelector('.sb-vcard__tile-days')?.textContent).toBe('30 дней');
    expect(best.querySelector('.sb-vcard__flag')?.textContent).toBe('−30%');
    expect(container.querySelectorAll('.sb-vcard__flag')).toHaveLength(1);
    cleanup();
    const zero = renderCard({ vehicle: { ...vehicle, card_prices: { ...prices, month_discount_pct: 0 } } });
    expect(zero.container.querySelector('.sb-vcard__tile--best')).not.toBeNull();
    expect(zero.container.querySelector('.sb-vcard__flag')).toBeNull();
  });

  it('six-digit sum gets the long class', () => {
    const big = { ...prices, quotes: [...prices.quotes.slice(0, 2), { days: 30, total: '126000.00' }] };
    const { container } = renderCard({ vehicle: { ...vehicle, card_prices: big } });
    const sums = Array.from(container.querySelectorAll('.sb-vcard__tile-sum'));
    expect(sums.map((s) => s.classList.contains('sb-vcard__tile-sum--long'))).toEqual([false, false, true]);
    expect(sums[2].textContent).toBe(`126${NB}000${NB}฿`);
  });

  it('no card_prices falls back to from-price / on request', () => {
    const { container } = renderCard({ vehicle: { ...vehicle, card_prices: null, min_price_per_day: 5000 } });
    expect(container.querySelector('.sb-vcard__range')?.textContent).toBe(`от 5${NB}000 ฿/день`);
    expect(container.querySelector('.sb-vcard__tiles')).toBeNull();
    cleanup();
    // Older backend: no field at all, no price either.
    const noField = { ...vehicle, min_price_per_day: null } as CatalogVehicle;
    delete noField.card_prices;
    const r = renderCard({ vehicle: noField });
    expect(r.container.querySelector('.sb-vcard__range')?.textContent).toBe('по запросу');
    expect(r.container.querySelector('.sb-vcard__tiles')).toBeNull();
  });

  it('photo click and Book open the vehicle', () => {
    const { onOpen } = renderCard();
    const photo = screen.getByRole('button', { name: 'BYD Seal 308' });
    fireEvent.click(photo);
    expect(onOpen).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Забронировать' }));
    expect(onOpen).toHaveBeenCalledTimes(2);
    // Keyboard: the photo is a real <button> (Enter/Space natively), focusable.
    photo.focus();
    expect(document.activeElement).toBe(photo);
  });

  it('share copied shows toast for 2s and check on the button', async () => {
    vi.useFakeTimers();
    const writeText = stubClipboard();
    const { container } = renderCard({ referralCode: 'AG1' });
    const share = screen.getByRole('button', { name: 'Поделиться' });
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('');

    await act(async () => {
      fireEvent.click(share);
    });
    expect(writeText.mock.calls[0][0]).toContain('vehicle=v1');
    expect(writeText.mock.calls[0][0]).toContain('ref=AG1');
    expect(status.textContent).toBe('Ссылка скопирована');
    expect(status.querySelector('.sb-vcard__toast.is-shown')).not.toBeNull();
    expect(container.querySelector('.sb-vcard__st.is-copied')).not.toBeNull();
    expect(share.classList.contains('is-done')).toBe(true);

    act(() => vi.advanceTimersByTime(1999));
    expect(status.querySelector('.sb-vcard__toast.is-shown')).not.toBeNull();
    expect(share.classList.contains('is-done')).toBe(true);

    act(() => vi.advanceTimersByTime(1));
    // Slides back out, status and range return.
    expect(status.querySelector('.sb-vcard__toast.is-shown')).toBeNull();
    expect(container.querySelector('.sb-vcard__st.is-copied')).toBeNull();
    expect(share.classList.contains('is-done')).toBe(false);

    act(() => vi.advanceTimersByTime(220));
    expect(status.textContent).toBe('');
  });

  it('share dismissed shows nothing', async () => {
    const shareFn = vi.fn().mockRejectedValue(new Error('AbortError'));
    Object.defineProperty(navigator, 'share', { value: shareFn, configurable: true });
    const { container } = renderCard();
    const share = screen.getByRole('button', { name: 'Поделиться' });
    await act(async () => {
      fireEvent.click(share);
    });
    expect(shareFn).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe('');
    expect(container.querySelector('.sb-vcard__st.is-copied')).toBeNull();
    expect(share.classList.contains('is-done')).toBe(false);
  });

  it('en strings', async () => {
    const writeText = stubClipboard();
    const busy = { ...vehicle, id: 'v2', display_name: 'Busy One', model: 'B', is_available: false, card_prices: null, min_price_per_day: null };
    const later = { ...vehicle, id: 'v3', display_name: 'Later One', model: 'L', is_available: false, free_from: '2026-08-01', card_prices: null };
    const grouped = { ...vehicle, id: 'v4' };
    stubCatalogFetch([vehicle, grouped, busy, later]);
    const { container } = render(<VehicleCatalog vehicleType="car" locale="en" />);
    await screen.findByText('BYD Seal 308');

    const card = Array.from(container.querySelectorAll('.sb-vcard')).find((c) => c.textContent?.includes('BYD Seal 308'))!;
    const c = within(card as HTMLElement);
    expect(card.querySelector('.sb-vcard__status')?.textContent).toBe('Available today');
    expect(card.querySelector('.sb-vcard__range small')?.textContent).toBe('per day');
    expect(Array.from(card.querySelectorAll('.sb-vcard__tile-days')).map((d) => d.textContent)).toEqual([
      '7 days',
      '14 days',
      '30 days',
    ]);
    expect(card.querySelector('.sb-vcard__count')?.textContent).toBe('2 available');
    expect(card.querySelector('.sb-vcard__cat')?.textContent).toBe('EVs');
    expect(c.getByRole('button', { name: 'Book' })).toBeTruthy();
    const share = c.getByRole('button', { name: 'Share' });
    await act(async () => {
      fireEvent.click(share);
    });
    expect(writeText).toHaveBeenCalled();
    expect(c.getByRole('status').textContent).toBe('Link copied');

    const statuses = Array.from(container.querySelectorAll('.sb-vcard__status')).map((s) => s.textContent);
    expect(statuses).toContain('busy');
    expect(statuses).toContain('free from 01 Aug');
    expect(container.textContent).toContain('on request');
    expect(container.textContent).toContain(`from 1${NB}400 ฿/day`);
    // Nothing Russian left on the English page.
    expect(container.textContent).not.toMatch(/[а-яё]/i);
  });

  it('root is not a button (no nested buttons)', () => {
    const { container } = renderCard();
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('ARTICLE');
    expect(root.classList.contains('sb-vcard')).toBe(true);
    const buttons = Array.from(container.querySelectorAll('button'));
    expect(buttons).toHaveLength(3); // photo, Book, Share
    expect(buttons.some((b) => b.querySelector('button'))).toBe(false);
    expect(buttons.some((b) => b.parentElement?.closest('button'))).toBe(false);
  });

  it('category shown only on All tab', async () => {
    const other = { id: 'c2', name: 'Премиум', color: '#f00' };
    stubCatalogFetch([vehicle, { ...vehicle, id: 'v9', model: 'Z4', display_name: 'BMW Z4', category: other }], [cat, other]);
    const { container } = render(<VehicleCatalog vehicleType="car" />);
    await screen.findByText('BYD Seal 308');
    // Default tab is «Все» → category under the year.
    expect(Array.from(container.querySelectorAll('.sb-vcard__cat')).map((e) => e.textContent)).toEqual([
      'Электрокары',
      'Премиум',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Премиум' }));
    expect(container.querySelectorAll('.sb-vcard')).toHaveLength(1);
    expect(container.querySelector('.sb-vcard__cat')).toBeNull();
    expect(container.querySelector('.sb-vcard__sub')?.textContent).toBe('2024');
  });

  it('count pill shown for grouped models', () => {
    const single = renderCard();
    expect(single.container.querySelector('.sb-vcard__count')).toBeNull();
    cleanup();
    const free = renderCard({ total: 4, availableCount: 3 });
    expect(free.container.querySelector('.sb-vcard__top .sb-vcard__count')?.textContent).toBe('3 свободно');
    cleanup();
    const allBusy = renderCard({ total: 4, availableCount: 0, vehicle: { ...vehicle, is_available: false } });
    expect(allBusy.container.querySelector('.sb-vcard__count')?.textContent).toBe('4 всего');
  });
  it('tile sums are whole baht, rounded up (fractional month rate)', () => {
    renderCard({ vehicle: { ...vehicle, card_prices: { per_day_min: '2166.67', per_day_max: '4000.00', month_discount_pct: 46,
      quotes: [{ days: 7, total: '24500.00' }, { days: 14, total: '42000.00' }, { days: 30, total: '65000.10' }] } } });
    const sums = [...document.querySelectorAll('.sb-vcard__tile-sum')].map((e) => e.textContent!.replace(/\s/g, ' '));
    expect(sums).toEqual(['24 500 ฿', '42 000 ฿', '65 001 ฿']);
  });
  it('fractional per-day range is rounded up to whole baht, no fraction style', () => {
    const { container } = renderCard({ vehicle: { ...vehicle, card_prices: { per_day_min: '1833.33', per_day_max: '2500.00', month_discount_pct: 27,
      quotes: [{ days: 7, total: '16100.00' }, { days: 14, total: '29400.00' }, { days: 30, total: '55000.00' }] } } });
    const range = container.querySelector('.sb-vcard__range')!;
    expect(range.classList.contains('sb-vcard__range--fraction')).toBe(false);
    expect(container.querySelector('[class*="--fraction"]')).toBeNull();
    expect(range.querySelector('b')?.textContent).toBe(`1${NB}834 – 2${NB}500${NB}฿`);
    expect(range.querySelector('b span')?.textContent).toBe(`1${NB}834`);
  });

  it('copied plate is mounted before the click (so it can slide in) and empty until shown', () => {
    const { container } = renderCard();
    const toast = container.querySelector('.sb-vcard__toast')!;
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('');
    expect(toast.classList.contains('is-shown')).toBe(false);
  });
});
