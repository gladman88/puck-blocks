import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { DeliveryAddressPicker } from './DeliveryAddressPicker';

const strings = {
  unavailable: 'Address search is temporarily unavailable',
  loading: 'Loading…',
  searchPlaceholder: 'Enter an address or place name',
  showMap: 'Pick on the map',
  hideMap: 'Hide map',
  mapHint: 'Tap a place or a point on the map',
};

afterEach(() => {
  cleanup();
  delete window.google;
});

// A fully-mocked Places lib for the search-and-select path.
function stubPlacesLib(opts: {
  place: {
    location: { lat: () => number; lng: () => number } | null;
    formattedAddress?: string;
    displayName?: string;
    id?: string;
  };
  predictionMain?: string;
  predictionSub?: string;
}) {
  const fakePlace = { ...opts.place, fetchFields: vi.fn().mockResolvedValue(undefined) };
  const prediction = {
    toPlace: () => fakePlace,
    text: { text: opts.predictionMain ?? '', toString: () => opts.predictionMain ?? '' },
    mainText: { text: opts.predictionMain ?? '' },
    secondaryText: opts.predictionSub ? { text: opts.predictionSub } : undefined,
  };
  const AutocompleteSuggestion = {
    fetchAutocompleteSuggestions: vi
      .fn()
      .mockResolvedValue({ suggestions: [{ placePrediction: prediction }] }),
  };
  class FakeSessionToken {}
  window.google = {
    maps: {
      importLibrary: vi.fn((name: string) =>
        name === 'places'
          ? Promise.resolve({ AutocompleteSuggestion, AutocompleteSessionToken: FakeSessionToken })
          : Promise.resolve({}),
      ),
    },
  } as unknown as typeof window.google;
  return { AutocompleteSuggestion };
}

describe('DeliveryAddressPicker (puck-blocks)', () => {
  it('shows the unavailable message (and a disabled field) when no API key is configured', () => {
    render(<DeliveryAddressPicker apiKey={undefined} value={null} onSelect={vi.fn()} strings={strings} />);
    expect(screen.getByText(strings.unavailable)).toBeTruthy();
    expect((screen.getByTestId('delivery-address-input') as HTMLInputElement).disabled).toBe(true);
  });

  it('shows a picked location IN the input, leading with the place name (a captured POI reads as the place)', () => {
    render(
      <DeliveryAddressPicker
        apiKey={undefined}
        value={{ address: '123 Bang Tao Rd, Phuket', lat: 7.9, lng: 98.3, name: 'Banyan Tree' }}
        onSelect={vi.fn()}
        strings={strings}
      />,
    );
    expect((screen.getByTestId('delivery-address-input') as HTMLInputElement).value).toBe('Banyan Tree');
  });

  it('shows a plain (nameless) picked address in the input', () => {
    render(
      <DeliveryAddressPicker
        apiKey={undefined}
        value={{ address: '7.820000, 98.300000', lat: 7.82, lng: 98.3 }}
        onSelect={vi.fn()}
        strings={strings}
      />,
    );
    expect((screen.getByTestId('delivery-address-input') as HTMLInputElement).value).toBe('7.820000, 98.300000');
  });

  it('shows an error state when the Google Maps bootstrap loader is missing', async () => {
    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={vi.fn()} strings={strings} />);
    await waitFor(() => expect(screen.getByText(strings.unavailable)).toBeTruthy());
  });

  it('typing fetches autocomplete suggestions; picking one resolves the place through onSelect', async () => {
    const onSelect = vi.fn();
    stubPlacesLib({
      place: {
        location: { lat: () => 7.9, lng: () => 98.29 },
        formattedAddress: 'Patong Beach Road, Phuket',
        displayName: 'Patong Beach',
        id: 'place-1',
      },
      predictionMain: 'Patong Beach',
      predictionSub: 'Phuket, Thailand',
    });

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);
    const input = screen.getByTestId('delivery-address-input') as HTMLInputElement;
    await waitFor(() => expect(input.disabled).toBe(false)); // Places lib ready

    fireEvent.change(input, { target: { value: 'Patong' } });
    const option = await screen.findByText('Patong Beach', {}, { timeout: 2000 });
    expect(screen.getByText('Phuket, Thailand')).toBeTruthy(); // secondary line
    fireEvent.click(option);

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        address: 'Patong Beach Road, Phuket',
        lat: 7.9,
        lng: 98.29,
        place_id: 'place-1',
        name: 'Patong Beach',
      }),
    );
  });

  it('tapping a POI on the map captures the place itself (name + canonical location), not a nearby street', async () => {
    const onSelect = vi.fn();
    class FakeSessionToken {}
    const AutocompleteSuggestion = { fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({ suggestions: [] }) };
    class FakePlace {
      location = { lat: () => 7.9, lng: () => 98.3 };
      formattedAddress = 'Banyan Tree, Bang Tao, Phuket';
      displayName = 'Banyan Tree';
      id = 'poi-1';
      constructor(_opts: { id: string }) {}
      fetchFields() {
        return Promise.resolve();
      }
    }
    let mapClickHandler: ((e: { placeId?: string; latLng?: { lat: () => number; lng: () => number }; stop?: () => void }) => void) | null = null;
    class FakeMap {
      panTo() {}
      setZoom() {}
      addListener(_e: string, handler: typeof mapClickHandler) {
        mapClickHandler = handler;
      }
    }
    class FakeMarker {
      setPosition() {}
      setMap() {}
    }
    window.google = {
      maps: {
        importLibrary: vi.fn((name: string) => {
          if (name === 'places')
            return Promise.resolve({ AutocompleteSuggestion, AutocompleteSessionToken: FakeSessionToken, Place: FakePlace });
          if (name === 'marker') return Promise.resolve({ Marker: FakeMarker });
          if (name === 'geocoding') return Promise.resolve({});
          return Promise.resolve({ Map: FakeMap });
        }),
      },
    } as unknown as typeof window.google;

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);
    fireEvent.click(await screen.findByText(/Pick on the map/));
    await screen.findByTestId('delivery-address-map');
    await waitFor(() => expect(mapClickHandler).not.toBeNull());

    const stop = vi.fn();
    mapClickHandler!({ placeId: 'poi-1', latLng: { lat: () => 7.82, lng: () => 98.29 }, stop });

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        address: 'Banyan Tree, Bang Tao, Phuket',
        lat: 7.9,
        lng: 98.3,
        place_id: 'poi-1',
        name: 'Banyan Tree',
      }),
    );
    expect(stop).toHaveBeenCalled();
  });

  it('reverse-geocodes an empty-map tap; falls back to raw coordinates without the Geocoder', async () => {
    const onSelect = vi.fn();
    class FakeSessionToken {}
    const AutocompleteSuggestion = { fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({ suggestions: [] }) };
    let mapClickHandler: ((e: { placeId?: string; latLng?: { lat: () => number; lng: () => number } }) => void) | null = null;
    class FakeMap {
      panTo() {}
      setZoom() {}
      addListener(_e: string, handler: typeof mapClickHandler) {
        mapClickHandler = handler;
      }
    }
    class FakeMarker {
      setPosition() {}
      setMap() {}
    }
    window.google = {
      maps: {
        importLibrary: vi.fn((name: string) => {
          if (name === 'places') return Promise.resolve({ AutocompleteSuggestion, AutocompleteSessionToken: FakeSessionToken });
          if (name === 'marker') return Promise.resolve({ Marker: FakeMarker });
          if (name === 'geocoding') return Promise.resolve({}); // no Geocoder → raw-coord fallback
          return Promise.resolve({ Map: FakeMap });
        }),
      },
    } as unknown as typeof window.google;

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);
    fireEvent.click(await screen.findByText(/Pick on the map/));
    await screen.findByTestId('delivery-address-map');
    await waitFor(() => expect(mapClickHandler).not.toBeNull());
    mapClickHandler!({ latLng: { lat: () => 7.82, lng: () => 98.3 } });

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ address: '7.820000, 98.300000', lat: 7.82, lng: 98.3 }),
    );
  });
});
