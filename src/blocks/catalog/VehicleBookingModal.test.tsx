import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { VehicleBookingModal, classifyIntentPollResponse } from './VehicleBookingModal';
import type { CatalogVehicle } from '../VehicleCatalog';
import { addDays, todayISO } from './dates';

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

/** Click a day in the availability calendar, paging forward to its month. */
function pickDay(iso: string) {
  for (let i = 0; i < 24; i += 1) {
    const button = document.querySelector<HTMLButtonElement>(`.sb-avcal__day[data-day="${iso}"] button`);
    if (button) {
      fireEvent.click(button);
      return;
    }
    fireEvent.click(document.querySelector('.sb-avcal__nav--next')!);
  }
  throw new Error(`day ${iso} is not reachable in the calendar`);
}

/** The step has no default period any more — pick one the way a customer does:
 *  two clicks in the calendar (tomorrow → three days from now). */
function pickDates() {
  pickDay(addDays(todayISO(), 1));
  pickDay(addDays(todayISO(), 3));
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
    const datesIdx = children.indexOf('sb-avcal-block'); // value fields + calendar
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
    pickDates();
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
    pickDates();
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
    pickDates();
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

    pickDates();
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
    pickDates();
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

describe('VehicleBookingModal — referral attribution', () => {
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
    pickDates();
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
      pickDates();
      fireEvent.click(await screen.findByText('Enter WhatsApp manually'));
      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    }

    it('rejects a value with no country code and does not submit', async () => {
      let called = false;
      await openManualForm(vi.fn((url: string) => {
        if (url.includes('/catalog/vehicles/') || url.includes('/catalog/availability/')) {
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
        if (url.includes('/catalog/vehicles/') || url.includes('/catalog/availability/')) {
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
        if (url.includes('/catalog/vehicles/') || url.includes('/catalog/availability/')) {
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
      pickDates();
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

describe('VehicleBookingModal — availability calendar on the "How to book?" step', () => {
  // The approved mock-up: a model of two units, "today" is 9 Oct 2026 on Phuket.
  const UNITS = [
    { vehicle_id: 'v1', busy: [{ start: '2026-10-09', end: '2026-10-14' }, { start: '2026-11-01', end: '2026-11-09' }] },
    { vehicle_id: 'v2', busy: [{ start: '2026-10-12', end: '2026-10-20' }, { start: '2026-10-25', end: '2026-11-03' }] },
  ];

  beforeEach(() => {
    // Only the clock is faked — timers stay real, so waitFor/polling still work.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T05:00:00Z')); // 12:00 on Phuket
    // The 1-click path opens the bot in a new tab (jsdom cannot navigate this one).
    vi.stubGlobal('open', vi.fn(() => ({ location: { href: '' }, close: vi.fn() })));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  interface ApiStub {
    /** Body of GET /availability/; a number → that HTTP error status. */
    availability?: unknown;
    /** Body of the 201 from POST /booking-requests/. */
    bookingResponse?: unknown;
    detail?: unknown;
  }
  function stubApi({ availability = { today: '2026-10-09', units: UNITS }, bookingResponse, detail = baseDetail }: ApiStub = {}) {
    const calls = { availability: [] as string[], request: [] as Record<string, unknown>[], intent: [] as Record<string, unknown>[] };
    const json = (body: unknown, status = 200) =>
      Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/catalog/availability/')) {
          calls.availability.push(u);
          return typeof availability === 'number' ? Promise.resolve(new Response('', { status: availability })) : json(availability);
        }
        if (u.includes('/booking-requests/')) {
          calls.request.push(JSON.parse(init?.body as string));
          return json(bookingResponse ?? { success: true, booking_id: 'b1' }, 201);
        }
        if (u.includes('/status/')) return json({ status: 'used' });
        if (u.includes('/booking-intents/')) {
          calls.intent.push(JSON.parse(init?.body as string));
          return json({ token: 'tok123' }, 201);
        }
        return json(detail);
      }),
    );
    return calls;
  }

  type ModalProps = Partial<Parameters<typeof VehicleBookingModal>[0]>;
  async function openChoice(locale: 'ru' | 'en', props: ModalProps = {}) {
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale={locale}
        botUsername="test_bot"
        unitIds={['v1', 'v2']}
        onClose={vi.fn()}
        {...props}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText(locale === 'ru' ? 'Забронировать' : 'Book'));
    await screen.findByText(locale === 'ru' ? 'Как забронировать?' : 'How to book?');
  }
  /** Wait until the availability answer is on screen (a day struck through). */
  const availabilityShown = () => waitFor(() => expect(document.querySelector('.sb-avcal__day.is-busy')).not.toBeNull());
  const status = () => document.querySelector('.sb-avcal__status') as HTMLElement;
  const button = (label: string) => screen.getByText(label).closest('button') as HTMLButtonElement;
  const sendManualForm = () => {
    fireEvent.change(screen.getByLabelText(/Your name|Ваше имя/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: '+66812345678' } });
    fireEvent.click(screen.getByText(/Send request|Отправить запрос/));
  };

  it('starts with no period: both booking buttons are disabled and there are no native date inputs', async () => {
    const calls = stubApi();
    await openChoice('en');
    await availabilityShown();

    expect(document.querySelector('input[type="date"]')).toBeNull();
    expect(screen.getAllByText('Select')).toHaveLength(2); // both value fields are empty
    expect(status().textContent).toBe('Choose the pick-up day.');
    expect(status().getAttribute('aria-live')).toBe('polite');
    expect(button('1-click booking via Telegram').disabled).toBe(true);
    expect(button('Enter WhatsApp manually').disabled).toBe(true);
    expect(screen.getByText('available')).toBeTruthy();
    expect(screen.getByText('booked')).toBeTruthy();
    expect(screen.getByText('your dates')).toBeTruthy();

    // A pick-up day alone is not a period yet.
    pickDay('2026-10-14');
    expect(button('1-click booking via Telegram').disabled).toBe(true);
    expect(button('Enter WhatsApp manually').disabled).toBe(true);
    expect(calls.request).toHaveLength(0);
    expect(calls.intent).toHaveLength(0);
  });

  it('asks availability once, for every unit, with the opened vehicle first', async () => {
    const calls = stubApi();
    await openChoice('en', { unitIds: ['v2', 'v3', 'v1'] });
    await availabilityShown();
    expect(calls.availability).toEqual(['/api/v1/catalog/availability/?vehicle_ids=v1,v2,v3']);
  });

  it('without unitIds asks only for the opened vehicle', async () => {
    const calls = stubApi({ availability: { today: '2026-10-09', units: [UNITS[0]] } });
    await openChoice('en', { unitIds: undefined });
    await availabilityShown();
    expect(calls.availability).toEqual(['/api/v1/catalog/availability/?vehicle_ids=v1']);
  });

  it('strikes out only the days when EVERY unit is busy, and explains the picked pick-up day (ru)', async () => {
    stubApi();
    await openChoice('ru');
    await availabilityShown();
    const cell = (iso: string) => document.querySelector(`.sb-avcal__day[data-day="${iso}"]`) as HTMLElement;
    expect(cell('2026-10-12').classList.contains('is-busy')).toBe(true);
    expect(cell('2026-10-13').classList.contains('is-busy')).toBe(true);
    expect(cell('2026-10-10').classList.contains('is-busy')).toBe(false); // unit 2 is free
    expect(cell('2026-10-14').classList.contains('is-busy')).toBe(false); // unit 1 is back

    expect(status().textContent).toBe('Выберите день получения.');
    pickDay('2026-10-10');
    expect(status().textContent).toBe('Получение 10 окт. Теперь выберите возврат — свободна до 12 окт.');
    expect(screen.getByText('10.10.2026')).toBeTruthy();
    expect(screen.getAllByText('Выберите')).toHaveLength(1); // the return field is still empty

    pickDay('2026-10-12'); // return on the day unit 2 goes out again — allowed
    expect(status().textContent).toBe('10 окт. → 12 окт. · 2 дня · свободна на эти даты');
    expect(screen.getByText('12.10.2026')).toBeTruthy();

    // A click on a complete period starts over. A busy day is clickable too —
    // the customer is told, not stopped.
    pickDay('2026-10-12');
    expect(status().textContent).toBe('12 окт. модель занята. Выберите день возврата.');
    expect(status().classList.contains('is-warn')).toBe(true);

    // No limit ahead → no "свободна до" tail.
    pickDay('2026-11-10');
    pickDay('2026-11-10');
    expect(status().textContent).toBe('Получение 10 нояб. Теперь выберите возврат.');
  });

  it('a free period is booked on the unit that covers it — not on the opened vehicle when that one is busy', async () => {
    const calls = stubApi();
    await openChoice('en');
    await availabilityShown();

    pickDay('2026-11-03');
    pickDay('2026-11-07'); // v1 is rented 1–9 Nov, v2 is free from 3 Nov
    expect(status().textContent).toBe('3 Nov → 7 Nov · 4 days · available for these dates');
    expect(status().classList.contains('is-ok')).toBe(true);
    expect(document.querySelector('.sb-avcal')!.classList.contains('is-conflict')).toBe(false);
    expect(screen.queryByText("We'll find a replacement for these dates")).toBeNull();

    fireEvent.click(button('Enter WhatsApp manually'));
    sendManualForm();
    await screen.findByText('Request sent!');
    expect(screen.getByText('We will contact you shortly.')).toBeTruthy();
    expect(calls.request).toHaveLength(1);
    expect(calls.request[0]).toMatchObject({ vehicle_id: 'v2', start_date: '2026-11-03', end_date: '2026-11-07' });
  });

  it('the 1-click Telegram intent goes to the covering unit as well', async () => {
    const calls = stubApi();
    await openChoice('en');
    await availabilityShown();
    pickDay('2026-11-03');
    pickDay('2026-11-07');
    fireEvent.click(button('1-click booking via Telegram'));
    await screen.findByText('Request sent!');
    expect(calls.intent).toHaveLength(1);
    expect(calls.intent[0]).toMatchObject({ vehicle_id: 'v2', start_date: '2026-11-03', end_date: '2026-11-07' });
  });

  it('returning on the day of somebody else’s pick-up is a free period', async () => {
    const calls = stubApi();
    await openChoice('en');
    await availabilityShown();
    pickDay('2026-10-10');
    pickDay('2026-10-12');
    expect(status().classList.contains('is-ok')).toBe(true);
    fireEvent.click(button('1-click booking via Telegram'));
    await waitFor(() => expect(calls.intent).toHaveLength(1));
    expect(calls.intent[0].vehicle_id).toBe('v2');
  });

  it('a busy period does not stop the customer: the buttons ask for a replacement and the manual request still goes out (ru)', async () => {
    const calls = stubApi();
    await openChoice('ru');
    await availabilityShown();
    pickDay('2026-11-01');
    pickDay('2026-11-05');

    expect(document.querySelector('.sb-avcal')!.classList.contains('is-conflict')).toBe(true);
    expect(status().textContent).toBe('Выбрано 1–5 нояб. · 4 дня. Модель занята: 1–2 нояб.');
    expect(status().classList.contains('is-warn')).toBe(true);
    expect(screen.getByText('На эти даты подберём замену')).toBeTruthy();
    expect(screen.getByText('Напишем, что свободно на ваши даты')).toBeTruthy();
    expect(screen.getByText('Менеджер подберёт машину и ответит')).toBeTruthy();
    expect(screen.queryByText('Бронь в 1 клик через Telegram')).toBeNull();
    expect(screen.queryByText('Указать WhatsApp вручную')).toBeNull();
    expect(button('Подобрать через Telegram').disabled).toBe(false);
    expect(button('Оставить WhatsApp').disabled).toBe(false);

    fireEvent.click(button('Оставить WhatsApp'));
    sendManualForm();
    // The 201 carries no `dates_busy` (older backend) → the calendar's verdict.
    await screen.findByText('Запрос получен!');
    expect(
      screen.getByText('BMW Z4 на 1 ноября – 5 ноября занята. Менеджер подберёт варианты и свяжется с вами.'),
    ).toBeTruthy();
    expect(screen.queryByText('Заявка отправлена!')).toBeNull();
    // Nobody covers the period → the request stays on the opened vehicle.
    expect(calls.request).toHaveLength(1);
    expect(calls.request[0]).toMatchObject({
      vehicle_id: 'v1', start_date: '2026-11-01', end_date: '2026-11-05', contact_channel: 'whatsapp',
    });
  });

  it('a busy period through Telegram: the intent is created and the confirmation says "Request received!"', async () => {
    const calls = stubApi();
    await openChoice('en');
    await availabilityShown();
    pickDay('2026-11-01');
    pickDay('2026-11-05');
    expect(status().textContent).toBe('Selected 1–5 Nov · 4 days. The model is booked: 1–2 Nov');

    fireEvent.click(button('Find one via Telegram'));
    await screen.findByText('Request received!');
    expect(
      screen.getByText('BMW Z4 is booked for 1 November – 5 November. A manager will find options and contact you.'),
    ).toBeTruthy();
    expect(calls.intent).toHaveLength(1);
    expect(calls.intent[0]).toMatchObject({ vehicle_id: 'v1', start_date: '2026-11-01', end_date: '2026-11-05' });
  });

  it('every day is free on some unit, but no single unit covers the period → still a replacement request', async () => {
    stubApi({
      availability: {
        today: '2026-10-09',
        units: [
          { vehicle_id: 'v1', busy: [{ start: '2026-10-12', end: '2026-10-15' }] },
          { vehicle_id: 'v2', busy: [{ start: '2026-10-15', end: '2026-10-18' }] },
        ],
      },
    });
    await openChoice('ru');
    pickDay('2026-10-11');
    pickDay('2026-10-17');
    await waitFor(() =>
      expect(status().textContent).toBe('Выбрано 11–17 окт. · 6 дней. На весь срок свободной машины нет'),
    );
    expect(document.querySelector('.sb-avcal__day.is-busy')).toBeNull();
    expect(screen.getByText('Подобрать через Telegram')).toBeTruthy();
  });

  it('the server has the last word: `dates_busy: true` on a locally free period shows "Request received!"', async () => {
    stubApi({ bookingResponse: { success: true, booking_id: 'b1', dates_busy: true } });
    await openChoice('en');
    await availabilityShown();
    pickDay('2026-11-03');
    pickDay('2026-11-07');
    fireEvent.click(button('Enter WhatsApp manually')); // locally free → the regular label
    sendManualForm();
    await screen.findByText('Request received!');
    expect(screen.queryByText('Request sent!')).toBeNull();
  });

  it('`dates_busy: false` on a locally busy period shows the regular confirmation', async () => {
    stubApi({ bookingResponse: { success: true, booking_id: 'b1', dates_busy: false } });
    await openChoice('en');
    await availabilityShown();
    pickDay('2026-11-01');
    pickDay('2026-11-05');
    fireEvent.click(button('Leave your WhatsApp'));
    sendManualForm();
    await screen.findByText('Request sent!');
    expect(screen.queryByText('Request received!')).toBeNull();
  });

  it('availability endpoint missing (old backend, 404) → the step works, nothing is struck out', async () => {
    const calls = stubApi({ availability: 404 });
    await openChoice('en');
    await waitFor(() => expect(calls.availability).toHaveLength(1));

    pickDay('2026-11-01');
    pickDay('2026-11-05');
    expect(document.querySelector('.sb-avcal__day.is-busy')).toBeNull();
    expect(document.querySelector('.sb-avcal')!.classList.contains('is-conflict')).toBe(false);
    // Availability is unknown → no "available" claim, and no replacement wording.
    expect(status().textContent).toBe('1 Nov → 5 Nov · 4 days');
    expect(screen.queryByText("We'll find a replacement for these dates")).toBeNull();

    fireEvent.click(button('Enter WhatsApp manually'));
    sendManualForm();
    await screen.findByText('Request sent!');
    expect(calls.request[0]).toMatchObject({ vehicle_id: 'v1', start_date: '2026-11-01', end_date: '2026-11-05' });
  });

  it('a malformed availability body is treated as "unknown", not as a crash', async () => {
    const calls = stubApi({ availability: { units: [null, { vehicle_id: 'v1' }, { vehicle_id: 7, busy: [] }] } });
    await openChoice('en');
    await waitFor(() => expect(calls.availability).toHaveLength(1));
    pickDay('2026-11-01');
    pickDay('2026-11-05');
    expect(document.querySelector('.sb-avcal__day.is-busy')).toBeNull();
    expect(button('1-click booking via Telegram').disabled).toBe(false);
  });

  it('«Book from <date>» on the detail screen sets the pick-up day and clears the return day', async () => {
    const busyVehicle: CatalogVehicle = { ...vehicle, is_available: false, free_from: '2026-10-14' };
    stubApi({ detail: { ...baseDetail, is_available: false, free_from: '2026-10-14' } });
    render(
      <VehicleBookingModal
        vehicle={busyVehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        initialFrom="2026-11-03"
        initialTo="2026-11-07"
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByText('Book from 2026-10-14'));
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');

    // The seeded period is replaced: calendar open, return day to be picked.
    expect(document.querySelector('.sb-avcal__summary')).toBeNull();
    expect(screen.getByText('14.10.2026')).toBeTruthy();
    expect(screen.getAllByText('Select')).toHaveLength(1);
    expect(document.querySelector('.sb-avcal__day[data-day="2026-10-14"]')!.classList.contains('is-start')).toBe(true);
    expect(button('1-click booking via Telegram').disabled).toBe(true);
  });

  it('booking buttons stay disabled until availability resolves', async () => {
    stubApi();
    const base = globalThis.fetch as unknown as (u: string, i?: RequestInit) => Promise<Response>;
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((u: string, i?: RequestInit) =>
        String(u).includes('/catalog/availability/') ? gate.then(() => base(u, i)) : base(u, i),
      ),
    );
    await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });
    expect(button('1-click booking via Telegram').disabled).toBe(true);
    expect(button('Enter WhatsApp manually').disabled).toBe(true);
    release();
    await waitFor(() => expect(button('1-click booking via Telegram').disabled).toBe(false));
    expect(button('Enter WhatsApp manually').disabled).toBe(false);
  });

  it('availability failure enables the buttons', async () => {
    stubApi();
    const base = globalThis.fetch as unknown as (u: string, i?: RequestInit) => Promise<Response>;
    vi.stubGlobal(
      'fetch',
      vi.fn((u: string, i?: RequestInit) =>
        String(u).includes('/catalog/availability/') ? Promise.reject(new Error('network')) : base(u, i),
      ),
    );
    await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });
    await waitFor(() => expect(button('1-click booking via Telegram').disabled).toBe(false));
    expect(button('Enter WhatsApp manually').disabled).toBe(false);
  });

  it("calendar uses the server's today", async () => {
    // Устройство: 2026-10-09; сервер говорит, что на Пхукете уже 11-е.
    stubApi({ availability: { today: '2026-10-11', units: [{ vehicle_id: 'v1', busy: [] }] } });
    await openChoice('en');
    await waitFor(() =>
      expect(document.querySelector<HTMLButtonElement>('.sb-avcal__day[data-day="2026-10-09"] button')!.disabled).toBe(true),
    );
    expect(document.querySelector<HTMLButtonElement>('.sb-avcal__day[data-day="2026-10-11"] button')!.disabled).toBe(false);
  });

  describe('dates seeded from the catalog filter', () => {
    it('free period → one collapsed row; «Change» opens the calendar for good', async () => {
      const calls = stubApi();
      await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });

      // Collapsed from the first paint (availability still loading) and after it.
      expect(document.querySelector('.sb-avcal__summary')).not.toBeNull();
      await waitFor(() => expect(status().textContent).toBe('4 days · available for these dates'));
      expect(document.querySelector('.sb-avcal')).toBeNull();
      expect(document.querySelector('.sb-vd__dates')).toBeNull();
      expect(document.querySelector('.sb-avcal-block')!.classList.contains('is-collapsed')).toBe(true);
      expect(screen.getByText('Rental dates')).toBeTruthy();
      expect(document.querySelector('.sb-filterbar__availability-range')!.textContent).toBe('03.11.2026 — 07.11.2026');
      // The compact row has no "available only" switch — that belongs to the list.
      expect(document.querySelector('.sb-avcal__summary input')).toBeNull();
      expect(button('1-click booking via Telegram').disabled).toBe(false);

      fireEvent.click(screen.getByText('Change'));
      expect(document.querySelector('.sb-avcal__summary')).toBeNull();
      expect(document.querySelector('.sb-avcal')).not.toBeNull();
      expect(screen.getByText('03.11.2026')).toBeTruthy();
      expect(screen.getByText('07.11.2026')).toBeTruthy();
      expect(document.querySelector('.sb-avcal__day[data-day="2026-11-03"]')!.classList.contains('is-start')).toBe(true);
      expect(status().textContent).toBe('3 Nov → 7 Nov · 4 days · available for these dates');

      // Picking another free period does not collapse it back.
      pickDay('2026-11-10');
      pickDay('2026-11-12');
      expect(document.querySelector('.sb-avcal')).not.toBeNull();
      expect(document.querySelector('.sb-avcal__summary')).toBeNull();

      fireEvent.click(button('1-click booking via Telegram'));
      await waitFor(() => expect(calls.intent).toHaveLength(1));
      expect(calls.intent[0]).toMatchObject({ start_date: '2026-11-10', end_date: '2026-11-12' });
    });

    it('the seeded period is sent as is from the collapsed row, on the covering unit', async () => {
      const calls = stubApi();
      await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });
      await waitFor(() => expect(status().textContent).toBe('4 days · available for these dates'));
      fireEvent.click(button('1-click booking via Telegram'));
      await waitFor(() => expect(calls.intent).toHaveLength(1));
      expect(calls.intent[0]).toMatchObject({ vehicle_id: 'v2', start_date: '2026-11-03', end_date: '2026-11-07' });
    });

    it('busy period → the calendar is open right away, with the replacement wording', async () => {
      stubApi();
      await openChoice('ru', { initialFrom: '2026-11-01', initialTo: '2026-11-05' });
      await waitFor(() => expect(document.querySelector('.sb-avcal.is-conflict')).not.toBeNull());
      expect(document.querySelector('.sb-avcal__summary')).toBeNull();
      expect(status().textContent).toBe('Выбрано 1–5 нояб. · 4 дня. Модель занята: 1–2 нояб.');
      expect(screen.getByText('Подобрать через Telegram')).toBeTruthy();

      // It stays open once the customer moves to a free period.
      pickDay('2026-11-10');
      pickDay('2026-11-12');
      expect(document.querySelector('.sb-avcal')).not.toBeNull();
      expect(document.querySelector('.sb-avcal__summary')).toBeNull();
      expect(screen.getByText('Бронь в 1 клик через Telegram')).toBeTruthy();
    });

    it('availability unknown (404) → the seeded dates stay collapsed, without the "available" claim', async () => {
      const calls = stubApi({ availability: 404 });
      await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });
      await waitFor(() => expect(calls.availability).toHaveLength(1));
      expect(document.querySelector('.sb-avcal__summary')).not.toBeNull();
      expect(status().textContent).toBe('4 days');
    });

    it('a half pair, a past start or a reversed pair is not seeded — the period starts empty', async () => {
      const cases: ModalProps[] = [
        { initialFrom: '2026-11-03' },
        { initialTo: '2026-11-07' },
        { initialFrom: '2026-10-01', initialTo: '2026-10-20' }, // pick-up day already passed
        { initialFrom: '2026-11-07', initialTo: '2026-11-03' },
      ];
      for (const props of cases) {
        stubApi();
        await openChoice('en', props);
        expect(document.querySelector('.sb-avcal__summary')).toBeNull();
        expect(screen.getAllByText('Select')).toHaveLength(2);
        expect(button('1-click booking via Telegram').disabled).toBe(true);
        cleanup();
      }
    });

    it('a pair starting today is seeded', async () => {
      stubApi({ availability: { today: '2026-10-09', units: [{ vehicle_id: 'v1', busy: [] }] } });
      await openChoice('en', { unitIds: undefined, initialFrom: '2026-10-09', initialTo: '2026-10-11' });
      await waitFor(() => expect(status().textContent).toBe('2 days · available for these dates'));
      expect(document.querySelector('.sb-filterbar__availability-range')!.textContent).toBe('09.10.2026 — 11.10.2026');
    });
  });
});

describe('VehicleBookingModal — specs from typed fields (CD-114)', () => {
  const specDetail = {
    ...baseDetail,
    fuel_type: 'petrol', transmission: 'automatic', drive_type: 'rwd',
    engine_volume_l: '2.0', forced_induction: 'turbo', horse_power_hp: 258,
    sprint_0_100_s: '6.2', max_speed_kmh: 250,
    // The legacy free-text field is still in the API until CD-114 lands on the
    // backend — the card must NOT show it any more.
    horse_power: '999 л.с. (old text)',
  };
  // Tariff grid whose last period is the 28+ one (owner decision 2026-10-03: the
  // monthly tariff is gone; the 30-day figure is a reference total, not a plan).
  const pricingDetail = {
    ...baseDetail,
    pricing_table: [
      { period_label: '15-27', min_days: 15, max_days: 27, price_per_day: 2000 },
      { period_label: '28+', min_days: 28, max_days: null, price_per_day: 1833.333333, price_30_days: 55000 },
    ],
  };
  const pricingDetailNoTotal = {
    ...baseDetail,
    pricing_table: [
      { period_label: '15-27', min_days: 15, max_days: 27, price_per_day: 2000 },
      { period_label: '28+', min_days: 28, max_days: null, price_per_day: 1833.333333 },
    ],
  };
  const norm = (el: Element | null) => (el?.textContent ?? '').replace(/\s/g, ' ');

  it('shows the key specs with units and hides the rest behind the toggle', async () => {
    renderModal(specDetail, 'ru');
    const engine = await screen.findByText('Двигатель');
    expect(norm(engine.nextElementSibling)).toBe('2,0 л, турбо');
    expect(norm(screen.getByText('Мощность').nextElementSibling)).toBe('258 л.с.');
    expect(screen.queryByText('Разгон 0–100')).toBeNull();
    expect(screen.queryByText(/old text/)).toBeNull();

    fireEvent.click(screen.getByText(/Все характеристики/));
    expect(norm(screen.getByText('Разгон 0–100').nextElementSibling)).toBe('6,2 с');
  });

  it('a vehicle with no specs renders no specs section', async () => {
    renderModal(baseDetail, 'ru');
    await screen.findByText('Забронировать');
    expect(screen.queryByText('Характеристики')).toBeNull();
  });

  it('shows the 30-day total under the price tiles', async () => {
    renderModal(pricingDetail, 'ru');
    await screen.findByText('BMW Z4');
    expect(screen.getByText('28+ дней')).toBeTruthy();
    expect(screen.getByText('30 дней')).toBeTruthy();
    expect(screen.getByText('55,000')).toBeTruthy();
    expect(screen.queryByText('(мес)')).toBeNull();
    // Цена дня — до сотых: «1,833» рядом с «55,000» не сходилось бы на 10 бат.
    expect(screen.getByText('1,833.33')).toBeTruthy();
    // В строке «30 дней» множителя нет — только «по тарифу 28+».
    expect(screen.getByText('по тарифу 28+')).toBeTruthy();
    expect(screen.queryByText(/30 ×/)).toBeNull();
  });

  it('hides the 30-day row when the API does not send price_30_days', async () => {
    renderModal(pricingDetailNoTotal, 'ru');
    await screen.findByText('BMW Z4');
    expect(screen.queryByText('30 дней')).toBeNull();
  });
});
