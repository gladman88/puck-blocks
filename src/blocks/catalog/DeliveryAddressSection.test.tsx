import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DeliveryAddressSection, type DeliveryAddressStrings } from './DeliveryAddressSection';
import type { PickedLocation } from './DeliveryAddressPicker';

afterEach(() => cleanup());

const strings: DeliveryAddressStrings = {
  title: 'Delivery',
  pickupToggle: 'Deliver the vehicle to my address',
  dropoffToggle: "We'll pick it up from my address",
  unavailable: 'Address search is temporarily unavailable',
  loading: 'Loading…',
  searchPlaceholder: 'Enter an address or place name',
  showMap: 'Pick on the map',
  hideMap: 'Hide map',
  mapHint: 'Tap the map to choose a point',
  sameAsPickup: 'Same address as delivery',
};

interface SectionProps {
  apiKey?: string;
  pickupEnabled: boolean;
  dropoffEnabled: boolean;
  pickupLocation: PickedLocation | null;
  dropoffLocation: PickedLocation | null;
  dropoffSameAsPickup: boolean;
  onPickupToggle: (enabled: boolean) => void;
  onDropoffToggle: (enabled: boolean) => void;
  onPickupSelect: (location: PickedLocation) => void;
  onDropoffSelect: (location: PickedLocation) => void;
  onDropoffSameToggle: (same: boolean) => void;
}

function renderSection(overrides: Partial<SectionProps> = {}) {
  return render(
    <DeliveryAddressSection
      apiKey={undefined}
      pickupEnabled={false}
      dropoffEnabled={false}
      pickupLocation={null}
      dropoffLocation={null}
      dropoffSameAsPickup={false}
      onPickupToggle={vi.fn()}
      onDropoffToggle={vi.fn()}
      onPickupSelect={vi.fn()}
      onDropoffSelect={vi.fn()}
      onDropoffSameToggle={vi.fn()}
      strings={strings}
      {...overrides}
    />,
  );
}

describe('DeliveryAddressSection (puck-blocks)', () => {
  it('renders both toggles off by default, no address picker shown', () => {
    renderSection();
    expect(screen.getByText('Deliver the vehicle to my address')).toBeTruthy();
    expect(screen.getByText("We'll pick it up from my address")).toBeTruthy();
    expect(screen.queryByText('Address search is temporarily unavailable')).toBeNull();
  });

  it('toggling pickup on calls onPickupToggle(true)', () => {
    const onPickupToggle = vi.fn();
    renderSection({ onPickupToggle });
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(onPickupToggle).toHaveBeenCalledWith(true);
  });

  it('when enabled with no API key configured, shows the unavailable message', () => {
    renderSection({ pickupEnabled: true });
    expect(screen.getByText('Address search is temporarily unavailable')).toBeTruthy();
  });

  it('shows the picked address in the search input', () => {
    renderSection({
      pickupEnabled: true,
      pickupLocation: { address: 'Patong Beach Road', lat: 7.9, lng: 98.29 },
    });
    expect(screen.getByDisplayValue('Patong Beach Road')).toBeTruthy();
  });

  it('dropoff toggle is independent of pickup toggle', () => {
    const onDropoffToggle = vi.fn();
    renderSection({ pickupEnabled: true, onDropoffToggle });
    const switches = screen.getAllByRole('switch');
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
    fireEvent.click(switches[1]);
    expect(onDropoffToggle).toHaveBeenCalledWith(true);
  });

  it('offers "same as delivery" on the collection row only once delivery has a picked address', () => {
    // Delivery on but no address yet → no "same" checkbox.
    const { rerender } = renderSection({ pickupEnabled: true, dropoffEnabled: true });
    expect(screen.queryByText('Same address as delivery')).toBeNull();

    // Delivery address picked → the checkbox appears on the collection row.
    rerender(
      <DeliveryAddressSection
        apiKey={undefined}
        pickupEnabled
        dropoffEnabled
        pickupLocation={{ address: 'Patong Beach Road', lat: 7.9, lng: 98.29 }}
        dropoffLocation={null}
        dropoffSameAsPickup={false}
        onPickupToggle={vi.fn()}
        onDropoffToggle={vi.fn()}
        onPickupSelect={vi.fn()}
        onDropoffSelect={vi.fn()}
        onDropoffSameToggle={vi.fn()}
        strings={strings}
      />,
    );
    expect(screen.getByText('Same address as delivery')).toBeTruthy();
  });

  it('checking "same as delivery" hides the collection picker and fires onDropoffSameToggle', () => {
    const onDropoffSameToggle = vi.fn();
    // Pickup has a picked address (shown as its selected field). same=false →
    // the collection picker is still visible (its "unavailable" message shows).
    const { rerender } = renderSection({
      pickupEnabled: true,
      dropoffEnabled: true,
      pickupLocation: { address: 'Patong Beach Road', lat: 7.9, lng: 98.29 },
      dropoffSameAsPickup: false,
      onDropoffSameToggle,
    });
    expect(screen.getByDisplayValue('Patong Beach Road')).toBeTruthy();       // pickup field
    expect(screen.getAllByTestId('delivery-address-input')).toHaveLength(2);  // pickup + collection pickers

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onDropoffSameToggle).toHaveBeenCalledWith(true);

    // With same=true the collection picker is hidden → only the pickup field remains.
    rerender(
      <DeliveryAddressSection
        apiKey={undefined}
        pickupEnabled
        dropoffEnabled
        pickupLocation={{ address: 'Patong Beach Road', lat: 7.9, lng: 98.29 }}
        dropoffLocation={null}
        dropoffSameAsPickup
        onPickupToggle={vi.fn()}
        onDropoffToggle={vi.fn()}
        onPickupSelect={vi.fn()}
        onDropoffSelect={vi.fn()}
        onDropoffSameToggle={onDropoffSameToggle}
        strings={strings}
      />,
    );
    expect(screen.getAllByTestId('delivery-address-input')).toHaveLength(1);
    expect(screen.getByDisplayValue('Patong Beach Road')).toBeTruthy();  // pickup field still shown
  });
});
