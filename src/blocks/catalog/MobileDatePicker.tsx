import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { enGB, ru } from 'react-day-picker/locale';

type DateField = 'from' | 'to' | null;

interface MobileDatePickerProps {
  field: DateField;
  locale: 'ru' | 'en';
  selected?: string;
  minDate: string;
  dateFromLabel: string;
  dateToLabel: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  closeLabel: string;
}

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function toISODate(value: Date): string {
  return String(value.getFullYear()) + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
}

/**
 * Touch-only date selector for the catalog filter. Native mobile date pickers
 * disagree on when a value is committed and whether the minimum disables old
 * dates. DayPicker gives this workflow one explicit, selectable day and keeps
 * the desktop native control untouched.
 */
export function MobileDatePicker({
  field,
  locale,
  selected,
  minDate,
  dateFromLabel,
  dateToLabel,
  onSelect,
  onClose,
  closeLabel,
}: MobileDatePickerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isOpen = field !== null;
  const fieldLabel = field === 'from' ? dateFromLabel : dateToLabel;
  const min = parseISODate(minDate);
  const selectedDate = selected ? parseISODate(selected) : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  /**
   * The sheet must never extend past the visible viewport. The stylesheet holds
   * the conservative height (`100svh`); this narrows it further when the engine
   * reports something smaller — a keyboard, a pinch-zoom, an Android toolbar.
   *
   * It may only SHRINK the overlay, never grow it: on iOS `innerHeight` (and,
   * measured on an iPhone, `dvh`) report the large viewport, so trusting them
   * upwards is what put the sheet under Safari's toolbar in the first place.
   */
  useEffect(() => {
    if (!isOpen) return;

    const apply = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const measured = window.visualViewport?.height ?? window.innerHeight;
      if (!measured || measured <= 0) return;
      overlay.style.height = '';
      if (measured < overlay.clientHeight) overlay.style.height = Math.round(measured) + 'px';
    };
    // Orientation changes report the pre-rotation size for one frame.
    const applySoon = () => {
      apply();
      window.requestAnimationFrame?.(apply);
    };

    apply();
    const viewport = window.visualViewport;
    window.addEventListener('resize', applySoon);
    window.addEventListener('orientationchange', applySoon);
    viewport?.addEventListener('resize', applySoon);

    return () => {
      window.removeEventListener('resize', applySoon);
      window.removeEventListener('orientationchange', applySoon);
      viewport?.removeEventListener('resize', applySoon);
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="sb-root">
      <div className="sb-date-sheet" role="presentation" onPointerDown={onClose} ref={overlayRef}>
        <section
          className="sb-date-sheet__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="sb-date-sheet__head">
            <h3 id={titleId}>{fieldLabel}</h3>
            <button
              ref={closeRef}
              type="button"
              className="sb-date-sheet__close"
              aria-label={closeLabel}
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <DayPicker
            mode="single"
            locale={locale === 'ru' ? ru : enGB}
            selected={selectedDate}
            defaultMonth={selectedDate ?? min}
            startMonth={min}
            disabled={{ before: min }}
            fixedWeeks
            autoFocus
            /**
             * `navLayout="around"` renders the month arrows as siblings of the
             * caption, laid out in normal flow. The default layout puts them in
             * a separate <nav>, which only looks right when it is positioned
             * absolutely — and that is what broke in production: the nav is a
             * child of `months` (NOT of the caption, as in v8), so `inset: 0`
             * resolved against the fixed overlay and threw both arrows to the
             * screen edges, leaving no way to reach October. Keep the arrows in
             * flow so no containing block can ever capture them again.
             */
            navLayout="around"
            classNames={{
              root: 'sb-date-sheet__calendar',
              months: 'sb-date-sheet__months',
              month: 'sb-date-sheet__month',
              month_caption: 'sb-date-sheet__caption',
              caption_label: 'sb-date-sheet__caption-label',
              button_previous: 'sb-date-sheet__nav-button',
              button_next: 'sb-date-sheet__nav-button',
              chevron: 'sb-date-sheet__chevron',
              weekdays: 'sb-date-sheet__weekdays',
              weekday: 'sb-date-sheet__weekday',
              month_grid: 'sb-date-sheet__grid',
              week: 'sb-date-sheet__week',
              day: 'sb-date-sheet__day',
              day_button: 'sb-date-sheet__day-button',
              selected: 'is-selected',
              disabled: 'is-disabled',
              today: 'is-today',
              outside: 'is-outside',
            }}
            onSelect={(date) => {
              if (date) onSelect(toISODate(date));
            }}
          />
        </section>
      </div>
    </div>,
    document.body,
  );
}
