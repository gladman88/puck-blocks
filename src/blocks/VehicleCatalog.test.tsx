import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { VehicleCatalog } from './VehicleCatalog';

afterEach(() => {
  cleanup(); // unmount prior renders incl. portal'd modals, so screen queries don't leak across tests
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/'); // reset deep-link param between tests
});

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
  vehicle_type: 'car',
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
    // card is a clickable button (opens the booking modal), not an external link
    expect(container.querySelector('button.sb-vcard')).not.toBeNull();
    expect(container.querySelector('a.sb-vcard')).toBeNull();
    expect(container.textContent).toContain('5,000');
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
    const { findByText } = render(<VehicleCatalog vehicleType="car" />);
    await findByText('Поделиться');
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
        { period_label: '1', min_days: 1, max_days: 1, price_per_day: 5000, is_monthly: false },
        { period_label: '1-29', min_days: 1, max_days: 29, price_per_day: 1500, is_monthly: false },
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

    // step 1 (detail): price table («1 день» = period_label + day word) + «Забронировать» CTA
    fireEvent.click(container.querySelector('button.sb-vcard')!);
    await screen.findByText('Забронировать');
    expect(screen.getByText('1 день')).toBeTruthy(); // min===max===1 → singular
    expect(screen.getByText('1-29 дней')).toBeTruthy(); // range with min 1 → plural (HIGH fix)
    expect(screen.queryByText('Заполнить вручную')).toBeNull();
    expect(screen.queryByText('Отправить запрос')).toBeNull();

    // step 2 (choice): dates + Telegram + «Заполнить вручную» — still no manual form
    fireEvent.click(screen.getByText('Забронировать'));
    await screen.findByText('Заполнить вручную');
    expect(screen.queryByText('Отправить запрос')).toBeNull();

    // step 3 (form): the manual request form
    fireEvent.click(screen.getByText('Заполнить вручную'));
    expect(await screen.findByText('Отправить запрос')).toBeTruthy();

    // ‹ Назад returns to the choice step
    fireEvent.click(screen.getByText(/Назад/));
    await screen.findByText('Заполнить вручную');
    expect(screen.queryByText('Отправить запрос')).toBeNull();
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

  it('category badge is shown on cards (parity with the standalone catalog, which has no "all" tab gate)', async () => {
    stubFilteredFetch();
    const { container, findByText } = render(<VehicleCatalog showFilters apiBase="" locale="en" />);
    await findByText('BMW Z4');
    expect(container.querySelector('.sb-vcard__badge')).not.toBeNull();
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
