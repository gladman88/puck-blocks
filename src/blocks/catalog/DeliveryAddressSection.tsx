import { DeliveryAddressPicker, type PickedLocation } from './DeliveryAddressPicker';

export type { PickedLocation };

/** A resolved delivery/collection price quote (from /catalog/delivery-quote/).
 *  `matched=false` means no zone matched → the manager sets the price ("on
 *  request"), NOT free. */
export interface DeliveryQuote {
  price: number;
  matched: boolean;
}
/** `'loading'` while the quote is in flight, `null` when there's no picked
 *  location to price. */
export type DeliveryCost = DeliveryQuote | 'loading' | null;

function isQuote(c: DeliveryCost): c is DeliveryQuote {
  return c != null && c !== 'loading';
}
function money(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export interface DeliveryAddressStrings {
  title: string;
  pickupToggle: string;
  dropoffToggle: string;
  unavailable: string;
  loading: string;
  searchPlaceholder: string;
  showMap: string;
  hideMap: string;
  mapHint: string;
  /** "Такой же адрес, как для доставки" — collection reuses the delivery address. */
  sameAsPickup: string;
  /** "Стоимость" — prefix for a picked address's delivery/collection price. */
  costPrefix: string;
  /** "Считаем стоимость…" — while the quote is loading. */
  costLoading: string;
  /** "по запросу" — no zone matched, manager will set the price. */
  costByRequest: string;
  /** "Доставка и приёмка" — label for the combined total. */
  costTotal: string;
  /** Currency suffix, e.g. "THB". */
  currency: string;
}

function CostLine({ cost, strings }: { cost: DeliveryCost; strings: DeliveryAddressStrings }) {
  if (cost == null) return null;
  if (cost === 'loading') {
    return <p className="sb-vd__addr-cost sb-vd__addr-cost--muted">{strings.costLoading}</p>;
  }
  if (!cost.matched) {
    return (
      <p className="sb-vd__addr-cost sb-vd__addr-cost--muted">
        {strings.costPrefix}: {strings.costByRequest}
      </p>
    );
  }
  return (
    <p className="sb-vd__addr-cost">
      {strings.costPrefix}:{' '}
      <b>
        {money(cost.price)} {strings.currency}
      </b>
    </p>
  );
}

interface ToggleRowProps {
  label: string;
  enabled: boolean;
  location: PickedLocation | null;
  apiKey: string | undefined;
  strings: DeliveryAddressStrings;
  onToggle: (enabled: boolean) => void;
  onSelect: (location: PickedLocation) => void;
  /** The delivery/collection price for this row's picked address. */
  cost: DeliveryCost;
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
  cost,
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
            <DeliveryAddressPicker
              apiKey={apiKey}
              value={location}
              onSelect={onSelect}
              strings={{
                unavailable: strings.unavailable,
                loading: strings.loading,
                searchPlaceholder: strings.searchPlaceholder,
                showMap: strings.showMap,
                hideMap: strings.hideMap,
                mapHint: strings.mapHint,
              }}
            />
          ) : null}
          <CostLine cost={cost} strings={strings} />
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
  /** Delivery / collection price quotes for the picked addresses. */
  pickupCost: DeliveryCost;
  dropoffCost: DeliveryCost;
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
  pickupCost,
  dropoffCost,
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

  // A combined total, but only when BOTH ends are priced with a real zone match
  // (an "on request" leg has no number to add).
  const showTotal =
    pickupEnabled && dropoffEnabled && isQuote(pickupCost) && pickupCost.matched && isQuote(dropoffCost) && dropoffCost.matched;

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
        cost={pickupEnabled ? pickupCost : null}
      />
      <ToggleRow
        label={strings.dropoffToggle}
        enabled={dropoffEnabled}
        location={dropoffLocation}
        apiKey={apiKey}
        strings={strings}
        onToggle={onDropoffToggle}
        onSelect={onDropoffSelect}
        cost={dropoffEnabled ? dropoffCost : null}
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
      {showTotal ? (
        <p className="sb-vd__addr-total">
          {strings.costTotal}:{' '}
          <b>
            {money((pickupCost as DeliveryQuote).price + (dropoffCost as DeliveryQuote).price)} {strings.currency}
          </b>
        </p>
      ) : null}
    </div>
  );
}
