import { CardTitle } from './CardPriceOverlay';

export interface StepHeaderProps {
  /** Already sanitized photo URL; empty → a dark strip without a photo. */
  photoUrl: string;
  name: string;
  year: number | null | undefined;
  /** Localized category name («Мотоциклы»), null when unknown. */
  categoryName: string | null;
  /** «Назад» / «Back». */
  backLabel: string;
  /** «Закрыть» / «Close» — the accessible name of «×». */
  closeLabel: string;
  onBack: () => void;
  onClose: () => void;
}

/**
 * Cover strip of the booking steps («Как забронировать?» and the manual form):
 * the vehicle photo fading into the window, the name and «year · category» —
 * the catalog card's title (CardTitle) — with «‹ Назад» on the photo and the
 * window's «×». No per-day price here: the steps show the real total below.
 */
export function StepHeader({
  photoUrl,
  name,
  year,
  categoryName,
  backLabel,
  closeLabel,
  onBack,
  onClose,
}: StepHeaderProps) {
  return (
    <div className="sb-stephead">
      {photoUrl ? <img className="sb-stephead__photo" src={photoUrl} alt="" draggable={false} /> : null}
      <button type="button" className="sb-stephead__back" onClick={onBack}>
        <span aria-hidden>‹</span> {backLabel}
      </button>
      <button type="button" className="sb-modal__close sb-stephead__close" aria-label={closeLabel} onClick={onClose}>
        ×
      </button>
      <div className="sb-stephead__title">
        <CardTitle name={name} year={year} categoryName={categoryName} />
      </div>
    </div>
  );
}
