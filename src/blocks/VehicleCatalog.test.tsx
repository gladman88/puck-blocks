import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { VehicleCatalog } from './VehicleCatalog';

afterEach(() => {
  cleanup(); // unmount prior renders incl. portal'd modals, so screen queries don't leak across tests
  vi.unstubAllGlobals();
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

  it('opens the booking modal as two windows: detail → «Как забронировать?» → form', async () => {
    const detail = {
      ...vehicle,
      gallery_images: [],
      advantages: [],
      options: [],
      deposits: [],
      pricing_table: [
        { period_label: '1 день', min_days: 1, max_days: 1, price_per_day: 5000, is_monthly: false },
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

    // open → window 1 (detail): price table + CTA, NO booking form yet
    fireEvent.click(container.querySelector('button.sb-vcard')!);
    await screen.findByText('Как забронировать?');
    expect(screen.getByText('1 день')).toBeTruthy();
    expect(screen.queryByText('Отправить заявку')).toBeNull();

    // → window 2 (booking): the manual form appears
    fireEvent.click(screen.getByText('Как забронировать?'));
    expect(await screen.findByText('Отправить заявку')).toBeTruthy();

    // ‹ Назад returns to window 1 (form gone again)
    fireEvent.click(screen.getByText(/Назад/));
    await screen.findByText('Как забронировать?');
    expect(screen.queryByText('Отправить заявку')).toBeNull();
  });

  it('uses English labels when puck metadata locale is en', async () => {
    stubFetch([cat], [{ ...vehicle, min_price_per_day: null, is_available: false, free_from: null }]);
    const { findByText } = render(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { locale: 'en' } }} />,
    );
    await findByText('on request');
  });
});
