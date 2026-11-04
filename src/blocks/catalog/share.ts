/** What happened when the visitor pressed «Поделиться». */
export type ShareOutcome = 'shared' | 'copied' | 'prompted' | 'dismissed';

export interface ShareVehicleArgs {
  vehicleId: string;
  /** Title for the native share sheet (the vehicle's display name). */
  title: string;
  /** Agent attribution — kept in the shared link (`&ref=`). */
  referralCode?: string | null;
  /** Label of the last-resort `window.prompt` (the localized «Поделиться»). */
  promptLabel: string;
}

/** Deep link to the vehicle on the current page/locale: `?vehicle=<id>` (+ `ref`). */
export function buildVehicleShareUrl(vehicleId: string, referralCode?: string | null): string {
  const url = new URL(window.location.href);
  url.searchParams.set('vehicle', vehicleId);
  // Preserve agent attribution across a re-share (parity with the standalone
  // catalog's VehicleDetail — a forwarded link must keep crediting the agent).
  if (referralCode) url.searchParams.set('ref', referralCode);
  return url.toString();
}

/**
 * «Поделиться» for a vehicle — shared by the catalog card and the vehicle
 * window. Native share sheet (mobile) → clipboard → `prompt` fallback.
 * A dismissed share sheet is `'dismissed'`: the caller shows nothing.
 */
export async function shareVehicle({
  vehicleId,
  title,
  referralCode,
  promptLabel,
}: ShareVehicleArgs): Promise<ShareOutcome> {
  const shareUrl = buildVehicleShareUrl(vehicleId, referralCode);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, url: shareUrl });
      return 'shared';
    } catch {
      return 'dismissed';
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return 'copied';
  } catch {
    window.prompt(promptLabel, shareUrl);
    return 'prompted';
  }
}
