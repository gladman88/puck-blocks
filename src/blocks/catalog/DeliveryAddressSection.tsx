import { DeliveryAddressPicker, type PickedLocation } from './DeliveryAddressPicker';

export type { PickedLocation };

export interface DeliveryAddressStrings {
  title: string;
  pickupToggle: string;
  dropoffToggle: string;
  unavailable: string;
  loading: string;
  showMap: string;
  hideMap: string;
  mapHint: string;
  /** "Такой же адрес, как для доставки" — collection reuses the delivery address. */
  sameAsPickup: string;
}

interface ToggleRowProps {
  label: string;
  enabled: boolean;
  location: PickedLocation | null;
  apiKey: string | undefined;
  strings: DeliveryAddressStrings;
  onToggle: (enabled: boolean) => void;
  onSelect: (location: PickedLocation) => void;
  /** Optional slot rendered between the toggle and the picker (the collection
   *  row uses it for the "same as delivery" checkbox). */
  children?: React.ReactNode;
  /** When true the picker is hidden (collection is mirroring the delivery
   *  address) — the toggle + children still show. */
  hidePicker?: boolean;
}

function ToggleRow({
  label,
  enabled,
  location,
  apiKey,
  strings,
  onToggle,
  onSelect,
  children,
  hidePicker,
}: ToggleRowProps) {
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
          {children}
          {!hidePicker ? (
            <>
              <DeliveryAddressPicker
                apiKey={apiKey}
                value={location}
                onSelect={onSelect}
                strings={{
                  unavailable: strings.unavailable,
                  loading: strings.loading,
                  showMap: strings.showMap,
                  hideMap: strings.hideMap,
                  mapHint: strings.mapHint,
                }}
              />
              {location ? <p className="sb-vd__addr-picked">{location.address}</p> : null}
            </>
          ) : null}
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
  /** Collection reuses the delivery address (no second entry). */
  dropoffSameAsPickup: boolean;
  onPickupToggle: (enabled: boolean) => void;
  onDropoffToggle: (enabled: boolean) => void;
  onPickupSelect: (location: PickedLocation) => void;
  onDropoffSelect: (location: PickedLocation) => void;
  onDropoffSameToggle: (same: boolean) => void;
  strings: DeliveryAddressStrings;
}

/**
 * Delivery/collection-by-address section (Stage 6) — mirrors the FMS location
 * picker UX (search a place by name AND/OR tap a point on a map). "Enabled"
 * (the toggle) and "picked" (the actual address) are SEPARATE state in the
 * parent: flipping a toggle on reveals the picker but submits nothing until a
 * real selection lands — so an abandoned toggle can never leak a placeholder
 * `{address:'',lat:0,lng:0}` into the booking-request payload.
 *
 * The collection row offers a "same address as delivery" checkbox (only when
 * delivery is on with a picked address) so a round-trip rental isn't entered
 * twice — when checked, the collection picker is hidden and the parent submits
 * the delivery address for both.
 */
export function DeliveryAddressSection({
  apiKey,
  pickupEnabled,
  dropoffEnabled,
  pickupLocation,
  dropoffLocation,
  dropoffSameAsPickup,
  onPickupToggle,
  onDropoffToggle,
  onPickupSelect,
  onDropoffSelect,
  onDropoffSameToggle,
  strings,
}: DeliveryAddressSectionProps) {
  // The "same as delivery" shortcut only makes sense once delivery is on and
  // actually has an address to mirror.
  const canMirrorPickup = pickupEnabled && pickupLocation != null;
  const mirroring = canMirrorPickup && dropoffSameAsPickup;

  return (
    <div className="sb-vd__addr-section">
      <span className="sb-vd__section-label">{strings.title}</span>
      <ToggleRow
        label={strings.pickupToggle}
        enabled={pickupEnabled}
        location={pickupLocation}
        apiKey={apiKey}
        strings={strings}
        onToggle={onPickupToggle}
        onSelect={onPickupSelect}
      />
      <ToggleRow
        label={strings.dropoffToggle}
        enabled={dropoffEnabled}
        location={dropoffLocation}
        apiKey={apiKey}
        strings={strings}
        onToggle={onDropoffToggle}
        onSelect={onDropoffSelect}
        hidePicker={mirroring}
      >
        {canMirrorPickup ? (
          <label className="sb-vd__addr-same">
            <input
              type="checkbox"
              checked={dropoffSameAsPickup}
              onChange={(e) => onDropoffSameToggle(e.target.checked)}
            />
            <span>{strings.sameAsPickup}</span>
          </label>
        ) : null}
      </ToggleRow>
    </div>
  );
}
