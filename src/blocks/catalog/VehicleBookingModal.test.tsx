import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { VehicleBookingModal, classifyIntentPollResponse } from './VehicleBookingModal';
import type { CatalogVehicle } from '../VehicleCatalog';

beforeEach(() => {
  // jsdom has no window.open; default it to a harmless stub so the 1-click
  // browser handoff doesn't emit "Not implemented" noise. Tests that need to
  // observe the opened tab override this with their own stub.
  vi.stubGlobal('open', vi.fn(() => null));
});

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
  // The accessory picker carousel lives on the "how to book?" choice screen now
  // (owner feedback 2026-07-16), reached by clicking the detail-screen CTA.
  async function goToAccessories(cta = 'Book') {
    fireEvent.click(await screen.findByText(cta));
    await screen.findByText('How to book?');
  }

  it('renders nothing extra when accessories is empty/absent', async () => {
    renderModal(baseDetail);
    await goToAccessories();
    expect(screen.queryByText('Additional Options')).toBeNull();
  });

  it('groups items by category and shows name/price on the choice screen', async () => {
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
    await goToAccessories();
    expect(screen.getByText('Additional Options')).toBeTruthy();
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
    fireEvent.click(await screen.findByText('Забронировать'));
    await screen.findByText('Как забронировать?');
    expect(screen.getByText('Дополнительные опции')).toBeTruthy();
    expect(screen.getByText('Без категории')).toBeTruthy();
    expect(screen.getByText('Кресло')).toBeTruthy();
  });

  it('the carousel sits directly under the vehicle, before the dates', async () => {
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
    await goToAccessories();
    const body = document.querySelector('.sb-modal__body--book') as HTMLElement;
    const children = Array.from(body.children).map((el) => el.className);
    const vehicleIdx = children.indexOf('sb-bk__vehicle');
    const accessoriesIdx = children.indexOf('sb-vd__accessories');
    const datesIdx = children.indexOf('sb-vd__dates');
    expect(vehicleIdx).toBeGreaterThanOrEqual(0);
    expect(accessoriesIdx).toBeGreaterThan(vehicleIdx);
    expect(datesIdx).toBeGreaterThan(accessoriesIdx);
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
    await goToAccessories();

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
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
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
    await goToAccessories();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.accessories).toEqual([{ accessory_id: 'acc-1', quantity: 1 }]);
  });

  it('a picked accessory carries into the Telegram 1-click intent payload', async () => {
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
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(detail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await goToAccessories();
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByText('1-click booking via Telegram'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(JSON.parse(capturedBody!).accessories).toEqual([{ accessory_id: 'acc-1', quantity: 1 }]);
    errSpy.mockRestore();
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
    await goToAccessories();
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
              id: 'acc-1', name_ru: 'Кресло', name_en: 'Seat',
              photo_url: 'https://example.com/seat-thumb.jpg',
              photo_full_url: 'https://example.com/seat-full.jpg',
              description: 'Компактное кресло для детей 9-18 кг.',
              price: 500, price_unit: 'per_booking', stock: null, available_stock: null,
            },
          ],
        },
      ],
    };
    renderModal(detail);
    await goToAccessories();

    fireEvent.click(screen.getByRole('button', { name: 'Seat' }));
    expect(await screen.findByText('Компактное кресло для детей 9-18 кг.')).toBeTruthy();
    // The tile uses the thumb; the fullscreen lightbox uses the display variant.
    const seatImgs = screen.getAllByAltText('Seat') as HTMLImageElement[];
    expect(seatImgs.some((img) => img.src === 'https://example.com/seat-full.jpg')).toBe(true);
    expect(seatImgs.some((img) => img.src === 'https://example.com/seat-thumb.jpg')).toBe(true);

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
    await goToAccessories();

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
    await goToAccessories();
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

  // Delivery toggles live on the "How to book?" choice screen now (owner
  // feedback 2026-07-16: they used to live only inside "Fill in manually",
  // so the 1-click Telegram path had no way to request delivery at all).
  // goToChoice() stops there so a test can interact with the toggles;
  // goToForm() continues into the manual path afterwards.
  async function goToChoice() {
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
  }
  async function goToForm() {
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));
  }

  // Mock the new Places AutocompleteSuggestion API: typing any text yields one
  // suggestion whose place address == the typed text (fixed coords), so a test
  // can pick distinct addresses by typing distinct strings.
  function stubGoogleSearch() {
    const makePrediction = (input: string) => ({
      text: { text: input, toString: () => input },
      mainText: { text: input },
      secondaryText: undefined,
      toPlace: () => ({
        formattedAddress: input,
        location: { lat: () => 7.9, lng: () => 98.29 },
        id: `p-${input}`,
        fetchFields: vi.fn().mockResolvedValue(undefined),
      }),
    });
    const AutocompleteSuggestion = {
      fetchAutocompleteSuggestions: vi.fn(({ input }: { input: string }) =>
        Promise.resolve({ suggestions: [{ placePrediction: makePrediction(input) }] }),
      ),
    };
    class FakeSessionToken {}
    window.google = {
      maps: {
        importLibrary: vi.fn((n: string) =>
          n === 'places'
            ? Promise.resolve({ AutocompleteSuggestion, AutocompleteSessionToken: FakeSessionToken })
            : Promise.resolve({}),
        ),
      },
    } as unknown as typeof window.google;
  }

  // Type into a delivery-address input and pick the resulting suggestion.
  async function pickAddress(inputEl: HTMLElement, text: string) {
    fireEvent.change(inputEl, { target: { value: text } });
    fireEvent.click(await screen.findByText(text, {}, { timeout: 2000 }));
    await waitFor(() => expect((inputEl as HTMLInputElement).value).toBe(text));
  }

  it('renders the toggles on the choice screen and omits location fields when nothing is toggled on', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));

    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    await goToChoice();

    expect(screen.getByText('Deliver the vehicle to my address')).toBeTruthy();
    expect(screen.getByText("We'll pick it up from my address")).toBeTruthy();

    await goToForm();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66123456' } });
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
    await goToChoice();

    fireEvent.click(screen.getAllByRole('switch')[0]);
    expect(screen.getByText('Address search is temporarily unavailable')).toBeTruthy();

    await goToForm();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location).toBeUndefined();
  });

  it('includes pickup_location in the payload once a location is actually picked (manual path)', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));
    stubGoogleSearch();

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
    await goToChoice();

    fireEvent.click(screen.getAllByRole('switch')[0]);
    const input = await screen.findByTestId('delivery-address-input');
    await waitFor(() => expect((input as HTMLInputElement).disabled).toBe(false));
    await pickAddress(input, 'Patong Beach Road');

    await goToForm();
    // Read-only echo of the choice made on the previous screen.
    expect(screen.getByText('Patong Beach Road')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location.address).toBe('Patong Beach Road');
    expect(payload.pickup_location.lat).toBe(7.9);
    expect(payload.dropoff_location).toBeUndefined();

    delete window.google;
  });

  it('a delivery address picked before the Telegram 1-click path is included in the intent payload', async () => {
    let capturedBody: string | undefined;
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    stubGoogleSearch();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );

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
    await goToChoice();

    fireEvent.click(screen.getAllByRole('switch')[0]);
    const input = await screen.findByTestId('delivery-address-input');
    await waitFor(() => expect((input as HTMLInputElement).disabled).toBe(false));
    await pickAddress(input, 'Patong Beach Road');

    fireEvent.click(screen.getByText('1-click booking via Telegram'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location.address).toBe('Patong Beach Road');
    expect(payload.pickup_location.lat).toBe(7.9);

    delete window.google;
    errSpy.mockRestore();
  });

  it('a distinct collection address picked first is NOT overwritten when delivery is enabled afterwards (code review 2026-07-16)', async () => {
    // Regression: dropoffSameAsPickup defaults true, so enabling delivery AFTER
    // picking a distinct collection address used to silently mirror the
    // delivery address over it. Picking a collection address must turn "same"
    // off so the two stay independent.
    let capturedBody: string | undefined;
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    stubGoogleSearch();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );

    render(
      <VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" googleMapsApiKey="test-key" onClose={vi.fn()} />,
    );
    await screen.findByText('BMW Z4');
    await goToChoice();

    // 1. Enable COLLECTION first (switch #1) and pick a distinct return address.
    fireEvent.click(screen.getAllByRole('switch')[1]);
    const dropoffInput = await screen.findByTestId('delivery-address-input');
    await waitFor(() => expect((dropoffInput as HTMLInputElement).disabled).toBe(false));
    await pickAddress(dropoffInput, 'Return Point Rd');

    // 2. Now enable DELIVERY (switch #0) and pick a different address (pickup
    //    row is first in the DOM → its input is index 0).
    fireEvent.click(screen.getAllByRole('switch')[0]);
    await waitFor(() => expect(screen.getAllByTestId('delivery-address-input')).toHaveLength(2));
    const pickupInput = screen.getAllByTestId('delivery-address-input')[0];
    await waitFor(() => expect((pickupInput as HTMLInputElement).disabled).toBe(false));
    await pickAddress(pickupInput, 'Patong Beach Road');

    // "Same address as delivery" is offered but must be UNCHECKED, and the
    // collection address must still be in its field (not mirrored away).
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    expect(screen.getByDisplayValue('Return Point Rd')).toBeTruthy();

    // 3. Submit — collection must remain the distinct return address.
    fireEvent.click(screen.getByText('1-click booking via Telegram'));
    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.pickup_location.address).toBe('Patong Beach Road');
    expect(payload.dropoff_location.address).toBe('Return Point Rd');

    delete window.google;
    errSpy.mockRestore();
  });

  it('shows the delivery price once an address is picked (quote endpoint)', async () => {
    stubGoogleSearch();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/delivery-quote/')) {
          return Promise.resolve(
            new Response(JSON.stringify({ price: '600.00', matched: true, zone_name: 'Patong' }), { status: 200 }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" googleMapsApiKey="test-key" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    await goToChoice();
    fireEvent.click(screen.getAllByRole('switch')[0]);
    const input = await screen.findByTestId('delivery-address-input');
    await waitFor(() => expect((input as HTMLInputElement).disabled).toBe(false));
    await pickAddress(input, 'Patong Beach Road');

    // The quote endpoint's price is surfaced under the address field.
    expect(await screen.findByText('600 THB')).toBeTruthy();
    delete window.google;
  });
});

describe('VehicleBookingModal — referral attribution (plans/catalog-on-puck-blocks §4.1b)', () => {
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

  async function submitManualForm() {
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66123456' } });
    fireEvent.click(screen.getByText('Send request'));
  }

  it('adds referral_code to the booking payload when set', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        referralCode="AG1234"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    await submitManualForm();

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(JSON.parse(capturedBody!).referral_code).toBe('AG1234');
  });

  it('omits referral_code entirely when absent (current site behavior)', async () => {
    let capturedBody: string | undefined;
    stubBookingFetch(baseDetail, (b) => (capturedBody = b));
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    await submitManualForm();

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect('referral_code' in JSON.parse(capturedBody!)).toBe(false);
  });

  it('1-click Telegram button POSTs the referral code to booking-intents and redirects with the token', async () => {
    let capturedBody: string | undefined;
    // jsdom cannot actually navigate — mute its "Not implemented: navigation" error.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        referralCode="AG1234"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(JSON.parse(capturedBody!).referral_code).toBe('AG1234');
    errSpy.mockRestore();
  });

  it('1-click Telegram button omits accessories/pickup/dropoff from the intent when none are set', async () => {
    let capturedBody: string | undefined;
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect('referral_code' in payload).toBe(false);
    expect('accessories' in payload).toBe(false);
    expect('pickup_location' in payload).toBe(false);
    errSpy.mockRestore();
  });

  it('1-click Telegram button shows an inline error and stays retryable when the intent POST fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          return Promise.resolve(new Response('', { status: 500 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await screen.findByText('Could not send. Please try again.');
    const tgButton = screen.getByText('1-click booking via Telegram').closest('button') as HTMLButtonElement;
    expect(tgButton.disabled).toBe(false);
  });

  it('1-click Telegram button shows a retryable error instead of navigating when the intent response has no token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) {
          // 2xx but malformed/partial body — no `token` key.
          return Promise.resolve(new Response(JSON.stringify({}), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await screen.findByText('Could not send. Please try again.');
    const tgButton = screen.getByText('1-click booking via Telegram').closest('button') as HTMLButtonElement;
    expect(tgButton.disabled).toBe(false);
    expect(window.location.href).not.toContain('bk_');
  });

  it('1-click uses the host openTelegramLink handoff (Mini App) and does not open a browser tab', async () => {
    const onTelegramLink = vi.fn();
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/status/')) {
          return Promise.resolve(new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        if (u.includes('/booking-intents/')) {
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
      }),
    );
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        onTelegramLink={onTelegramLink}
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await waitFor(() => expect(onTelegramLink).toHaveBeenCalledTimes(1));
    expect(onTelegramLink.mock.calls[0][0]).toContain('start=bk_tok123');
    expect(openMock).not.toHaveBeenCalled(); // Mini App path never opens a browser tab
  });

  it('shows the in-app confirmation once the intent is redeemed (browser: new tab + status poll → used)', async () => {
    const popup = { location: { href: '' }, close: vi.fn() };
    vi.stubGlobal('open', vi.fn(() => popup as unknown as Window));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/status/')) {
          return Promise.resolve(new Response(JSON.stringify({ status: 'used' }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        if (u.includes('/booking-intents/')) {
          return Promise.resolve(new Response(JSON.stringify({ token: 'tok123' }), { status: 201 }));
        }
        return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    // No host callback → the bot opens in the synchronously-created new tab...
    await waitFor(() => expect(popup.location.href).toContain('start=bk_tok123'));
    // ...and once the poll sees the redemption, the in-app confirmation appears.
    await screen.findByText('Request sent!');
  });

  it('closes the opened tab (and does not navigate it) when the intent POST fails', async () => {
    const popup = { location: { href: '' }, close: vi.fn() };
    vi.stubGlobal('open', vi.fn(() => popup as unknown as Window));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) return Promise.resolve(new Response('', { status: 500 }));
        return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await screen.findByText('Could not send. Please try again.');
    expect(popup.close).toHaveBeenCalledTimes(1);
    expect(popup.location.href).toBe(''); // never navigated the placeholder tab
    expect(screen.queryByText('Request sent!')).toBeNull();
  });

  it('closes the opened tab when the intent response carries no token', async () => {
    const popup = { location: { href: '' }, close: vi.fn() };
    vi.stubGlobal('open', vi.fn(() => popup as unknown as Window));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const u = String(url);
        if (u.includes('/booking-intents/')) return Promise.resolve(new Response(JSON.stringify({}), { status: 201 }));
        return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
      }),
    );
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('1-click booking via Telegram'));

    await screen.findByText('Could not send. Please try again.');
    expect(popup.close).toHaveBeenCalledTimes(1);
    expect(popup.location.href).toBe('');
  });

  it('appends &ref= to the share link when a referral code is set', async () => {
    stubDetailFetch(baseDetail);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        referralCode="AG1234"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByLabelText('Share'));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const sharedUrl = writeText.mock.calls[0][0] as string;
    expect(sharedUrl).toContain('ref=AG1234');
  });
});

describe('VehicleBookingModal — manual form is WhatsApp-only (owner decision 2026-09-14)', () => {
  // Removed 2026-09-14: a Telegram handle typed by hand here used to write the
  // literal text into `Contact.external_id` instead of a real chat_id, which
  // broke recognizing the same person on their next real message — the same
  // customer got a second card (and sometimes a second referral agent) every
  // time they booked again. Telegram now reaches the backend ONLY through the
  // "1-click" button (handleTelegramBooking), which always carries a real
  // chat_id from the bot. These tests pin that the option is gone for good.
  it('has no Telegram option — no toggle, no Telegram-labelled field', async () => {
    stubDetailFetch(baseDetail);
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));

    expect(screen.queryByRole('button', { name: /Telegram/ })).toBeNull();
    expect(screen.queryByLabelText('Telegram')).toBeNull();
    expect(screen.getByLabelText('WhatsApp number')).toBeTruthy();
  });

  it('prefills the name from telegramUser but leaves the WhatsApp field empty, and omits telegram_user_data from the payload', async () => {
    let capturedBody: string | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/booking-requests/')) {
          if (init?.body) capturedBody = init.body as string; // ignore the bodyless status poll
          return Promise.resolve(new Response(JSON.stringify({ success: true, booking_id: 'b1' }), { status: 201 }));
        }
        return Promise.resolve(
          new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }),
        );
      }),
    );

    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        telegramUser={{ user_id: 42, username: 'ivan_p', first_name: 'Ivan' }}
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));

    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('Ivan');
    expect((screen.getByLabelText('WhatsApp number') as HTMLInputElement).value).toBe('');

    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66912345678' } });
    fireEvent.click(screen.getByText('Send request'));
    await waitFor(() => expect(capturedBody).toBeDefined());
    const payload = JSON.parse(capturedBody!);
    expect(payload.contact_channel).toBe('whatsapp');
    expect(payload.telegram_user_data).toBeUndefined();
  });

  it('defaults to an empty name/contact when telegramUser is absent', async () => {
    stubDetailFetch(baseDetail);
    render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    fireEvent.click(await screen.findByText('Enter WhatsApp manually'));

    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('WhatsApp number') as HTMLInputElement).value).toBe('');
  });

  // WhatsApp format validation (owner decision 2026-09-14): a number typed
  // WITHOUT a country code (local format) strips to a DIFFERENT digit string
  // than the same number typed internationally, and the same customer booking
  // twice, once each way, got two Contact rows for one person. The `+` is now
  // mandatory so the field can't silently accept the ambiguous local form.
  describe('WhatsApp phone format validation', () => {
    async function openManualForm(fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) {
      vi.stubGlobal('fetch', fetchImpl);
      render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByText('Book'));
      fireEvent.click(await screen.findByText('Enter WhatsApp manually'));
      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    }

    it('rejects a value with no country code and does not submit', async () => {
      let called = false;
      await openManualForm(vi.fn((url: string) => {
        if (url.includes('/catalog/vehicles/')) {
          return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        called = true;
        return Promise.resolve(new Response('{}', { status: 200 }));
      }));

      // Local Thai mobile format, no leading '+' / country code.
      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '0812345678' } });
      fireEvent.click(screen.getByText('Send request'));

      expect(await screen.findByText(/country code/)).toBeTruthy();
      expect(called).toBe(false);
    });

    it('rejects a non-phone value and does not submit', async () => {
      let called = false;
      await openManualForm(vi.fn((url: string) => {
        if (url.includes('/catalog/vehicles/')) {
          return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        called = true;
        return Promise.resolve(new Response('{}', { status: 200 }));
      }));

      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: 'Evgenii_yar' } });
      fireEvent.click(screen.getByText('Send request'));

      expect(await screen.findByText(/country code/)).toBeTruthy();
      expect(called).toBe(false);
    });

    it('accepts a number with a country code (no error)', async () => {
      await openManualForm(vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }))
      ));

      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
      fireEvent.click(screen.getByText('Send request'));

      await waitFor(() => expect(screen.queryByText(/country code/)).toBeNull());
    });

    it('clears the error as soon as the customer edits the contact field', async () => {
      await openManualForm(vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }))
      ));

      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: 'not-a-phone' } });
      fireEvent.click(screen.getByText('Send request'));
      expect(await screen.findByText(/country code/)).toBeTruthy();

      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66912345678' } });
      expect(screen.queryByText(/country code/)).toBeNull();
    });
  });

  // Prod incident 2026-07-21: an impatient customer double/triple-tapped the
  // submit button on a slow connection (no spinner, disabled lagged) → 3
  // identical booking-request POSTs → 3 identical manager notifications for
  // ONE booking. The synchronous `submittingRef` guard must collapse rapid
  // taps to a single POST regardless of the state/`disabled` lag.
  describe('double-submit protection', () => {
    it('a rapid double-tap fires only ONE booking-request POST', async () => {
      let postCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string) => {
        if (url.includes('/catalog/vehicles/')) {
          return Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        // booking-request POST — resolve after a tick so the second tap races
        // the still-in-flight first one (the real double-tap scenario).
        postCount += 1;
        return new Promise<Response>((resolve) =>
          setTimeout(() => resolve(new Response(JSON.stringify({ success: true, booking_id: 'b1' }), { status: 201 })), 40),
        );
      }));

      render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />);
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByText('Book'));
      fireEvent.click(await screen.findByText('Enter WhatsApp manually'));
      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66912345678' } });

      const sendBtn = screen.getByText('Send request');
      fireEvent.click(sendBtn); // first tap — sets the ref synchronously
      fireEvent.click(sendBtn); // second tap before the first resolves / re-renders

      await new Promise((r) => setTimeout(r, 90));
      expect(postCount).toBe(1);
    });
  });
});

describe('classifyIntentPollResponse (intent status-poll branches)', () => {
  it('2xx used → used (show confirmation)', () => {
    expect(classifyIntentPollResponse({ ok: true, status: 200 }, { status: 'used' })).toBe('used');
  });
  it('2xx expired → expired (stop, no confirmation)', () => {
    expect(classifyIntentPollResponse({ ok: true, status: 200 }, { status: 'expired' })).toBe('expired');
  });
  it('2xx pending → retry (keep polling)', () => {
    expect(classifyIntentPollResponse({ ok: true, status: 200 }, { status: 'pending' })).toBe('retry');
  });
  it('2xx with a malformed body (no status) → retry', () => {
    expect(classifyIntentPollResponse({ ok: true, status: 200 }, {})).toBe('retry');
  });
  it('404 → gone (unknown/purged token → stop)', () => {
    expect(classifyIntentPollResponse({ ok: false, status: 404 }, null)).toBe('gone');
  });
  it('429 → retry (throttled → keep polling)', () => {
    expect(classifyIntentPollResponse({ ok: false, status: 429 }, null)).toBe('retry');
  });
  it('500 → retry (transient server error → keep polling)', () => {
    expect(classifyIntentPollResponse({ ok: false, status: 500 }, null)).toBe('retry');
  });
});

describe('VehicleBookingModal — seeds dates from the catalog filter', () => {
  const stubDetail = () =>
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(baseDetail), { status: 200, headers: { 'content-type': 'application/json' } })),
    ));

  it('prefills pick-up/return from initialFrom/initialTo', async () => {
    stubDetail();
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        initialFrom="2099-08-01"
        initialTo="2099-08-05"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    expect((screen.getByLabelText('Pick-up date') as HTMLInputElement).value).toBe('2099-08-01');
    expect((screen.getByLabelText('Return date') as HTMLInputElement).value).toBe('2099-08-05');
  });

  it('falls back to today / next-day when the filter had no dates', async () => {
    stubDetail();
    render(
      <VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    const pickup = (screen.getByLabelText('Pick-up date') as HTMLInputElement).value;
    const ret = (screen.getByLabelText('Return date') as HTMLInputElement).value;
    expect(pickup).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ret > pickup).toBe(true);
  });
});
