import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { StrictMode } from 'react';
import {
  VehicleCatalog,
  categoryLabel,
  groupVehicles,
  orderCatalogCards,
  pickRepresentative,
  vehicleModelHref,
  type CatalogVehicle,
} from './VehicleCatalog';

describe('categoryLabel', () => {
  it('uses name_en on the English catalog when the category has been translated', () => {
    expect(categoryLabel({ name: 'Премиум', name_en: 'Premium' }, 'en')).toBe('Premium');
  });

  it('falls back to `name` (ru) on English when the category has no translation yet', () => {
    expect(categoryLabel({ name: 'Премиум', name_en: '' }, 'en')).toBe('Премиум');
    expect(categoryLabel({ name: 'Премиум' }, 'en')).toBe('Премиум');
  });

  it('always uses `name` on the Russian catalog, even if name_en is set', () => {
    expect(categoryLabel({ name: 'Премиум', name_en: 'Premium' }, 'ru')).toBe('Премиум');
  });
});

afterEach(() => {
  cleanup(); // unmount prior renders incl. portal'd modals, so screen queries don't leak across tests
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/'); // reset deep-link param between tests
});

/** The vehicle window (the catalog card has its own «Забронировать» too). */
const dialog = () => within(screen.getByRole('dialog'));

function stubFetch(categories: unknown, vehicles: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (!ok) return Promise.resolve(new Response('', { status: 500 }));
      const body = String(url).includes('/categories/') ? categories : vehicles;
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }),
  );
}

const cat = { id: 'c1', name: 'Премиум', color: '#ff0000', vehicle_count: 1 };
const vehicle = {
  id: 'v1',
  display_name: 'BMW Z4',
  brand: 'BMW',
  model: 'Z4',
  color: 'black',
  photo_url: 'https://cdn.example/z4.jpg',
  vehicle_type: 'car' as const,
  year: 2023,
  category: cat,
  min_price_per_day: 5000,
  is_available: true,
  free_from: null,
  free_from_time: null,
};

describe('VehicleCatalog', () => {
  it('renders vehicle cards and category tabs from the API', async () => {
    stubFetch([cat], [vehicle]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('BMW Z4');
    expect(container.querySelectorAll('.sb-vcard').length).toBe(1);
    // category tab (+ "Все")
    expect(container.querySelectorAll('.sb-vcatalog__tab').length).toBe(2);
    // card is an <article> with its own buttons (opens the booking modal), not an external link
    expect(container.querySelector('article.sb-vcard')).not.toBeNull();
    expect(container.querySelector('.sb-vcard__open')?.tagName).toBe('BUTTON');
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('5\u00a0000');
    expect(container.querySelector('.sb-vcard__status--available')?.textContent).toContain('Свободно сегодня');
  });

  it('deep link ?vehicle=<id> opens that card on load', async () => {
    window.history.replaceState(null, '', '/?vehicle=v1');
    const detail = { ...vehicle, gallery_images: [], advantages: [], pricing_table: [], deposits: [], options: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        const body = u.includes('/categories/')
          ? [cat]
          : /\/vehicles\/[^/]+\/$/.test(u) // detail endpoint /vehicles/{id}/
            ? detail
            : [vehicle];
        return Promise.resolve(
          new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    // The booking modal opens for v1 → its «Поделиться» button is rendered.
    render(<VehicleCatalog vehicleType="car" />);
    await within(await screen.findByRole('dialog')).findByRole('button', { name: 'Поделиться' });
  });

  it('gives the "free from <date>" chip the amber highlight treatment (owner feedback 2026-07-15: the plain dark chip looked worse than the old catalog\'s)', async () => {
    const freesUp = { ...vehicle, is_available: false, free_from: '2026-08-01' };
    stubFetch([cat], [freesUp]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('BMW Z4');
    const status = container.querySelector('.sb-vcard__status');
    expect(status?.classList.contains('sb-vcard__status--free')).toBe(true);
    expect(status?.querySelector('.sb-vcard__status-dot')).not.toBeNull();
    // Deterministic date rendering (timeZone: 'UTC'): the grid is now
    // server-rendered, so server and client MUST produce the same string
    // regardless of the runtime's timezone (hydration-mismatch guard).
    expect(status?.textContent).toContain('01 авг.');
  });

  it('leaves a plain "busy" chip (no known return date) without the amber modifier', async () => {
    const busy = { ...vehicle, is_available: false, free_from: null };
    stubFetch([cat], [busy]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('BMW Z4');
    const status = container.querySelector('.sb-vcard__status');
    expect(status?.classList.contains('sb-vcard__status--free')).toBe(false);
  });

  it('shows an error state when the API fails', async () => {
    stubFetch([], [], false);
    const { findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('Не удалось загрузить каталог');
  });

  it('groups identical units into one card with an availability count', async () => {
    const busyUnit = { ...vehicle, id: 'v2', is_available: false, free_from: null };
    stubFetch([cat], [vehicle, busyUnit]); // same brand/model/year/color → one group
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('BMW Z4');
    expect(container.querySelectorAll('.sb-vcard').length).toBe(1); // grouped, not 2 cards
    expect(container.querySelector('.sb-vcard__count')?.textContent).toContain('1'); // 1 available of 2
  });

  it('booking modal flows in three steps: detail → choice → manual form', async () => {
    const detail = {
      ...vehicle,
      gallery_images: [],
      advantages: [],
      options: [],
      deposits: [],
      pricing_table: [
        { period_label: '1', min_days: 1, max_days: 1, price_per_day: 5000 },
        { period_label: '1-29', min_days: 1, max_days: 29, price_per_day: 1500 },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        const body = u.includes('/categories/')
          ? [cat]
          : /\/vehicles\/[^/]+\/$/.test(u) // detail endpoint /vehicles/{id}/
            ? detail
            : [vehicle];
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }),
    );
    const { container } = render(<VehicleCatalog vehicleType="car" />);
    await screen.findByText('BMW Z4');

    // step 1 (detail): «Все цены» tab (columns «1 день» / «1–29») + «Забронировать» CTA
    fireEvent.click(container.querySelector('.sb-vcard__open')!);
    await screen.findByRole('dialog');
    await dialog().findByText('Забронировать');
    fireEvent.click(dialog().getByRole('tab', { name: 'Все цены' }));
    expect(dialog().getByRole('columnheader', { name: '1 день' })).toBeTruthy(); // min===max===1 → singular
    expect(dialog().getByRole('columnheader', { name: '1–29' })).toBeTruthy();
    expect(screen.queryByText('Бронь вручную')).toBeNull();
    expect(screen.queryByText('Отправить запрос')).toBeNull();

    // step 2 (choice): dates + Telegram + «Бронь вручную» — still no manual form
    fireEvent.click(dialog().getByText('Забронировать'));
    await screen.findByText('Бронь вручную');
    expect(screen.queryByText('Отправить запрос')).toBeNull();

    // No period picked yet → both booking buttons are inactive (no more
    // "today – tomorrow" default); the period is picked in the calendar.
    expect((screen.getByText('Бронь вручную').closest('button') as HTMLButtonElement).disabled).toBe(true);
    const days = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.sb-avcal__day:not(.is-outside) .sb-avcal__day-button'),
    ).filter((b) => !b.disabled);
    fireEvent.click(days[0]);
    fireEvent.click(document.querySelector('.sb-avcal__nav--next')!);
    fireEvent.click(document.querySelector<HTMLButtonElement>('.sb-avcal__day:not(.is-outside) .sb-avcal__day-button')!);
    expect((screen.getByText('Бронь вручную').closest('button') as HTMLButtonElement).disabled).toBe(false);

    // step 3 (form): the manual request form
    fireEvent.click(screen.getByText('Бронь вручную'));
    expect(await screen.findByText('Отправить запрос')).toBeTruthy();

    // ‹ Назад returns to the choice step
    fireEvent.click(screen.getByText(/Назад/));
    await screen.findByText('Бронь вручную');
    expect(screen.queryByText('Отправить запрос')).toBeNull();
  });

  it('the booking modal asks availability for EVERY unit of the opened model, and only when it opens', async () => {
    const secondUnit = { ...vehicle, id: 'v2' };
    const otherModel = { ...vehicle, id: 'v3', model: 'X5', display_name: 'BMW X5' };
    const fetchMock = vi.fn((url: string) => {
      const u = String(url);
      const body = u.includes('/categories/')
        ? [cat]
        : u.includes('/availability/')
          ? { today: '2026-10-09', units: [] }
          : /\/vehicles\/[^/]+\/$/.test(u)
            ? { ...vehicle, gallery_images: [], advantages: [], options: [], deposits: [], pricing_table: [] }
            : [vehicle, secondUnit, otherModel];
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const availabilityCalls = () => fetchMock.mock.calls.map(([u]) => String(u)).filter((u) => u.includes('/availability/'));

    const { container } = render(<VehicleCatalog vehicleType="car" apiBase="" />);
    await screen.findByText('BMW Z4');
    expect(availabilityCalls()).toHaveLength(0); // the list itself never asks

    const card = Array.from(container.querySelectorAll('.sb-vcard')).find((c) => c.textContent?.includes('BMW Z4'))!;
    fireEvent.click(card.querySelector('.sb-vcard__open')!);
    await screen.findByRole('dialog');
    await dialog().findByText('Забронировать');
    await waitFor(() => expect(availabilityCalls()).toHaveLength(1));
    expect(availabilityCalls()[0]).toBe('/api/v1/catalog/availability/?vehicle_ids=v1,v2');
  });

  it('unitIds: opened unit first, the rest cheapest first', async () => {
    // Группа из пяти экземпляров; карточка группы открывает самый дешёвый свободный (v3).
    const units = [
      { ...vehicle, id: 'v1', min_price_per_day: 5000 },
      { ...vehicle, id: 'v2', min_price_per_day: 9000 },
      { ...vehicle, id: 'v3', min_price_per_day: 3000 },
      { ...vehicle, id: 'v4', min_price_per_day: null },
      { ...vehicle, id: 'v5', min_price_per_day: 5000 },
    ];
    const fetchMock = vi.fn((url: string) => {
      const u = String(url);
      const body = u.includes('/categories/')
        ? [cat]
        : u.includes('/availability/')
          ? { today: '2026-10-09', units: [] }
          : /\/vehicles\/[^/]+\/$/.test(u)
            ? { ...vehicle, gallery_images: [], advantages: [], options: [], deposits: [], pricing_table: [] }
            : units;
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<VehicleCatalog vehicleType="car" apiBase="" />);
    await screen.findByText('BMW Z4');
    const card = Array.from(container.querySelectorAll('.sb-vcard')).find((c) => c.textContent?.includes('BMW Z4'))!;
    fireEvent.click(card.querySelector('.sb-vcard__open')!);
    await waitFor(() =>
      expect(fetchMock.mock.calls.map(([u]) => String(u)).some((u) => u.includes('/availability/'))).toBe(true),
    );
    const call = fetchMock.mock.calls.map(([u]) => String(u)).find((u) => u.includes('/availability/'))!;
    expect(call).toBe('/api/v1/catalog/availability/?vehicle_ids=v3,v1,v5,v2,v4');
  });

  it('uses English labels when puck metadata locale is en', async () => {
    stubFetch([cat], [{ ...vehicle, min_price_per_day: null, is_available: false, free_from: null }]);
    const { findByText } = render(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { locale: 'en' } }} />,
    );
    await findByText('on request');
  });

  it('an explicit locale prop overrides puck metadata locale (non-Puck hosts have no puck prop at all)', async () => {
    stubFetch([cat], [{ ...vehicle, min_price_per_day: null, is_available: false, free_from: null }]);
    const { findByText } = render(<VehicleCatalog vehicleType="car" locale="en" />);
    await findByText('on request');
  });

  it('category tab shows the translated name (locale=en) when set, else falls back to the Russian name', async () => {
    const translatedCat = { id: 'c2', name: 'Премиум', name_en: 'Premium', color: '#ff0000', vehicle_count: 1 };
    stubFetch([translatedCat], [{ ...vehicle, category: translatedCat }]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" locale="en" />);
    await findByText('BMW Z4');
    // Translated name appears both as the tab label and the (locale=en → activeCat===null) card badge.
    const tab = container.querySelector('.sb-vcatalog__tab');
    expect(tab?.textContent).toBe('Premium');
  });
});

describe('VehicleCatalog — SSR preload via puck metadata (catalogPreload)', () => {
  const preload = {
    categories: [cat],
    vehicles: { car: [vehicle] },
  };

  it('server render (renderToString) emits the vehicle cards, not the loading state — the SEO contract', async () => {
    const { renderToString } = await import('react-dom/server');
    const html = renderToString(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { catalogPreload: preload } }} />,
    );
    expect(html).toContain('BMW Z4');
    expect(html).toContain('5\u00a0000');
    expect(html).not.toContain('Загрузка…');
  });

  it('seeds the grid synchronously and silently refreshes from the API in the background', async () => {
    const refreshed = { ...vehicle, display_name: 'BMW Z4 Fresh' };
    stubFetch([cat], [refreshed]);
    const { container, findByText } = render(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { catalogPreload: preload } }} />,
    );
    // Preloaded card is there on the very first render — no loading state.
    expect(container.textContent).toContain('BMW Z4');
    expect(container.textContent).not.toContain('Загрузка…');
    // The mount fetch still runs and swaps in fresh data.
    await findByText('BMW Z4 Fresh');
  });

  it('preselects the configured default category from the preload (same rule as the fetch path)', () => {
    stubFetch([cat], [vehicle]);
    const { container } = render(
      <VehicleCatalog
        vehicleType="car"
        defaultCategory="Премиум"
        puck={{ metadata: { catalogPreload: preload } }}
      />,
    );
    const active = container.querySelector('.sb-vcatalog__tab--active');
    expect(active?.textContent).toBe('Премиум');
  });

  it('keeps the preloaded grid when the background refresh fails (no error flash over good content)', async () => {
    stubFetch([], [], false);
    const { container } = render(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { catalogPreload: preload } }} />,
    );
    expect(container.textContent).toContain('BMW Z4');
    // Give the rejected fetch a tick to settle, then assert we did NOT flip to error.
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).not.toContain('Не удалось загрузить каталог');
    expect(container.textContent).toContain('BMW Z4');
  });

  it('deep link to a vehicle MISSING from the preload still opens once the background refresh brings it (code review 2026-08-06: the latch must not burn on a stale snapshot)', async () => {
    window.history.replaceState(null, '', '/?vehicle=v9');
    const fresh = { ...vehicle, id: 'v9', display_name: 'BMW Z9', model: 'Z9' };
    const detail = { ...fresh, gallery_images: [], advantages: [], pricing_table: [], deposits: [], options: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        const body = u.includes('/categories/')
          ? [cat]
          : /\/vehicles\/[^/]+\/$/.test(u)
            ? detail
            : [vehicle, fresh]; // refresh DOES contain v9; the preload does not
        return Promise.resolve(
          new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleCatalog vehicleType="car" puck={{ metadata: { catalogPreload: preload } }} />);
    // The booking modal opens for v9 → its «Поделиться» button appears.
    await within(await screen.findByRole('dialog', {}, { timeout: 3000 })).findByRole('button', { name: 'Поделиться' });
  });

  it('StrictMode double-invoked effects do not burn the preload into a loading flash (dev parity with prod)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<never>(() => {}))); // fetch never settles
    const { container } = render(
      <StrictMode>
        <VehicleCatalog vehicleType="car" puck={{ metadata: { catalogPreload: preload } }} />
      </StrictMode>,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).toContain('BMW Z4');
    expect(container.textContent).not.toContain('Загрузка…');
  });

  it('a block of another vehicle type does not seed from a preload that lacks its type', async () => {
    stubFetch([cat], []);
    const { container, findByText } = render(
      <VehicleCatalog vehicleType="motorcycle" puck={{ metadata: { catalogPreload: preload } }} />,
    );
    // No motorcycle preload → normal loading → empty state from the API.
    expect(container.textContent).toContain('Загрузка…');
    await findByText('Нет доступных вариантов');
  });

  it('filter mode (standalone catalog) ignores the preload entirely', async () => {
    stubFetch([cat], [vehicle]);
    const { container, findByText } = render(
      <VehicleCatalog showFilters locale="en" puck={{ metadata: { catalogPreload: preload } }} />,
    );
    expect(container.textContent).toContain('Loading…');
    await findByText('BMW Z4');
  });
});

describe('VehicleCatalog — showFilters=false (site) backward-compat guard', () => {
  it('renders no filter bar and fetches the exact same URL as before showFilters existed', async () => {
    const fetchMock = vi.fn((url: string) => {
      const body = String(url).includes('/categories/') ? [cat] : [vehicle];
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container, findByText } = render(<VehicleCatalog vehicleType="car" apiBase="" />);
    await findByText('BMW Z4');

    expect(container.querySelector('.sb-filterbar')).toBeNull();
    const vehiclesCall = fetchMock.mock.calls.find(([u]) => String(u).includes('/vehicles/'));
    expect(vehiclesCall?.[0]).toBe('/api/v1/catalog/vehicles/?vehicle_type=car');
  });
});

describe('groupVehicles / pickRepresentative (one rule for the home catalog and the site pages)', () => {
  const u = (id: string, over: Partial<CatalogVehicle> = {}): CatalogVehicle => ({
    ...vehicle,
    id,
    ...over,
  });

  it('representative: free today → cheapest free; none free → freed earliest, then cheaper', () => {
    expect(pickRepresentative([u('a', { min_price_per_day: 6000 }), u('b', { min_price_per_day: 4000 })]).id).toBe('b');
    expect(
      pickRepresentative([
        u('busy-cheap', { is_available: false, free_from: '2026-12-20', min_price_per_day: 1000 }),
        u('free-dear', { min_price_per_day: 9000 }),
      ]).id,
    ).toBe('free-dear');
    expect(
      pickRepresentative([
        u('late', { is_available: false, free_from: '2026-12-20', min_price_per_day: 1000 }),
        u('nodate', { is_available: false, free_from: null, min_price_per_day: 500 }),
        u('early-dear', { is_available: false, free_from: '2026-11-16', min_price_per_day: 9000 }),
        u('early-cheap', { is_available: false, free_from: '2026-11-16', min_price_per_day: 3000 }),
      ]).id,
    ).toBe('early-cheap');
  });

  it('a unit without a price never stands for a group that has priced units (prod 2026-11-11, Zeekr X)', () => {
    expect(
      pickRepresentative([
        u('free-unpriced', { min_price_per_day: null }),
        u('busy-priced', { is_available: false, free_from: '2026-11-20', min_price_per_day: 1334 }),
      ]).id,
    ).toBe('busy-priced');
    expect(
      pickRepresentative([u('free-unpriced', { min_price_per_day: null }), u('free-priced', { min_price_per_day: 1334 })]).id,
    ).toBe('free-priced');
    // Nobody priced («по запросу») — the plain rule: free first.
    expect(
      pickRepresentative([
        u('busy', { is_available: false, free_from: '2026-11-20', min_price_per_day: null }),
        u('free', { min_price_per_day: null }),
      ]).id,
    ).toBe('free');
  });

  it('home key — brand/model/year/colour; a custom key groups across colours; counts and group availability', () => {
    const list = [
      u('black-busy', { is_available: false, free_from: '2026-12-01' }),
      u('white-free', { color: 'white', min_price_per_day: 5500 }),
      u('black-free', { min_price_per_day: 5200 }),
    ];
    const home = groupVehicles(list);
    expect(home.map((g) => [g.vehicle.id, g.total, g.availableCount])).toEqual([
      ['black-free', 2, 1],
      ['white-free', 1, 1],
    ]);
    const byModel = groupVehicles(list, (v) => v.model);
    expect(byModel).toHaveLength(1);
    expect(byModel[0].vehicle.id).toBe('black-free');
    expect(byModel[0].units.map((v) => v.id)).toEqual(['black-busy', 'white-free', 'black-free']);

    const allBusy = groupVehicles([u('x', { is_available: false, free_from: '2026-12-01' })]);
    expect(allBusy[0].vehicle).toMatchObject({ is_available: false, free_from: '2026-12-01' });
  });
});

describe('orderCatalogCards', () => {
  const card = (id: string, price: number | null, availableCount: number) => ({
    id,
    vehicle: { min_price_per_day: price },
    availableCount,
  });
  it('free today first, then cheaper (no price last), then the incoming order', () => {
    const out = orderCatalogCards([
      card('busy-cheap', 1000, 0),
      card('free-dear', 9000, 1),
      card('free-noprice', null, 2),
      card('free-cheap-a', 3000, 1),
      card('free-cheap-b', 3000, 1),
      card('busy-dear', 8000, 0),
    ]);
    expect(out.map((c) => c.id)).toEqual([
      'free-cheap-a', 'free-cheap-b', 'free-dear', 'free-noprice', 'busy-cheap', 'busy-dear',
    ]);
  });
  it('does not mutate its input', () => {
    const input = [card('a', 2, 0), card('b', 1, 1)];
    orderCatalogCards(input);
    expect(input.map((c) => c.id)).toEqual(['a', 'b']);
  });
});

describe('VehicleCatalog — tab mode card order (free today → price)', () => {
  it('a model free today stands before a busy one even when the backend lists the busy one first (prod «Премиум» 2026-11-10)', async () => {
    const premium = { ...vehicle, id: 'p', display_name: 'Zeekr 009 Premium', brand: 'Zeekr', model: '009 Premium',
      min_price_per_day: 7000, is_available: false, free_from: '2026-12-15' };
    const base = { ...vehicle, id: 'b', display_name: 'Zeekr 009', brand: 'Zeekr', model: '009', min_price_per_day: 8000 };
    const cheapFree = { ...vehicle, id: 'c', display_name: 'BYD Seal', brand: 'BYD', model: 'Seal', min_price_per_day: 2000 };
    stubFetch([cat], [premium, base, cheapFree]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('Zeekr 009');
    const names = [...container.querySelectorAll('.sb-vcard__name')].map((n) => n.textContent);
    expect(names).toEqual(['BYD Seal', 'Zeekr 009', 'Zeekr 009 Premium']);
  });
});

describe('VehicleCatalog — model page links', () => {
  const zeekr = { ...vehicle, vehicle_model: { id: 7, slug: 'zeekr-009' }, trim: 'Premium' };

  it('vehicleModelHref: cars / bikes by vehicle type, locale prefix; no slug → undefined', () => {
    expect(vehicleModelHref(zeekr, 'ru')).toBe('/ru/cars/zeekr-009');
    expect(vehicleModelHref({ ...zeekr, vehicle_type: 'motorcycle', vehicle_model: { id: 1, slug: 'honda-adv-160' } }, 'en'))
      .toBe('/en/bikes/honda-adv-160');
    expect(vehicleModelHref(vehicle, 'ru')).toBeUndefined();
    expect(vehicleModelHref({ ...vehicle, vehicle_model: null }, 'ru')).toBeUndefined();
  });

  it('tab mode: a card with a model slug is a link to the model page; a click still opens the window in place', async () => {
    stubFetch([cat], [zeekr]);
    const { container, findByText } = render(<VehicleCatalog vehicleType="car" locale="en" />);
    await findByText('BMW Z4');
    expect(container.querySelector('article.sb-vcard')).not.toBeNull();
    const link = container.querySelector<HTMLAnchorElement>('a.sb-vcard__open');
    expect(link?.getAttribute('href')).toBe('/en/cars/zeekr-009');
    expect(link!.querySelector('button')).toBeNull();
    fireEvent.click(link!);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    expect(window.location.pathname).toBe('/');
    expect(new URLSearchParams(window.location.search).get('vehicle')).toBe('v1');
  });

  it('filter mode (standalone catalog, another domain) renders no model link', async () => {
    stubFetch([cat], [zeekr]);
    const { container, findByText } = render(<VehicleCatalog showFilters />);
    await findByText('BMW Z4');
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('article.sb-vcard')).not.toBeNull();
  });
});

describe('VehicleCatalog — showFilters=true (standalone catalog)', () => {
  function stubFilteredFetch() {
    const fetchMock = vi.fn((url: string) => {
      const u = String(url);
      const body = u.includes('/categories/') ? [cat] : [vehicle];
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('renders the filter bar instead of category tabs', async () => {
    const fetchMock = stubFilteredFetch();
    const { container, findByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');

    expect(container.querySelector('.sb-filterbar')).not.toBeNull();
    expect(container.querySelector('.sb-vcatalog__tabs')).toBeNull();
    // Starts unfiltered ("Все") — no vehicle_type in the initial request.
    const firstVehiclesCall = fetchMock.mock.calls.find(([u]) => String(u).includes('/vehicles/'));
    expect(firstVehiclesCall?.[0]).toBe('/api/v1/catalog/vehicles/');
  });

  it('gives the search input and the clear-filters button real accessible names, not a bare "×"', async () => {
    stubFilteredFetch();
    const { findByText, getByLabelText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');

    expect(getByLabelText('Search...')).toBeTruthy();
    fireEvent.change(getByLabelText('Search...'), { target: { value: 'BMW' } });
    expect(getByLabelText('Clear filters')).toBeTruthy();
  });

  it('date-range chips show a placeholder label (not a collapsed empty input) before a date is picked', async () => {
    stubFilteredFetch();
    const { findByText, getByText, getByLabelText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');

    // Custom chip label renders the placeholder; the native picker input is
    // still reachable by its accessible name for a11y / date entry.
    expect(getByText('Start date')).toBeTruthy();
    expect(getByText('End date')).toBeTruthy();
    expect(getByLabelText('Start date')).toBeTruthy();
    expect(getByLabelText('End date')).toBeTruthy();
  });

  it('makes dates the availability step and combines available-only with price sorting', async () => {
    const cheapAvailable = {
      ...vehicle,
      id: 'v2',
      display_name: 'Honda PCX',
      brand: 'Honda',
      model: 'PCX',
      min_price_per_day: 3000,
    };
    const busyCheapest = {
      ...vehicle,
      id: 'v3',
      display_name: 'Audi A6',
      brand: 'Audi',
      model: 'A6',
      min_price_per_day: 1000,
      is_available: false,
      free_from: '2026-09-01',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(
        new Response(JSON.stringify(String(url).includes('/categories/') ? [cat] : [vehicle, cheapAvailable, busyCheapest]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )),
    );

    const { container, findByText, getByLabelText, getByText } = render(
      <VehicleCatalog showFilters apiBase="" locale="en" />,
    );
    await findByText('BMW Z4');

    const availabilityPanel = container.querySelector('.sb-filterbar__availability');
    expect(availabilityPanel?.classList.contains('is-pending')).toBe(true);
    expect(getByText('Without dates, availability is shown for today')).toBeTruthy();
    fireEvent.click(getByText('Choose dates'));
    expect(document.activeElement).toBe(getByLabelText('Start date'));

    fireEvent.change(getByLabelText('Start date'), { target: { value: '2026-08-20' } });
    const endDate = getByLabelText('End date') as HTMLInputElement;
    expect(endDate.min).toBe('2026-08-21');
    fireEvent.change(endDate, { target: { value: '2026-08-19' } });
    expect((getByLabelText('Start date') as HTMLInputElement).value).toBe('2026-08-20');
    expect((getByLabelText('End date') as HTMLInputElement).value).toBe('');
    fireEvent.change(endDate, { target: { value: '2026-08-25' } });
    const availableOnly = await waitFor(() => getByLabelText('Available only')) as HTMLInputElement;
    await waitFor(() => expect(availableOnly.checked).toBe(true));
    expect(availabilityPanel?.classList.contains('is-ready')).toBe(true);
    expect(availabilityPanel?.classList.contains('is-compact')).toBe(true);
    expect(availabilityPanel?.querySelector('.sb-filterbar__availability-range')?.textContent).toContain('20.08.2026');
    fireEvent.click(getByText('Change'));
    expect(availabilityPanel?.classList.contains('is-compact')).toBe(false);
    expect(getByText('Availability is calculated for your dates')).toBeTruthy();
    expect(getByLabelText('Start date')).toBeTruthy();
    fireEvent.change(getByLabelText('End date'), { target: { value: '2026-08-27' } });
    fireEvent.click(getByText('Done'));
    expect(availabilityPanel?.classList.contains('is-compact')).toBe(true);
    expect(availabilityPanel?.querySelector('.sb-filterbar__availability-range')?.textContent).toContain('27.08.2026');
    await waitFor(() => {
      expect(container.querySelectorAll('.sb-vcard')).toHaveLength(2);
      expect(container.textContent).not.toContain('Audi A6');
    });

    fireEvent.click(getByText('Sort'));
    await waitFor(() => {
      const cards = Array.from(container.querySelectorAll('.sb-vcard'));
      expect(cards[0]?.textContent).toContain('Honda PCX');
      expect(cards[1]?.textContent).toContain('BMW Z4');
    });

    // Busy transport returns when the filter is disabled, but never jumps ahead
    // of free models even when its price would normally sort first.
    fireEvent.click(getByLabelText('Available only'));
    await waitFor(() => {
      const cards = Array.from(container.querySelectorAll('.sb-vcard'));
      expect(cards).toHaveLength(3);
      expect(cards[0]?.textContent).toContain('Honda PCX');
      expect(cards[1]?.textContent).toContain('BMW Z4');
      expect(cards[2]?.textContent).toContain('Audi A6');
    });
  });

  it('does not reload for a half-range and sends dates only as a complete pair', async () => {
    const fetchMock = stubFilteredFetch();
    const { findByText, getByLabelText, queryByText } = render(
      <VehicleCatalog showFilters apiBase="" locale="en" />,
    );
    await findByText('BMW Z4');

    const lastVehiclesUrl = () => {
      const urls = fetchMock.mock.calls.map(([u]) => String(u)).filter((u) => u.includes('/vehicles/'));
      return urls[urls.length - 1];
    };

    const vehicleCallCount = () => fetchMock.mock.calls
      .filter(([u]) => String(u).includes('/vehicles/')).length;

    const callsBeforeStart = vehicleCallCount();
    const allCallsBeforeStart = fetchMock.mock.calls.length;
    fireEvent.change(getByLabelText('Start date'), { target: { value: '2026-08-01' } });
    expect(vehicleCallCount()).toBe(callsBeforeStart);
    expect(fetchMock.mock.calls).toHaveLength(allCallsBeforeStart);
    expect(queryByText('Loading…')).toBeNull();
    expect(lastVehiclesUrl()).not.toContain('available_from');
    expect(lastVehiclesUrl()).not.toContain('available_to');

    fireEvent.change(getByLabelText('End date'), { target: { value: '2026-08-10' } });
    await waitFor(() => expect(vehicleCallCount()).toBeGreaterThan(callsBeforeStart));
    await waitFor(() => expect(lastVehiclesUrl()).toContain('available_from=2026-08-01'));
    expect(lastVehiclesUrl()).toContain('available_to=2026-08-10');

    fireEvent.click(getByLabelText('Clear filters'));
    await waitFor(() => expect(lastVehiclesUrl()).not.toContain('available_from'));
    expect(lastVehiclesUrl()).not.toContain('available_to');
  });

  it('clicking the Cars pill re-fetches with vehicle_type=car', async () => {
    const fetchMock = stubFilteredFetch();
    const { findByText, getByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');

    fireEvent.click(getByText('Cars'));
    await waitFor(() => {
      const last = fetchMock.mock.calls.filter(([u]) => String(u).includes('/vehicles/')).pop();
      expect(last?.[0]).toBe('/api/v1/catalog/vehicles/?vehicle_type=car');
    });
  });

  it('debounces the search field (300ms) but applies other filters immediately', async () => {
    const fetchMock = stubFilteredFetch();
    const { getByPlaceholderText, getByText, findByText } = render(
      <VehicleCatalog showFilters apiBase="" locale="en" />,
    );
    await findByText('BMW Z4');

    const callsBefore = fetchMock.mock.calls.length;
    fireEvent.change(getByPlaceholderText('Search...'), { target: { value: 'BMW' } });
    // Not yet — well under the 300ms debounce.
    expect(fetchMock.mock.calls.length).toBe(callsBefore);

    await waitFor(() => {
      const searchCall = fetchMock.mock.calls.filter(([u]) => String(u).includes('/vehicles/')).pop();
      expect(searchCall?.[0]).toContain('search=BMW');
    });

    // A non-search filter (type pill) applies immediately, no debounce wait.
    const callsAfterSearch = fetchMock.mock.calls.length;
    fireEvent.click(getByText('Cars'));
    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callsAfterSearch);
    });
  });

  it('category is shown on cards (parity with the standalone catalog, which has no "all" tab gate)', async () => {
    stubFilteredFetch();
    const { container, findByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');
    expect(container.querySelector('.sb-vcard__cat')).not.toBeNull();
  });

  it('shows the translated category name on the card when locale=en and name_en is set', async () => {
    const translatedCat = { id: 'c2', name: 'Премиум', name_en: 'Premium', color: '#ff0000', vehicle_count: 1 };
    stubFetch([translatedCat], [{ ...vehicle, category: translatedCat }]);
    const { container, findByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');
    expect(container.querySelector('.sb-vcard__cat')?.textContent).toBe('Premium');
  });

  it('falls back to the Russian category name on the card when locale=en but name_en is unset', async () => {
    stubFetch([cat], [vehicle]); // `cat` has no name_en
    const { container, findByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');
    expect(container.querySelector('.sb-vcard__cat')?.textContent).toBe('Премиум');
  });

  it('under React.StrictMode, a single non-search filter click still issues exactly one extra fetch (code review 2026-07-15: the filter-state updater must stay pure — StrictMode double-invokes it in dev — so the debounce/refetch trigger was moved to a useEffect keyed on `filters` instead of living inside the setFilters callback)', async () => {
    const fetchMock = stubFilteredFetch();
    const { findByText, getByText } = render(
      <StrictMode>
        <VehicleCatalog showFilters apiBase="" locale="en" />
      </StrictMode>,
    );
    await findByText('BMW Z4');

    const vehiclesCallsBefore = fetchMock.mock.calls.filter(([u]) => String(u).includes('/vehicles/')).length;
    fireEvent.click(getByText('Cars'));
    await waitFor(() => {
      const last = fetchMock.mock.calls.filter(([u]) => String(u).includes('/vehicles/')).pop();
      expect(last?.[0]).toBe('/api/v1/catalog/vehicles/?vehicle_type=car');
    });
    const vehiclesCallsAfter = fetchMock.mock.calls.filter(([u]) => String(u).includes('/vehicles/')).length;
    expect(vehiclesCallsAfter - vehiclesCallsBefore).toBe(1);
  });
});
