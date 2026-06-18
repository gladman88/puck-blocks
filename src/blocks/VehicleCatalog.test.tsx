import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { VehicleCatalog } from './VehicleCatalog';

afterEach(() => vi.unstubAllGlobals());

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
    const { container, findByText } = render(
      <VehicleCatalog vehicleType="car" catalogUrl="https://catalog.example" />,
    );
    await findByText('BMW Z4');
    expect(container.querySelectorAll('.sb-vcard').length).toBe(1);
    // category tab (+ "Все")
    expect(container.querySelectorAll('.sb-vcatalog__tab').length).toBe(2);
    // card links into the full catalog with the vehicle id
    expect(container.querySelector('a.sb-vcard')?.getAttribute('href')).toContain('vehicle=v1');
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

  it('uses English labels when puck metadata locale is en', async () => {
    stubFetch([cat], [{ ...vehicle, min_price_per_day: null, is_available: false, free_from: null }]);
    const { findByText } = render(
      <VehicleCatalog vehicleType="car" puck={{ metadata: { locale: 'en' } }} />,
    );
    await findByText('on request');
  });
});
