import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DeliveryAddressSection } from './DeliveryAddressSection';
import type { PickedLocation } from './DeliveryAddressPicker';

afterEach(() => cleanup());

const strings = {
  title: 'Delivery',
  pickupToggle: 'Deliver the vehicle to my address',
  dropoffToggle: "We'll pick it up from my address",
  unavailable: 'Address search is temporarily unavailable',
  loading: 'Loading…',
};

interface SectionProps {
  apiKey?: string;
  pickupEnabled: boolean;
  dropoffEnabled: boolean;
  pickupLocation: PickedLocation | null;
  dropoffLocation: PickedLocation | null;
  onPickupToggle: (enabled: boolean) => void;
  onDropoffToggle: (enabled: boolean) => void;
  onPickupSelect: (location: PickedLocation) => void;
  onDropoffSelect: (location: PickedLocation) => void;
}

function renderSection(overrides: Partial<SectionProps> = {}) {
  return render(
    <DeliveryAddressSection
      apiKey={undefined}
      pickupEnabled={false}
      dropoffEnabled={false}
      pickupLocation={null}
      dropoffLocation={null}
      onPickupToggle={vi.fn()}
      onDropoffToggle={vi.fn()}
      onPickupSelect={vi.fn()}
      onDropoffSelect={vi.fn()}
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

  it('shows the picked address once a location is selected', () => {
    renderSection({
      pickupEnabled: true,
      pickupLocation: { address: 'Patong Beach Road', lat: 7.9, lng: 98.29 },
    });
    expect(screen.getByText('Patong Beach Road')).toBeTruthy();
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
});
