import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { VehicleBookingModal } from './VehicleBookingModal';
import type { CatalogVehicle } from '../VehicleCatalog';

afterEach(() => {
  cleanup(); // unmount portal'd modal so screen queries don't leak across tests
  vi.unstubAllGlobals();
});

const vehicle: CatalogVehicle = {
  id: 'v1',
  display_name: 'BMW Z4',
  brand: 'BMW',
  model: 'Z4',
  color: 'black',
  photo_url: null,
  vehicle_type: 'car',
  year: 2023,
  category: null,
  min_price_per_day: 5000,
  is_available: true,
  free_from: null,
  free_from_time: null,
};

const baseDetail = {
  ...vehicle,
  gallery_images: [],
  advantages: [],
  pricing_table: [],
  deposits: [],
  options: [],
};

function stubDetailFetch(detail: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(detail), { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    ),
  );
}

function renderModal(detail: unknown, locale: 'ru' | 'en' = 'en') {
  stubDetailFetch(detail);
  return render(
    <VehicleBookingModal
      vehicle={vehicle}
      apiBase=""
      locale={locale}
      botUsername="test_bot"
      onClose={vi.fn()}
    />,
  );
}

describe('VehicleBookingModal — accessories (Stage 5)', () => {
  it('renders nothing extra when accessories is empty/absent', async () => {
    renderModal(baseDetail);
    await screen.findByText('BMW Z4');
    expect(screen.queryByText('Additional Options')).toBeNull();
  });

  it('groups items by category and shows name/price', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Детское кресло', name_en: 'Child seat', photo_url: null,
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await screen.findByText('Additional Options');
    expect(screen.getByText('Seats')).toBeTruthy();
    expect(screen.getByText('Child seat')).toBeTruthy();
    expect(screen.getByText(/500.*per booking/)).toBeTruthy();
  });

  it('shows the Russian localized names when locale=ru', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: null, name_ru: 'Без категории', name_en: 'Other', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: null,
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail, 'ru');
    await screen.findByText('Дополнительные опции');
    expect(screen.getByText('Без категории')).toBeTruthy();
    expect(screen.getByText('Кресло')).toBeTruthy();
  });

  it('+ increases the quantity, sold-out items are marked and cannot be incremented', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-free', name_ru: 'Свободно', name_en: 'Free item', photo_url: null,
              price: 100, price_unit: 'per_day', stock: null, available_stock: null,
            },
            {
              id: 'acc-out', name_ru: 'Занято', name_en: 'Sold out', photo_url: null,
              price: 100, price_unit: 'per_booking', stock: 1, available_stock: 0,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await screen.findByText('Additional Options');

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    // First item (free) — clicking + increments its own counter to 1.
    fireEvent.click(plusButtons[0]);
    await waitFor(() => {
      const values = screen.getAllByText('1');
      expect(values.length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Not available for these dates')).toBeTruthy();
    expect((plusButtons[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it('includes selected accessories in the booking-request payload', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: null,
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };

    let capturedBody: string | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-requests/')) {
          capturedBody = init?.body as string;
          return Promise.resolve(new Response(JSON.stringify({ success: true, booking_id: 'b1' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(detail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );

    render(
      <VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />,
    );
    await screen.findByText('Additional Options');

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Fill in manually'));

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.accessories).toEqual([{ accessory_id: 'acc-1', quantity: 1 }]);
  });
});
