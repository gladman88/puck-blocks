import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { DeliveryAddressPicker } from './DeliveryAddressPicker';

const unavailableText = 'Address search is temporarily unavailable';
const loadingText = 'Loading…';

afterEach(() => {
  cleanup();
  delete window.google;
});

describe('DeliveryAddressPicker (puck-blocks)', () => {
  it('shows the unavailable message when no API key is configured', () => {
    render(<DeliveryAddressPicker apiKey={undefined} onSelect={vi.fn()} unavailableText={unavailableText} loadingText={loadingText} />);
    expect(screen.getByText(unavailableText)).toBeTruthy();
  });

  it('shows an error state when the Google Maps bootstrap loader is missing', async () => {
    render(<DeliveryAddressPicker apiKey="test-key" onSelect={vi.fn()} unavailableText={unavailableText} loadingText={loadingText} />);
    await waitFor(() => {
      expect(screen.getByText(unavailableText)).toBeTruthy();
    });
  });

  it('appends the PlaceAutocompleteElement and forwards a selection through onSelect', async () => {
    const onSelect = vi.fn();

    // A class whose constructor returns a REAL DOM node (a plain `class`
    // extending HTMLElement can't be `new`'d outside customElements.define
    // in jsdom) so the component's real `containerRef.current.appendChild`
    // succeeds exactly like it would with the genuine web component.
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

    render(<DeliveryAddressPicker apiKey="test-key" onSelect={onSelect} unavailableText={unavailableText} loadingText={loadingText} />);

    const fakeElement = await waitFor(() => {
      const container = screen.getByTestId('delivery-address-picker-container');
      const el = container.firstElementChild;
      expect(el).not.toBeNull();
      return el as HTMLDivElement;
    });

    const fakePlace = {
      formattedAddress: 'Patong Beach Road',
      displayName: 'Patong',
      id: 'place-123',
      location: { lat: () => 7.9, lng: () => 98.29 },
      fetchFields: vi.fn().mockResolvedValue(undefined),
    };
    const event = new Event('gmp-select') as Event & { placePrediction: unknown };
    event.placePrediction = { toPlace: () => fakePlace };
    fakeElement.dispatchEvent(event);

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        address: 'Patong Beach Road',
        lat: 7.9,
        lng: 98.29,
        place_id: 'place-123',
        name: 'Patong',
      }),
    );
  });
});
