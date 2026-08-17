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

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="sb-root">
      <div className="sb-date-sheet" role="presentation" onPointerDown={onClose}>
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
            onSelect={(date) => {
              if (date) onSelect(toISODate(date));
            }}
            classNames={{
              root: 'sb-date-sheet__calendar',
              months: 'sb-date-sheet__months',
              month: 'sb-date-sheet__month',
              month_caption: 'sb-date-sheet__caption',
              caption_label: 'sb-date-sheet__caption-label',
              nav: 'sb-date-sheet__nav',
              button_previous: 'sb-date-sheet__nav-button',
              button_next: 'sb-date-sheet__nav-button',
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
          />
        </section>
      </div>
    </div>,
    document.body,
  );
}
