import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within, act } from '@testing-library/react';
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
              price: 1500, price_unit: 'per_booking', stock: null, available_stock: null,
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
    // «฿», groups and the currency joined by non-breaking spaces.
    expect(document.querySelector('.sb-acc__item-price')?.textContent).toBe('1\u00a0500\u00a0฿ per booking');
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

  it('the carousel sits after the dates (vehicle → dates → add-ons)', async () => {
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
    const vehicleIdx = children.indexOf('sb-stephead');
    const accessoriesIdx = children.indexOf('sb-vd__accessories');
    const datesIdx = children.indexOf('sb-avcal-block'); // value fields + calendar
    expect(vehicleIdx).toBeGreaterThanOrEqual(0);
    expect(datesIdx).toBeGreaterThan(vehicleIdx);
    expect(accessoriesIdx).toBeGreaterThan(datesIdx);
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
    fireEvent.click(await screen.findByText('Book manually'));

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
    fireEvent.click(screen.getByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('Book manually'));
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
    fireEvent.click(screen.getByText('1-click booking'));

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
    fireEvent.click(screen.getByText('1-click booking'));
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
    expect(await screen.findByText('600 ฿')).toBeTruthy();
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
    fireEvent.click(await screen.findByText('Book manually'));
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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('1-click booking'));

    await screen.findByText('Could not send. Please try again.');
    const tgButton = screen.getByText('1-click booking').closest('button') as HTMLButtonElement;
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
    fireEvent.click(await screen.findByText('1-click booking'));

    await screen.findByText('Could not send. Please try again.');
    const tgButton = screen.getByText('1-click booking').closest('button') as HTMLButtonElement;
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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('1-click booking'));

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
    fireEvent.click(await screen.findByText('Book manually'));

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
    fireEvent.click(await screen.findByText('Book manually'));

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
    fireEvent.click(await screen.findByText('Book manually'));

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
      fireEvent.click(await screen.findByText('Book manually'));
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
      fireEvent.click(await screen.findByText('Book manually'));
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
    expect(button('1-click booking').disabled).toBe(true);
    expect(button('Book manually').disabled).toBe(true);
    expect(screen.getByText('available')).toBeTruthy();
    expect(screen.getByText('booked')).toBeTruthy();
    expect(screen.getByText('your dates')).toBeTruthy();

    // A pick-up day alone is not a period yet.
    pickDay('2026-10-14');
    expect(button('1-click booking').disabled).toBe(true);
    expect(button('Book manually').disabled).toBe(true);
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

    fireEvent.click(button('Book manually'));
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
    fireEvent.click(button('1-click booking'));
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
    fireEvent.click(button('1-click booking'));
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
    expect(screen.queryByText('Бронь в 1 клик')).toBeNull();
    expect(screen.queryByText('Бронь вручную')).toBeNull();
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
    fireEvent.click(button('Book manually')); // locally free → the regular label
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

    fireEvent.click(button('Book manually'));
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
    expect(button('1-click booking').disabled).toBe(false);
  });

  function renderBusy(props: ModalProps = {}) {
    const busyVehicle: CatalogVehicle = { ...vehicle, is_available: false, free_from: '2026-10-14' };
    const calls = stubApi({ detail: { ...baseDetail, is_available: false, free_from: '2026-10-14' } });
    render(
      <VehicleBookingModal vehicle={busyVehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} {...props} />,
    );
    return calls;
  }
  const valueFields = () => Array.from(document.querySelectorAll('.sb-avcal__value')).map((n) => n.textContent);

  it('busy vehicle Book starts from free_from', async () => {
    renderBusy();
    // The date is shown once, human-readable, as the cover status badge.
    await screen.findByText('Frees up 14 October');
    expect(document.querySelector('.sb-vd__hero .sb-vcard__status--free')?.textContent).toBe('Frees up 14 October');
    // No separate «Book» next to the status any more — the one «Book» at the bottom.
    expect(document.querySelector('.sb-vd__avail-btn')).toBeNull();
    expect(screen.getAllByText('Book')).toHaveLength(1);
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');

    // No period yet → it starts on the return day; the calendar is open.
    expect(document.querySelector('.sb-avcal__summary')).toBeNull();
    expect(valueFields()).toEqual(['14.10.2026', 'Select']);
    expect(document.querySelector('.sb-avcal__day[data-day="2026-10-14"]')!.classList.contains('is-start')).toBe(true);
    expect(button('1-click booking').disabled).toBe(true);
  });

  it('busy vehicle: a seeded period starting before free_from is moved to free_from', async () => {
    renderBusy({ initialFrom: '2026-10-10', initialTo: '2026-10-20' });
    await screen.findByText('Frees up 14 October');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    expect(document.querySelector('.sb-avcal__summary')).toBeNull();
    expect(valueFields()).toEqual(['14.10.2026', 'Select']);
  });

  it('busy vehicle: a seeded period later than free_from is kept', async () => {
    const calls = renderBusy({ initialFrom: '2026-10-20', initialTo: '2026-10-23' });
    await screen.findByText('Frees up 14 October');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    await waitFor(() => expect(status().textContent).toBe('3 days · available for these dates'));
    expect(document.querySelector('.sb-filterbar__availability-range')!.textContent).toBe('20.10.2026 — 23.10.2026');
    fireEvent.click(button('1-click booking'));
    await waitFor(() => expect(calls.intent).toHaveLength(1));
    expect(calls.intent[0]).toMatchObject({ start_date: '2026-10-20', end_date: '2026-10-23' });
  });

  it('busy vehicle: dates picked, «‹ Back», «Book» again → the pick is kept', async () => {
    renderBusy();
    await screen.findByText('Frees up 14 October');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    await availabilityShown();
    // A new period after the return day: 22 → 25 Oct.
    pickDay('2026-10-20');
    pickDay('2026-10-22');
    pickDay('2026-10-25');
    expect(valueFields()).toEqual(['22.10.2026', '25.10.2026']);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await screen.findByText('Frees up 14 October');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    expect(valueFields()).toEqual(['22.10.2026', '25.10.2026']);
    expect(document.querySelector('.sb-avcal__day[data-day="2026-10-22"]')!.classList.contains('is-start')).toBe(true);
  });

  it('the detail is asked for the seeded window; without a seed — plain', async () => {
    stubApi();
    const fetchMock = globalThis.fetch as unknown as { mock: { calls: [string][] } };
    const detailUrls = () => fetchMock.mock.calls.map(([u]) => String(u)).filter((u) => u.includes('/catalog/vehicles/'));
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        initialFrom="2026-11-03"
        initialTo="2026-11-07"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    expect(detailUrls()).toEqual([`/api/v1/catalog/vehicles/${vehicle.id}/?available_from=2026-11-03&available_to=2026-11-07`]);
    cleanup();

    for (const props of [{}, { initialFrom: '2026-11-03' }, { initialFrom: '2026-10-01', initialTo: '2026-10-20' }] as ModalProps[]) {
      stubApi();
      const mock = globalThis.fetch as unknown as { mock: { calls: [string][] } };
      render(<VehicleBookingModal vehicle={vehicle} apiBase="" locale="en" botUsername="test_bot" onClose={vi.fn()} {...props} />);
      await screen.findByText('BMW Z4');
      const urls = mock.mock.calls.map(([u]) => String(u)).filter((u) => u.includes('/catalog/vehicles/'));
      expect(urls).toEqual([`/api/v1/catalog/vehicles/${vehicle.id}/`]);
      cleanup();
    }
  });

  it('a free vehicle Book keeps the seeded period', async () => {
    stubApi();
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale="en"
        botUsername="test_bot"
        initialFrom="2026-10-20"
        initialTo="2026-10-23"
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('Available now');
    fireEvent.click(screen.getByText('Book'));
    await screen.findByText('How to book?');
    // The seeded period stays: one collapsed row, nothing replaced.
    await waitFor(() => expect(document.querySelector('.sb-avcal__summary')).not.toBeNull());
    expect(screen.queryByText('Select')).toBeNull();
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
    expect(button('1-click booking').disabled).toBe(true);
    expect(button('Book manually').disabled).toBe(true);
    release();
    await waitFor(() => expect(button('1-click booking').disabled).toBe(false));
    expect(button('Book manually').disabled).toBe(false);
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
    await waitFor(() => expect(button('1-click booking').disabled).toBe(false));
    expect(button('Book manually').disabled).toBe(false);
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
      expect(button('1-click booking').disabled).toBe(false);

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

      fireEvent.click(button('1-click booking'));
      await waitFor(() => expect(calls.intent).toHaveLength(1));
      expect(calls.intent[0]).toMatchObject({ start_date: '2026-11-10', end_date: '2026-11-12' });
    });

    it('the seeded period is sent as is from the collapsed row, on the covering unit', async () => {
      const calls = stubApi();
      await openChoice('en', { initialFrom: '2026-11-03', initialTo: '2026-11-07' });
      await waitFor(() => expect(status().textContent).toBe('4 days · available for these dates'));
      fireEvent.click(button('1-click booking'));
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
      expect(screen.getByText('Бронь в 1 клик')).toBeTruthy();
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
        expect(button('1-click booking').disabled).toBe(true);
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
  const norm = (el: Element | null) => (el?.textContent ?? '').replace(/\s/g, ' ');

  it('specs tab shows all rows without toggle', async () => {
    renderModal(specDetail, 'ru');
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByRole('tab', { name: 'Параметры' }));
    const panel = screen.getByRole('tabpanel');
    const engine = within(panel).getByText('Двигатель');
    expect(norm(engine.nextElementSibling)).toBe('2,0 л, турбо');
    expect(norm(within(panel).getByText('Мощность').nextElementSibling)).toBe('258 л.с.');
    // All rows at once — no «Все характеристики» toggle.
    expect(norm(within(panel).getByText('Разгон 0–100').nextElementSibling)).toBe('6,2 с');
    expect(screen.queryByText(/Все характеристики/)).toBeNull();
    expect(screen.queryByText(/old text/)).toBeNull();
  });

  it('a vehicle with no specs renders no specs tab', async () => {
    renderModal(baseDetail, 'ru');
    await screen.findByText('Забронировать');
    expect(screen.queryByRole('tab', { name: 'Параметры' })).toBeNull();
    // Nothing to show at all → no tab row either.
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('prices tab uses pricing_seasons', async () => {
    renderModal(
      {
        ...pricingDetail,
        pricing_season_name: 'Ноябрь',
        pricing_periods: [
          { min_days: 1, max_days: 1 },
          { min_days: 2, max_days: 3 },
          { min_days: 28, max_days: null },
        ],
        pricing_seasons: [
          { start_date: '2026-11-01', end_date: '2026-11-30', prices: ['2200.00', '2000.00', '1400.00'] },
          { start_date: '2026-12-01', end_date: '2027-02-28', prices: ['17000.00', null, '1666.01'] },
        ],
      },
      'en',
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByRole('tab', { name: 'All prices' }));
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Prices by season')).toBeTruthy();
    const heads = Array.from(panel.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(heads).toEqual(['Season', '1 day', '2–3', '28+']);
    const rows = Array.from(panel.querySelectorAll('tbody tr'));
    expect(rows.map((r) => r.querySelector('th')!.firstChild?.textContent)).toEqual(['November', 'Dec – Feb']);
    expect(Array.from(rows[1].querySelectorAll('td')).map((c) => norm(c))).toEqual(['17 000', '—', '1 667']);
    expect(rows[0].classList.contains('is-now')).toBe(true);
    // pricing_table is not shown when the seasons are there; the season name never is.
    expect(within(panel).queryByText('15–27')).toBeNull();
    expect(screen.queryByText(/Ноябрь/)).toBeNull();
  });

  it('prices tab falls back to pricing_table', async () => {
    renderModal({ ...pricingDetail, pricing_season_name: 'Октябрь' }, 'ru');
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByRole('tab', { name: 'Все цены' }));
    const panel = screen.getByRole('tabpanel');
    const heads = Array.from(panel.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(heads).toEqual(['Сезон', '15–27', '28+']);
    const rows = Array.from(panel.querySelectorAll('tbody tr'));
    // One row — the current month, prices of today's ladder rounded up.
    expect(rows).toHaveLength(1);
    const month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][
      Number(todayISO().slice(5, 7)) - 1
    ];
    expect(rows[0].querySelector('th')!.firstChild?.textContent).toBe(month);
    expect(Array.from(rows[0].querySelectorAll('td')).map((c) => norm(c))).toEqual(['2 000', '1 834']);
    // The old «30 дней» reference row is gone.
    expect(screen.queryByText('по тарифу 28+')).toBeNull();
  });

  it('no seasons and no pricing_table → no prices tab', async () => {
    renderModal({ ...specDetail, pricing_periods: [{ min_days: 1, max_days: 1 }], pricing_seasons: [] }, 'en');
    await screen.findByText('BMW Z4');
    expect(screen.queryByRole('tab', { name: 'All prices' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Specs' })).toBeTruthy();
  });
});

describe('VehicleBookingModal — vehicle window (detail)', () => {
  const fullDetail = {
    ...baseDetail,
    year: 2024,
    category: { id: 'c1', name: 'Электрокары', name_en: 'EVs', color: '#00f' },
    gallery_images: [
      { image_url: 'https://cdn.example/1.jpg', position: 0 },
      { image_url: 'https://cdn.example/2.jpg', position: 1 },
      { image_url: 'https://cdn.example/3.jpg', position: 2 },
    ],
    advantages: ['Запас хода 430 км', 'Просторный салон'],
    options: ['CarPlay', 'Панорамная крыша'],
    deposits: [
      { currency_code: 'THB', amount: '10000.00' },
      { currency_code: 'USD', amount: '300.00' },
    ],
    pricing_table: [{ period_label: '1', min_days: 1, max_days: 1, price_per_day: 2000 }],
    fuel_type: 'electric',
    card_prices: {
      per_day_min: '1833.33',
      per_day_max: '2200.00',
      quotes: [
        { days: 7, total: '12600.00' },
        { days: 14, total: '23800.00' },
        { days: 30, total: '55000.10' },
      ],
      month_discount_pct: 35,
    },
  };
  const NB = '\u00a0';

  it('gallery: back on «детали» the track, counter and thumbs are on the same photo as the step cover', async () => {
    // jsdom has no layout: give the track a width and keep its scroll offset.
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('sb-vd__frame') ? 300 : 0;
      },
    });
    try {
      renderModal(fullDetail);
      await screen.findByText('BMW Z4');
      const track = () => document.querySelector('.sb-vd__frame') as HTMLElement;
      const counter = () => document.querySelector('.sb-vd__counter')?.textContent;
      const activeThumb = () =>
        Array.from(document.querySelectorAll('.sb-vd__thumb')).findIndex((b) => b.classList.contains('is-active'));
      expect(counter()).toBe('1/3');
      // Swipe to the third photo.
      track().scrollLeft = 600;
      fireEvent.scroll(track());
      expect(counter()).toBe('3/3');
      fireEvent.click(screen.getByText('Book'));
      await screen.findByText('How to book?');
      expect(document.querySelector('.sb-stephead__photo')?.getAttribute('src')).toBe('https://cdn.example/3.jpg');
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      await screen.findByText('Book');
      // The remounted track is scrolled back to that photo — not left at the first one.
      expect(track().scrollLeft).toBe(600);
      expect(counter()).toBe('3/3');
      expect(activeThumb()).toBe(2);
    } finally {
      if (desc) Object.defineProperty(HTMLElement.prototype, 'clientWidth', desc);
    }
  });

  it('focus moves to step title', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T05:00:00Z'));
    try {
      const json = (body: unknown, status = 200) =>
        Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
      vi.stubGlobal(
        'fetch',
        vi.fn((url: string) => {
          const u = String(url);
          if (u.includes('/catalog/availability/')) return json({ today: '2026-10-09', units: [{ vehicle_id: vehicle.id, busy: [] }] });
          if (u.includes('/booking-requests/')) return json({ success: true, dates_busy: false }, 201);
          if (u.includes('/price-quote/')) return json({}, 500);
          return json(fullDetail);
        }),
      );
      render(
        <VehicleBookingModal
          vehicle={vehicle}
          apiBase=""
          locale="en"
          botUsername="test_bot"
          initialFrom="2026-10-20"
          initialTo="2026-10-23"
          onClose={vi.fn()}
        />,
      );
      await screen.findByText('BMW Z4');
      // First open: focus is left as before (not pulled to a title).
      const title = (name: string) => screen.getByRole('heading', { name });
      expect(document.activeElement).not.toBe(title('BMW Z4'));

      fireEvent.click(screen.getByText('Book'));
      await screen.findByText('How to book?');
      expect(document.activeElement).toBe(title('How to book?'));
      expect(title('How to book?').getAttribute('tabindex')).toBe('-1');

      await waitFor(() => expect((screen.getByText('Book manually').closest('button') as HTMLButtonElement).disabled).toBe(false));
      fireEvent.click(screen.getByText('Book manually'));
      await screen.findByText('Send request');
      expect(document.activeElement).toBe(title('Booking request'));

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      await screen.findByText('How to book?');
      expect(document.activeElement).toBe(title('How to book?'));

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      await screen.findByText('Book');
      const hero = document.querySelector('.sb-vd__hero') as HTMLElement;
      expect(document.activeElement).toBe(within(hero).getByRole('heading', { name: 'BMW Z4' }));

      fireEvent.click(screen.getByText('Book'));
      await screen.findByText('How to book?');
      await waitFor(() => expect((screen.getByText('Book manually').closest('button') as HTMLButtonElement).disabled).toBe(false));
      fireEvent.click(screen.getByText('Book manually'));
      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
      fireEvent.click(screen.getByText('Send request'));
      await screen.findByText('Request sent!');
      expect(document.activeElement).toBe(title('Request sent!'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('«All prices» highlights the season of the catalog window start', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T05:00:00Z'));
    try {
      const seasonsDetail = {
        ...fullDetail,
        pricing_periods: [
          { min_days: 1, max_days: 6 },
          { min_days: 7, max_days: null },
        ],
        pricing_seasons: [
          { start_date: '2026-11-01', end_date: '2026-11-30', prices: ['2000.00', '1800.00'] },
          { start_date: '2026-12-01', end_date: '2026-12-31', prices: ['2500.00', '2200.00'] },
        ],
      };
      const rowsNow = () =>
        Array.from(document.querySelectorAll('.sb-pgrid__table tbody tr')).map((tr) => tr.classList.contains('is-now'));
      stubDetailFetch(seasonsDetail);
      render(
        <VehicleBookingModal
          vehicle={vehicle}
          apiBase=""
          locale="en"
          botUsername="test_bot"
          initialFrom="2026-12-05"
          initialTo="2026-12-10"
          onClose={vi.fn()}
        />,
      );
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByRole('tab', { name: 'All prices' }));
      expect(rowsNow()).toEqual([false, true]);
      cleanup();
      // No window: «today» (9 Oct) is before the first season → no highlight.
      renderModal(seasonsDetail);
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByRole('tab', { name: 'All prices' }));
      expect(rowsNow()).toEqual([false, false]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('detail shows hero with status, range and 7/14/30', async () => {
    renderModal(fullDetail, 'ru');
    await screen.findByText('BMW Z4');
    const hero = document.querySelector('.sb-vd__hero')!;
    expect(within(hero as HTMLElement).getByRole('heading', { name: 'BMW Z4' })).toBeTruthy();
    expect(hero.querySelector('.sb-vcard__sub')?.textContent).toBe('2024Электрокары');
    expect(hero.querySelector('.sb-vcard__status--available')?.textContent).toBe('Свободна сейчас');
    const range = hero.querySelector('.sb-vcard__range')!;
    expect(range.querySelector('small')?.textContent).toBe('в сутки');
    expect(range.querySelector('b')?.textContent).toBe(`1${NB}834 – 2${NB}200${NB}฿`);
    expect(Array.from(hero.querySelectorAll('.sb-vcard__tile-sum')).map((n) => n.textContent)).toEqual([
      `12${NB}600${NB}฿`,
      `23${NB}800${NB}฿`,
      `55${NB}001${NB}฿`,
    ]);
    expect(hero.querySelector('.sb-vcard__flag')?.textContent).toBe('−35%');
    // Gallery keeps arrows, the «1/N» counter and the thumbnails under the photo.
    expect(hero.querySelectorAll('.sb-vd__photo')).toHaveLength(3);
    expect(hero.querySelector('.sb-vd__counter')?.textContent).toBe('1/3');
    expect(screen.getByRole('button', { name: 'Следующее фото' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предыдущее фото' })).toBeTruthy();
    expect(document.querySelectorAll('.sb-vd__thumbs .sb-vd__thumb')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Фото 2' })).toBeTruthy();
    // No «THB» in the window header; the old share pill in the meta row is gone.
    expect(hero.textContent).not.toContain('THB');
    expect(document.querySelector('.sb-vd__meta-row')).toBeNull();
  });

  it('busy without a return date and no card prices: plain status, from-price', async () => {
    renderModal({ ...baseDetail, is_available: false, free_from: null }, 'en');
    await screen.findByText('BMW Z4');
    const status = document.querySelector('.sb-vd__hero .sb-vcard__status')!;
    expect(status.textContent).toBe('Busy');
    expect(status.className).toBe('sb-vcard__status');
    expect(document.querySelector('.sb-vd__hero .sb-vcard__range')?.textContent).toBe('from 5\u00a0000 ฿/day');
    expect(document.querySelector('.sb-vd__hero .sb-vcard__tiles')).toBeNull();
  });

  it('tabs switch panels (click and arrows)', async () => {
    renderModal({ ...fullDetail, engine_volume_l: '2.0' }, 'en');
    await screen.findByText('BMW Z4');
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.map((x) => x.textContent)).toEqual(['About', 'All prices', 'Specs']);
    // First tab selected, roving tabindex, panel wired to its tab.
    expect(tabs.map((x) => x.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map((x) => x.tabIndex)).toEqual([0, -1, -1]);
    const panel = () => screen.getByRole('tabpanel');
    expect(panel().getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panel().id);
    expect(within(panel()).getByText('CarPlay')).toBeTruthy();

    fireEvent.click(tabs[2]);
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(within(panel()).getByText('Fuel')).toBeTruthy();

    // Arrows: right wraps to the first tab, left goes back to the last; focus follows.
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[0]);
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2], { key: 'Home' });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tabs[2], { key: 'ArrowLeft' });
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(within(panel()).getByRole('table')).toBeTruthy();
    // Only one panel is visible at a time.
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('tab labels in Russian', async () => {
    renderModal({ ...fullDetail, engine_volume_l: '2.0' }, 'ru');
    await screen.findByText('BMW Z4');
    expect(within(screen.getByRole('tablist')).getAllByRole('tab').map((x) => x.textContent)).toEqual([
      'Об авто',
      'Все цены',
      'Параметры',
    ]);
  });

  it('about tab has advantages, equipment, deposit', async () => {
    renderModal(fullDetail, 'ru');
    await screen.findByText('BMW Z4');
    const panel = screen.getByRole('tabpanel');
    const adv = Array.from(panel.querySelectorAll('.sb-vd__adv li'));
    expect(adv.map((li) => li.textContent)).toEqual(['Запас хода 430 км', 'Просторный салон']);
    expect(adv[0].querySelector('svg')).not.toBeNull(); // gold check
    expect(within(panel).getByText('Комплектация')).toBeTruthy();
    expect(Array.from(panel.querySelectorAll('.sb-vd__chip')).map((c) => c.textContent)).toEqual([
      'CarPlay',
      'Панорамная крыша',
    ]);
    expect(within(panel).getByText('Депозит')).toBeTruthy();
    expect(Array.from(panel.querySelectorAll('.sb-vd__deposit-pill')).map((c) => c.textContent)).toEqual([
      `10${NB}000${NB}฿`,
      `300${NB}USD`,
    ]);
  });

  it('share copied shows plate above the button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderModal(fullDetail, 'en');
    await screen.findByText('BMW Z4');
    const cta = document.querySelector('.sb-vd__cta')!;
    const share = within(cta as HTMLElement).getByRole('button', { name: 'Share' });
    const status = within(cta as HTMLElement).getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('');

    vi.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(share);
      });
      expect(writeText.mock.calls[0][0]).toContain('vehicle=v1');
      expect(status.textContent).toBe('Link copied');
      expect(cta.querySelector('.sb-vd__toast.is-shown')).not.toBeNull();
      expect(share.classList.contains('is-done')).toBe(true);
      act(() => vi.advanceTimersByTime(2000));
      expect(cta.querySelector('.sb-vd__toast.is-shown')).toBeNull();
      expect(share.classList.contains('is-done')).toBe(false);
      act(() => vi.advanceTimersByTime(220));
      expect(status.textContent).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('VehicleBookingModal — «Стоимость» block and booking buttons', () => {
  // Same two-unit model as the availability tests; "today" is 9 Oct 2026.
  const UNITS = [
    { vehicle_id: 'v1', busy: [{ start: '2026-11-01', end: '2026-11-09' }] },
    { vehicle_id: 'v2', busy: [{ start: '2026-10-25', end: '2026-11-03' }] },
  ];
  const accDetail = {
    ...baseDetail,
    accessories: [
      {
        id: 'cat-1', name_ru: 'Шлемы', name_en: 'Helmets', photo_url: null,
        items: [
          {
            id: 'acc-1', name_ru: 'Шлем Shark', name_en: 'Shark helmet', photo_url: null, photo_full_url: null,
            description: '', price: 100, price_unit: 'per_day', stock: null, available_stock: null,
          },
        ],
      },
    ],
  };
  const quote = (total: string, extra: Record<string, unknown> = {}) => ({
    total_days: 4,
    rental: { total, lines: [{ days: 4, rate_per_day: String(Number(total) / 4), amount: total }] },
    accessories: [],
    total,
    ...extra,
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T05:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  type QuoteReply = () => Promise<Response>;
  function stubApi(reply: QuoteReply) {
    const quotes: Record<string, unknown>[] = [];
    const json = (body: unknown, status = 200) =>
      Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/catalog/availability/')) return json({ today: '2026-10-09', units: UNITS });
        if (u.includes('/catalog/price-quote/')) {
          quotes.push(JSON.parse(init?.body as string));
          return reply();
        }
        return json(accDetail);
      }),
    );
    return quotes;
  }
  const ok = (body: unknown) => () =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }));

  async function openChoice(locale: 'ru' | 'en' = 'en') {
    render(
      <VehicleBookingModal
        vehicle={vehicle}
        apiBase=""
        locale={locale}
        botUsername="test_bot"
        unitIds={['v1', 'v2']}
        onClose={vi.fn()}
      />,
    );
    await screen.findByText('BMW Z4');
    fireEvent.click(screen.getByText(locale === 'ru' ? 'Забронировать' : 'Book'));
    await screen.findByText(locale === 'ru' ? 'Как забронировать?' : 'How to book?');
    await waitFor(() => expect(document.querySelector('.sb-avcal__day.is-busy')).not.toBeNull());
  }
  const sum = () => document.querySelector('.sb-vd__sum');
  const totalText = () => document.querySelector('[data-sum="total"] .sb-vd__sum-value')?.textContent;
  const settle = () => new Promise((r) => setTimeout(r, 450));

  it('requests price-quote for the covering unit with accessories', async () => {
    const quotes = stubApi(ok(quote('4000.00', { accessories: [{ accessory_id: 'acc-1', quantity: 1, amount: '300.00' }], total: '4300.00' })));
    await openChoice();
    fireEvent.click(screen.getByLabelText('+'));
    // v1 is busy 1–9 Nov → the period goes to v2.
    pickDay('2026-11-05');
    pickDay('2026-11-08');
    await waitFor(() => expect(totalText()).toBe('4\u00a0300\u00a0฿'));
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toEqual({
      vehicle_id: 'v2',
      start_date: '2026-11-05',
      end_date: '2026-11-08',
      accessories: [{ accessory_id: 'acc-1', quantity: 1 }],
    });
    expect(screen.getByText('Shark helmet × 1')).toBeTruthy();
    // The block sits between the delivery section and the booking buttons.
    const block = sum()!;
    expect(block.previousElementSibling?.classList.contains('sb-vd__addr-section')).toBe(true);
    expect(block.nextElementSibling?.classList.contains('sb-vd__book-actions')).toBe(true);
  });

  it('no price block without dates', async () => {
    const quotes = stubApi(ok(quote('4000.00')));
    await openChoice();
    await settle();
    expect(quotes).toHaveLength(0);
    expect(sum()).toBeNull();
  });

  it('no price block when dates conflict', async () => {
    const quotes = stubApi(ok(quote('4000.00')));
    await openChoice();
    pickDay('2026-11-01');
    pickDay('2026-11-05');
    await screen.findByText("We'll find a replacement for these dates");
    await settle();
    expect(quotes).toHaveLength(0);
    expect(sum()).toBeNull();
  });

  it('no price block when rental is null', async () => {
    const quotes = stubApi(ok({ total_days: 3, rental: null, accessories: [], total: null }));
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-24');
    await waitFor(() => expect(quotes).toHaveLength(1));
    await settle();
    expect(sum()).toBeNull();
  });

  it('no price block on quote error', async () => {
    const quotes = stubApi(() => Promise.resolve(new Response('', { status: 500 })));
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-24');
    await waitFor(() => expect(quotes).toHaveLength(1));
    await settle();
    expect(sum()).toBeNull();
    expect(document.querySelector('.sb-form__status--err')).toBeNull();
  });

  it('stale quote response is ignored', async () => {
    const pending: ((r: Response) => void)[] = [];
    const quotes = stubApi(() => new Promise<Response>((resolve) => pending.push(resolve)));
    const reply = (body: unknown) =>
      new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-24');
    await waitFor(() => expect(quotes).toHaveLength(1));
    // A newer selection while the first answer is still in flight.
    fireEvent.click(screen.getByLabelText('+'));
    await waitFor(() => expect(quotes).toHaveLength(2));
    pending[1](reply(quote('3000.00', { total: '3300.00' })));
    await waitFor(() => expect(totalText()).toBe('3\u00a0300\u00a0฿'));
    pending[0](reply(quote('9000.00')));
    await settle();
    expect(totalText()).toBe('3\u00a0300\u00a0฿');
  });

  it('old total is dimmed while the new selection is being priced', async () => {
    const pending: ((r: Response) => void)[] = [];
    const quotes = stubApi(() => new Promise<Response>((resolve) => pending.push(resolve)));
    const reply = (body: unknown) =>
      new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-24');
    await waitFor(() => expect(quotes).toHaveLength(1));
    pending[0](reply(quote('3000.00')));
    await waitFor(() => expect(totalText()).toBe('3\u00a0000\u00a0฿'));
    expect(document.querySelector('.sb-vd__sum')!.classList.contains('is-stale')).toBe(false);
    fireEvent.click(screen.getByLabelText('+'));
    // Before the new answer: the previous sums stay, but dimmed and busy.
    expect(document.querySelector('.sb-vd__sum')!.classList.contains('is-stale')).toBe(true);
    await waitFor(() => expect(quotes).toHaveLength(2));
    pending[1](reply(quote('3000.00', { total: '3300.00' })));
    await waitFor(() => expect(totalText()).toBe('3\u00a0300\u00a0฿'));
    expect(document.querySelector('.sb-vd__sum')!.classList.contains('is-stale')).toBe(false);
  });

  it('booking buttons texts (ru/en)', async () => {
    stubApi(ok(quote('4000.00')));
    await openChoice();
    const tg = document.querySelector('.sb-vd__tg-card')!;
    const manual = document.querySelector('.sb-vd__option-card')!;
    expect(tg.querySelector('.sb-vd__tg-title')?.textContent).toBe('1-click booking');
    expect(tg.querySelector('.sb-vd__tg-sub')?.textContent).toBe('via Telegram, no forms');
    expect(manual.querySelector('.sb-vd__tg-title')?.textContent).toBe('Book manually');
    expect(manual.querySelector('.sb-vd__tg-sub')?.textContent).toBe('fill in the form');
    // Real Telegram glyph and the "form with a pen" icon instead of ✈ / ✎; «›» on both.
    expect(document.querySelector('.sb-vd__tg-icon svg.sb-ico')).not.toBeNull();
    expect(document.querySelector('.sb-vd__option-icon svg')).not.toBeNull();
    expect(document.querySelector('.sb-vd__tg-icon')!.textContent).toBe('');
    expect(document.querySelector('.sb-vd__option-icon')!.textContent).toBe('');
    expect(tg.querySelector('.sb-vd__tg-arrow')?.textContent?.trim()).toBe('›');
    expect(manual.querySelector('.sb-vd__tg-arrow')?.textContent?.trim()).toBe('›');
    cleanup();
    stubApi(ok(quote('4000.00')));
    await openChoice('ru');
    expect(screen.getByText('Бронь в 1 клик')).toBeTruthy();
    expect(screen.getByText('через Telegram, без форм')).toBeTruthy();
    expect(screen.getByText('Бронь вручную')).toBeTruthy();
    expect(screen.getByText('заполните форму')).toBeTruthy();
    expect(screen.getByText('или')).toBeTruthy();
  });

  it('desktop actions in one row', async () => {
    stubApi(ok(quote('4000.00')));
    await openChoice();
    // One row container holds exactly: Telegram · «or» · manual (CSS: a column
    // on the phone, a 1fr auto 1fr grid on the computer).
    const row = document.querySelector('.sb-vd__book-actions > .sb-vd__book-row')!;
    expect(Array.from(row.children).map((el) => el.className)).toEqual([
      'sb-vd__tg-card',
      'sb-vd__or',
      'sb-vd__option-card',
    ]);
    expect(row.children[1].textContent).toBe('or');
  });

  it('form shows price summary', async () => {
    stubApi(ok(quote('4000.00', { accessories: [{ accessory_id: 'acc-1', quantity: 1, amount: '300.00' }], total: '4300.00' })));
    await openChoice();
    fireEvent.click(screen.getByLabelText('+'));
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await waitFor(() => expect(totalText()).toBe('4\u00a0300\u00a0฿'));
    fireEvent.click(screen.getByText('Book manually'));
    await screen.findByText('Send request');
    // Cover strip with the vehicle, no per-day price; the window «×» is on it.
    const head = document.querySelector('.sb-modal__body--book > .sb-stephead')!;
    expect(within(head as HTMLElement).getByRole('heading', { name: 'BMW Z4' })).toBeTruthy();
    expect(head.querySelector('.sb-vcard__range')).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(1);
    // Dates line and the same «Стоимость» block (same quote, no new request).
    expect(document.querySelector('.sb-vd__datesline')?.textContent).toBe('21 Oct → 25 Oct · 4 days');
    expect(totalText()).toBe('4\u00a0300\u00a0฿');
    expect(screen.getByText('Shark helmet × 1')).toBeTruthy();
    expect(screen.getByText('Your details')).toBeTruthy();
    // Name and WhatsApp share one row container (side by side on the computer).
    const you = document.querySelector('.sb-vd__you-row')!;
    expect(within(you as HTMLElement).getByLabelText('Your name')).toBeTruthy();
    expect(within(you as HTMLElement).getByLabelText('WhatsApp number')).toBeTruthy();
  });

  it('success shows total from the same quote', async () => {
    const quotes = stubApi(ok(quote('4000.00', { accessories: [{ accessory_id: 'acc-1', quantity: 1, amount: '300.00' }], total: '4300.00' })));
    await openChoice();
    fireEvent.click(screen.getByLabelText('+'));
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await waitFor(() => expect(totalText()).toBe('4\u00a0300\u00a0฿'));
    const shown = totalText();
    fireEvent.click(screen.getByText('Book manually'));
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
    fireEvent.click(screen.getByText('Send request'));
    await screen.findByText('Request sent!');
    const recap = document.querySelector('.sb-vd__recap')!;
    expect(recap.querySelector('.sb-vd__recap-main b')?.textContent).toBe('BMW Z4');
    expect(recap.querySelector('.sb-vd__recap-main span')?.textContent).toBe('21 Oct → 25 Oct · 4 days');
    expect(recap.querySelector('.sb-vd__recap-total small')?.textContent).toBe('Total');
    expect(recap.querySelector('.sb-vd__recap-total b')?.textContent).toBe(shown);
    expect(document.querySelector('.sb-modal__check svg')).not.toBeNull();
    expect(quotes).toHaveLength(1);
  });

  it('success without quote has no total', async () => {
    stubApi(() => Promise.resolve(new Response('', { status: 500 })));
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await settle();
    expect(sum()).toBeNull();
    fireEvent.click(screen.getByText('Book manually'));
    expect(sum()).toBeNull();
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
    fireEvent.click(screen.getByText('Send request'));
    await screen.findByText('Request sent!');
    const recap = document.querySelector('.sb-vd__recap')!;
    expect(recap.querySelector('.sb-vd__recap-main b')?.textContent).toBe('BMW Z4');
    expect(recap.querySelector('.sb-vd__recap-total')).toBeNull();
    expect(recap.textContent).not.toContain('Total');
  });

  /** A fuller API for the success snapshot: the quote follows the selection
   *  (accessory → +300), the booking request and the intent status are held
   *  until the test lets them go. */
  function stubSendApi() {
    const calls = { request: [] as Record<string, unknown>[], intent: [] as Record<string, unknown>[], status: 0 };
    let releaseRequest!: () => void;
    const requestGate = new Promise<void>((r) => {
      releaseRequest = r;
    });
    const state = { used: false };
    const json = (body: unknown, status = 200) =>
      Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('open', vi.fn(() => ({ location: { href: '' }, close: vi.fn() })));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const u = String(url);
        if (u.includes('/catalog/availability/')) return json({ today: '2026-10-09', units: UNITS });
        if (u.includes('/catalog/price-quote/')) {
          const body = JSON.parse(init?.body as string) as { accessories?: { quantity: number }[] };
          const qty = (body.accessories ?? []).reduce((n, a) => n + a.quantity, 0);
          return json(
            quote('4000.00', {
              accessories: qty ? [{ accessory_id: 'acc-1', quantity: qty, amount: `${qty * 300}.00` }] : [],
              total: `${4000 + qty * 300}.00`,
            }),
          );
        }
        if (u.includes('/booking-requests/')) {
          calls.request.push(JSON.parse(init?.body as string));
          return requestGate.then(() => json({ success: true, booking_id: 'b1', dates_busy: false }, 201));
        }
        if (u.includes('/status/')) {
          calls.status += 1;
          return json({ status: state.used ? 'used' : 'pending' });
        }
        if (u.includes('/booking-intents/')) {
          calls.intent.push(JSON.parse(init?.body as string));
          return json({ token: 'tok123' }, 201);
        }
        return json(accDetail);
      }),
    );
    return { calls, releaseRequest, state };
  }
  const recapTotal = () => document.querySelector('.sb-vd__recap .sb-vd__recap-total');
  const recapPeriod = () => document.querySelector('.sb-vd__recap .sb-vd__recap-main span')?.textContent;

  it('1-click: the selection changes while the bot works → success without a total, with the SENT dates', async () => {
    const { calls, state } = stubSendApi();
    await openChoice();
    fireEvent.click(screen.getByLabelText('+'));
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await waitFor(() => expect(totalText()).toBe('4\u00a0300\u00a0฿'));
    fireEvent.click(screen.getByText('1-click booking'));
    await waitFor(() => expect(calls.intent).toHaveLength(1));
    await waitFor(() => expect(calls.status).toBeGreaterThan(0));
    // The customer keeps playing with the window: another accessory, other dates.
    fireEvent.click(screen.getByLabelText('+'));
    pickDay('2026-10-27');
    pickDay('2026-10-29');
    await waitFor(() => expect(totalText()).toBe('4\u00a0600\u00a0฿'));
    state.used = true;
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await screen.findByText('Request sent!');
    // The bot may drop an unavailable accessory — no «Итого» on this path.
    expect(recapTotal()).toBeNull();
    expect(recapPeriod()).toBe('21 Oct → 25 Oct · 4 days');
    expect(calls.intent[0]).toMatchObject({ start_date: '2026-10-21', end_date: '2026-10-25' });
  });

  it('manual: the selection changes while the request is on its way → success with the SENT total and dates', async () => {
    const { calls, releaseRequest } = stubSendApi();
    await openChoice();
    fireEvent.click(screen.getByLabelText('+'));
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await waitFor(() => expect(totalText()).toBe('4\u00a0300\u00a0฿'));
    fireEvent.click(screen.getByText('Book manually'));
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
    fireEvent.click(screen.getByText('Send request'));
    await waitFor(() => expect(calls.request).toHaveLength(1));
    // Back to the choice step mid-flight: drop the accessory, pick other dates.
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await screen.findByText('How to book?');
    fireEvent.click(screen.getByLabelText('-'));
    pickDay('2026-10-27');
    pickDay('2026-10-29');
    await waitFor(() => expect(totalText()).toBe('4\u00a0000\u00a0฿'));
    await act(async () => {
      releaseRequest();
    });
    await screen.findByText('Request sent!');
    expect(recapTotal()?.querySelector('b')?.textContent).toBe('4\u00a0300\u00a0฿');
    expect(recapPeriod()).toBe('21 Oct → 25 Oct · 4 days');
    expect(calls.request[0]).toMatchObject({ start_date: '2026-10-21', end_date: '2026-10-25' });
  });

  it('success has no total when the «Стоимость» block was hidden (an accessory without a name)', async () => {
    // The quote prices an accessory the detail does not list → no block → no total.
    stubApi(ok(quote('4000.00', { accessories: [{ accessory_id: 'acc-x', quantity: 1, amount: '300.00' }], total: '4300.00' })));
    const base = globalThis.fetch as unknown as (u: string, i?: RequestInit) => Promise<Response>;
    vi.stubGlobal(
      'fetch',
      vi.fn((u: string, i?: RequestInit) =>
        String(u).includes('/booking-requests/')
          ? Promise.resolve(new Response(JSON.stringify({ success: true, dates_busy: false }), { status: 201 }))
          : base(u, i),
      ),
    );
    await openChoice();
    pickDay('2026-10-21');
    pickDay('2026-10-25');
    await settle();
    expect(sum()).toBeNull();
    fireEvent.click(screen.getByText('Book manually'));
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
    fireEvent.click(screen.getByText('Send request'));
    await screen.findByText('Request sent!');
    expect(recapTotal()).toBeNull();
    expect(recapPeriod()).toBe('21 Oct → 25 Oct · 4 days');
  });

  it('«Enter address» on the form is inert while the request is on its way', async () => {
    stubApi(ok(quote('4000.00')));
    const base = globalThis.fetch as unknown as (u: string, i?: RequestInit) => Promise<Response>;
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((u: string, i?: RequestInit) =>
        String(u).includes('/booking-requests/')
          ? gate.then(() => new Response(JSON.stringify({ success: true, dates_busy: false }), { status: 201 }))
          : base(u, i),
      ),
    );
    class FakeSessionToken {}
    window.google = {
      maps: {
        importLibrary: vi.fn(() =>
          Promise.resolve({
            AutocompleteSuggestion: { fetchAutocompleteSuggestions: vi.fn() },
            AutocompleteSessionToken: FakeSessionToken,
          }),
        ),
      },
    } as unknown as typeof window.google;
    try {
      render(
        <VehicleBookingModal
          vehicle={vehicle}
          apiBase=""
          locale="en"
          botUsername="test_bot"
          googleMapsApiKey="test-key"
          unitIds={['v1', 'v2']}
          onClose={vi.fn()}
        />,
      );
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByText('Book'));
      await screen.findByText('How to book?');
      await waitFor(() => expect(document.querySelector('.sb-avcal__day.is-busy')).not.toBeNull());
      fireEvent.click(screen.getByText('Deliver the vehicle to my address'));
      pickDay('2026-10-21');
      pickDay('2026-10-25');
      await waitFor(() => expect(totalText()).toBe('4\u00a0000\u00a0฿'));
      fireEvent.click(screen.getByText('Book manually'));
      fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('WhatsApp number'), { target: { value: '+66812345678' } });
      fireEvent.click(screen.getByText('Send request'));
      const ask = await waitFor(() => {
        const b = screen.getByRole('button', { name: 'Enter address' }) as HTMLButtonElement;
        expect(b.disabled).toBe(true);
        return b;
      });
      // Even a forced click does not leave the form.
      ask.disabled = false;
      fireEvent.click(ask);
      expect(screen.getByText('Sending…')).toBeTruthy();
      expect(screen.queryByText('How to book?')).toBeNull();
      await act(async () => {
        release();
      });
      await screen.findByText('Request sent!');
    } finally {
      delete (window as { google?: unknown }).google;
    }
  });

  it('ask address on form returns to choice and focuses address', async () => {
    stubApi(ok(quote('4000.00')));
    const scrollIntoView = vi.fn();
    const origScroll = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    class FakeSessionToken {}
    window.google = {
      maps: {
        importLibrary: vi.fn(() =>
          Promise.resolve({
            AutocompleteSuggestion: { fetchAutocompleteSuggestions: vi.fn() },
            AutocompleteSessionToken: FakeSessionToken,
          }),
        ),
      },
    } as unknown as typeof window.google;
    try {
      render(
        <VehicleBookingModal
          vehicle={vehicle}
          apiBase=""
          locale="en"
          botUsername="test_bot"
          googleMapsApiKey="test-key"
          unitIds={['v1', 'v2']}
          onClose={vi.fn()}
        />,
      );
      await screen.findByText('BMW Z4');
      fireEvent.click(screen.getByText('Book'));
      await screen.findByText('How to book?');
      await waitFor(() => expect(document.querySelector('.sb-avcal__day.is-busy')).not.toBeNull());
      fireEvent.click(screen.getByText('Deliver the vehicle to my address'));
      pickDay('2026-10-21');
      pickDay('2026-10-25');
      await waitFor(() => expect(totalText()).toBe('4\u00a0000\u00a0฿'));
      fireEvent.click(screen.getByText('Book manually'));
      await screen.findByText('Send request');

      fireEvent.click(screen.getByRole('button', { name: 'Enter address' }));
      await screen.findByText('How to book?');
      expect(screen.queryByText('Send request')).toBeNull();
      const input = screen.getByTestId('delivery-address-input') as HTMLInputElement;
      await waitFor(() => expect(document.activeElement).toBe(input));
      expect(input.classList.contains('is-attention')).toBe(true);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' });
    } finally {
      HTMLElement.prototype.scrollIntoView = origScroll;
      delete (window as { google?: unknown }).google;
    }
  });
});
