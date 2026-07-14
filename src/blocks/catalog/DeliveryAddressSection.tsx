import { DeliveryAddressPicker, type PickedLocation } from './DeliveryAddressPicker';

export type { PickedLocation };

interface ToggleRowProps {
  label: string;
  enabled: boolean;
  location: PickedLocation | null;
  apiKey: string | undefined;
  onToggle: (enabled: boolean) => void;
  onSelect: (location: PickedLocation) => void;
  unavailableText: string;
  loadingText: string;
}

function ToggleRow({ label, enabled, location, apiKey, onToggle, onSelect, unavailableText, loadingText }: ToggleRowProps) {
  return (
    <div className="sb-vd__addr-row">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`sb-vd__addr-switch ${enabled ? 'is-on' : ''}`}
        onClick={() => onToggle(!enabled)}
      >
        <span className="sb-vd__addr-switch-track">
          <span className="sb-vd__addr-switch-thumb" />
        </span>
        <span className="sb-vd__addr-switch-label">{label}</span>
      </button>
      {enabled ? (
        <div className="sb-vd__addr-picker">
          <DeliveryAddressPicker
            apiKey={apiKey}
            onSelect={onSelect}
            unavailableText={unavailableText}
            loadingText={loadingText}
          />
          {location ? <p className="sb-vd__addr-picked">{location.address}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

interface DeliveryAddressSectionProps {
  apiKey: string | undefined;
  pickupEnabled: boolean;
  dropoffEnabled: boolean;
  pickupLocation: PickedLocation | null;
  dropoffLocation: PickedLocation | null;
  onPickupToggle: (enabled: boolean) => void;
  onDropoffToggle: (enabled: boolean) => void;
  onPickupSelect: (location: PickedLocation) => void;
  onDropoffSelect: (location: PickedLocation) => void;
  strings: {
    title: string;
    pickupToggle: string;
    dropoffToggle: string;
    unavailable: string;
    loading: string;
  };
}

/**
 * Delivery/collection-by-address section (Stage 6, plan §Stage 6) — mirrors
 * frontend_catalog's `DeliveryAddressSection` 1:1, sb-styled for the site/FMS
 * Puck-editor host. "Enabled" (the toggle) and "picked" (the actual address)
 * are kept as SEPARATE state in the parent: flipping a toggle on reveals the
 * picker but submits nothing until a real Places selection lands — so an
 * abandoned toggle can never leak a placeholder `{address:'',lat:0,lng:0}`
 * into the booking-request payload.
 */
export function DeliveryAddressSection({
  apiKey,
  pickupEnabled,
  dropoffEnabled,
  pickupLocation,
  dropoffLocation,
  onPickupToggle,
  onDropoffToggle,
  onPickupSelect,
  onDropoffSelect,
  strings,
}: DeliveryAddressSectionProps) {
  return (
    <div className="sb-vd__addr-section">
      <span className="sb-vd__field-label">{strings.title}</span>
      <ToggleRow
        label={strings.pickupToggle}
        enabled={pickupEnabled}
        location={pickupLocation}
        apiKey={apiKey}
        onToggle={onPickupToggle}
        onSelect={onPickupSelect}
        unavailableText={strings.unavailable}
        loadingText={strings.loading}
      />
      <ToggleRow
        label={strings.dropoffToggle}
        enabled={dropoffEnabled}
        location={dropoffLocation}
        apiKey={apiKey}
        onToggle={onDropoffToggle}
        onSelect={onDropoffSelect}
        unavailableText={strings.unavailable}
        loadingText={strings.loading}
      />
    </div>
  );
}
