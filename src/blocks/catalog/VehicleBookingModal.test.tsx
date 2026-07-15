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

  it('an item with no photo renders no expand button, just the placeholder tile', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: null, description: '',
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await screen.findByText('Additional Options');
    expect(screen.queryByRole('button', { name: 'Seat' })).toBeNull();
  });

  it('tapping an item photo opens the fullscreen preview with the description caption; closing removes it', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: 'https://example.com/seat.jpg',
              description: 'Компактное кресло для детей 9-18 кг.',
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await screen.findByText('Additional Options');

    fireEvent.click(screen.getByRole('button', { name: 'Seat' }));
    expect(await screen.findByText('Компактное кресло для детей 9-18 кг.')).toBeTruthy();
    expect(screen.getAllByAltText('Seat').length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close photo' }));
    await waitFor(() => {
      expect(screen.queryByText('Компактное кресло для детей 9-18 кг.')).toBeNull();
    });
  });

  it('an item with a photo but no description opens the preview without a caption', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: 'https://example.com/seat.jpg',
              description: '',
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await screen.findByText('Additional Options');

    fireEvent.click(screen.getByRole('button', { name: 'Seat' }));
    await screen.findAllByAltText('Seat');
    expect(document.querySelector('.sb-acc-lightbox__caption')).toBeNull();
  });

  it('switching to a different vehicle (no guaranteed remount) closes an open lightbox (code review 2026-07-16)', async () => {
    const detail = {
      ...baseDetail,
      accessories: [
        {
          id: 'cat-1', name_ru: 'Кресла', name_en: 'Seats', photo_url: null,
          items: [
            {
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat', photo_url: 'https://example.com/seat.jpg',
              description: 'Компактное кресло для детей 9-18 кг.',
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    stubDetailFetch(detail);
    const { rerender } = render(
      <VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />,
    );
    await screen.findByText('Additional Options');
    fireEvent.click(screen.getByRole('button', { name: 'Seat' }));
    expect(await screen.findByText('Компактное кресло для детей 9-18 кг.')).toBeTruthy();

    const otherVehicle: CatalogVehicle = { ...vehicle, id: 'v2', display_name: 'Toyota Yaris' };
    rerender(
      <VehicleBookingModal vehicle={otherVehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.queryByText('Компактное кресло для детей 9-18 кг.')).toBeNull();
    });
  });
});

describe('VehicleBookingModal — delivery by address (Stage 6)', () => {
  function stubBookingFetch(detail: unknown, onBookingRequest: (body: string) => void) {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-requests/')) {
          onBookingRequest(init?.body as string);
          return Promise.resolve(new Response(JSON.stringify({ success: true, booking_id: 'b1' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(detail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
  }

  async function goToForm() {
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Fill in manually'));
  }

  it('renders the toggles on the form step and omits location fields when nothing is toggled on', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));

    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    await goToForm();

    expect(screen.getByText('Deliver the vehicle to my address')).toBeTruthy();
    expect(screen.getByText("We'll pick it up from my address")).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location).toBeUndefined();
    expect(payload.dropoff_location).toBeUndefined();
  });

  it('toggling pickup on with no API key configured shows the unavailable message and still omits the field', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));

    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    await goToForm();

    fireEvent.click(screen.getAllByRole('switch')[0]);
    expect(screen.getByText('Address search is temporarily unavailable')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location).toBeUndefined();
  });

  it('includes pickup_location in the payload once a location is actually picked', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));

    class FakeAutocompleteElement {
      constructor() {
        return document.createElement('div');
      }
    }
    window.google = {
      maps: {
        importLibrary: vi.fn().mockResolvedValue({ PlaceAutocompleteElement: FakeAutocompleteElement }),
      },
    };

    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        googleMapsApiKey="test-key"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    await goToForm();

    fireEvent.click(screen.getAllByRole('switch')[0]);
    const fakeElement = await waitFor(() => {
      const container = screen.getByTestId('delivery-address-picker-container');
      const el = container.firstElementChild;
      expect(el).not.toBeNull();
      return el as HTMLDivElement;
    });
    const event = new Event('gmp-select') as Event & { placePrediction: unknown };
    event.placePrediction = {
      toPlace: () => ({
        formattedAddress: 'Patong Beach Road',
        id: 'place-1',
        location: { lat: () => 7.9, lng: () => 98.29 },
        fetchFields: vi.fn().mockResolvedValue(undefined),
      }),
    };
    fakeElement.dispatchEvent(event);
    await screen.findByText('Patong Beach Road');

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location).toEqual({
      address: 'Patong Beach Road',
      lat: 7.9,
      lng: 98.29,
      place_id: 'place-1',
    });
    expect(payload.dropoff_location).toBeUndefined();

    delete window.google;
  });
});
