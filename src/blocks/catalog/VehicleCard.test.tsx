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

  it('one type step for the whole tile row, by its longest sum', () => {
    const tiles = (quotes: { days: number; total: string }[]) => {
      const { container } = renderCard({ vehicle: { ...vehicle, card_prices: { ...prices, quotes } } });
      const row = container.querySelector('.sb-vcard__tiles')!;
      const cls = ['sb-vcard__tiles--l', 'sb-vcard__tiles--xl'].filter((c) => row.classList.contains(c));
      cleanup();
      return cls;
    };
    // «4 200 ฿ / 7 700 ฿» fit the reference type; one five-digit sum shrinks the whole row.
    expect(tiles([{ days: 7, total: '4200.00' }, { days: 14, total: '7700.00' }])).toEqual([]);
    expect(
      tiles([{ days: 7, total: '4200.00' }, { days: 14, total: '7700.00' }, { days: 30, total: '14266.40' }]),
    ).toEqual(['sb-vcard__tiles--l']);
    expect(
      tiles([{ days: 7, total: '84000.00' }, { days: 14, total: '154000.00' }, { days: 30, total: '180000.00' }]),
    ).toEqual(['sb-vcard__tiles--xl']);
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
    expect(allBusy.container.querySelector('.sb-vcard__count')?.textContent).toBe('4 машины');
  });
  it('group size is declined in ru and pluralised in en', () => {
    expect([1, 2, 5, 11, 21, 22, 25].map((n) => STRINGS.ru.units(n))).toEqual([
      '1 машина', '2 машины', '5 машин', '11 машин', '21 машина', '22 машины', '25 машин',
    ]);
    expect([1, 3].map((n) => STRINGS.en.units(n))).toEqual(['1 car', '3 cars']);
    const busy = renderCard({ total: 5, availableCount: 0, locale: 'en', strings: STRINGS.en,
      vehicle: { ...vehicle, is_available: false } });
    expect(busy.container.querySelector('.sb-vcard__count')?.textContent).toBe('5 cars');
  });
  it('bike groups are worded as bikes (ru declension, en plural)', () => {
    expect([1, 3, 5, 11, 21, 24].map((n) => STRINGS.ru.units(n, 'motorcycle'))).toEqual([
      '1 байк', '3 байка', '5 байков', '11 байков', '21 байк', '24 байка',
    ]);
    expect([1, 3].map((n) => STRINGS.en.units(n, 'motorcycle'))).toEqual(['1 bike', '3 bikes']);
    const bike: CatalogVehicle = { ...vehicle, vehicle_type: 'motorcycle', is_available: false };
    const ru = renderCard({ total: 3, availableCount: 0, vehicle: bike });
    expect(ru.container.querySelector('.sb-vcard__count')?.textContent).toBe('3 байка');
    cleanup();
    const en = renderCard({ total: 5, availableCount: 0, locale: 'en', strings: STRINGS.en, vehicle: bike });
    expect(en.container.querySelector('.sb-vcard__count')?.textContent).toBe('5 bikes');
  });

  describe('href (model page link)', () => {
    const HREF = '/ru/cars/byd-seal';
    it('no href → the open overlay is a button, no link anywhere (default)', () => {
      const { container } = renderCard();
      expect(container.querySelector('a')).toBeNull();
      expect(container.firstElementChild?.tagName).toBe('ARTICLE');
      expect(container.querySelector('.sb-vcard__open')?.tagName).toBe('BUTTON');
    });
    it('href → the card root stays an <article>; the open overlay is the link', () => {
      const { container } = renderCard({ href: HREF });
      const root = container.firstElementChild!;
      expect(root.tagName).toBe('ARTICLE');
      expect(root.classList.contains('sb-vcard')).toBe(true);
      const link = screen.getByRole('link', { name: 'BYD Seal 308' });
      expect(link.classList.contains('sb-vcard__open')).toBe(true);
      expect(link.getAttribute('href')).toBe(HREF);
      expect(container.querySelectorAll('a')).toHaveLength(1);
    });
    it('no interactive element is nested inside the link', () => {
      const { container } = renderCard({ href: HREF });
      const link = screen.getByRole('link');
      expect(link.querySelector('button')).toBeNull();
      expect(link.querySelector('a, input, select, textarea')).toBeNull();
      // «Забронировать» and «Поделиться» are still there, outside the link.
      const buttons = Array.from(container.querySelectorAll('button'));
      expect(buttons.map((b) => b.className.split(' ')[0])).toEqual(['sb-vcard__book', 'sb-vcard__share']);
      expect(buttons.some((b) => b.closest('a'))).toBe(false);
    });
    it('a plain click on the link opens the window and does not navigate', () => {
      const { onOpen } = renderCard({ href: HREF });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      screen.getByRole('link').dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });
    it.each([
      ['ctrl', { ctrlKey: true }],
      ['meta', { metaKey: true }],
      ['shift', { shiftKey: true }],
      ['alt', { altKey: true }],
      ['middle', { button: 1 }],
    ])('%s click is left to the browser (new tab/window)', (_, init) => {
      const { onOpen } = renderCard({ href: HREF });
      // Record what the card did, then stop jsdom's (unimplemented) navigation.
      const seen: boolean[] = [];
      const stop = (e: Event) => {
        seen.push(e.defaultPrevented);
        e.preventDefault();
      };
      window.addEventListener('click', stop);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
      screen.getByRole('link').dispatchEvent(click);
      window.removeEventListener('click', stop);
      expect(seen).toEqual([false]);
      expect(onOpen).not.toHaveBeenCalled();
    });
    it('«Забронировать» next to the link opens the window once', () => {
      const { container, onOpen } = renderCard({ href: HREF });
      fireEvent.click(container.querySelector('.sb-vcard__book')!);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });
    it('«Поделиться» next to the link shares and does not open the window', async () => {
      const writeText = stubClipboard();
      const { container, onOpen } = renderCard({ href: HREF });
      await act(async () => {
        fireEvent.click(container.querySelector('.sb-vcard__share')!);
      });
      expect(onOpen).not.toHaveBeenCalled();
      expect(writeText).toHaveBeenCalledTimes(1);
    });
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
