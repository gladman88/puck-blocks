import { useEffect, useState } from 'react';
import { DayPicker, labelDayButton, type DayButtonProps } from 'react-day-picker';
import { enGB, ru } from 'react-day-picker/locale';
import { formatShortDate } from './dates';
import { isDayBusy, maxReturnDay, unitCovering, type UnitAvailability } from './availability';

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function toISODate(value: Date): string {
  return String(value.getFullYear()) + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
}

const WIDE_QUERY = '(min-width: 641px)';

function readMonths(): 1 | 2 {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 1;
  return window.matchMedia(WIDE_QUERY).matches ? 2 : 1;
}

/** Сколько месяцев показывать: два на широком окне, один на телефоне. Без
 *  `matchMedia` (SSR, jsdom) — один. */
export function useCalendarMonths(): 1 | 2 {
  const [months, setMonths] = useState<1 | 2>(readMonths);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(WIDE_QUERY);
    const apply = () => setMonths(query.matches ? 2 : 1);
    apply();
    query.addEventListener?.('change', apply);
    return () => query.removeEventListener?.('change', apply);
  }, []);
  return months;
}

interface AvailabilityCalendarProps {
  /** Занятость экземпляров модели; пусто — календарь без зачёркиваний. */
  units: UnitAvailability[];
  /** «Сегодня» на Пхукете (ISO) — дни раньше отключены. */
  today: string;
  /** Выбранный срок, ISO; пустая строка — не выбрано. */
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  locale: 'ru' | 'en';
  /** Число месяцев; не задано — по ширине окна (`useCalendarMonths`). */
  months?: 1 | 2;
}

/**
 * Календарь занятости модели на шаге брони. Выбор срока — два клика; занятые дни
 * зачёркнуты, но НЕ отключены: клиента не останавливаем, заявка на занятый срок
 * уходит как просьба подобрать замену (владелец 2026-10-09).
 */
export function AvailabilityCalendar({ units, today, start, end, onChange, locale, months }: AvailabilityCalendarProps) {
  const autoMonths = useCalendarMonths();
  const monthCount = months ?? autoMonths;
  const todayDate = parseISODate(today);

  const picking = Boolean(start && !end);
  const complete = Boolean(start && end);
  // Самый поздний возврат для выбранного получения — дни после него приглушены.
  const returnLimit = picking ? maxReturnDay(units, start) : null;
  const conflict =
    units.length > 0 &&
    (complete ? unitCovering(units, start, end) === null : picking && isDayBusy(units, start));

  const busyLabel = (date: Date) =>
    formatShortDate(toISODate(date), locale) + ' — ' + (locale === 'ru' ? 'занято' : 'booked');

  const handleDayClick = (date: Date) => {
    const day = toISODate(date);
    if (day < today) return;
    if (!start || end || day <= start) onChange(day, '');
    else onChange(start, day);
  };

  return (
    <div className={`sb-avcal${monthCount === 2 ? ' sb-avcal--two' : ''}${conflict ? ' is-conflict' : ''}`}>
      <DayPicker
        locale={locale === 'ru' ? ru : enGB}
        numberOfMonths={monthCount}
        defaultMonth={start ? parseISODate(start) : todayDate}
        startMonth={todayDate}
        today={todayDate}
        disabled={{ before: todayDate }}
        fixedWeeks
        // Стрелки — в потоке, рядом с заголовком месяца (см. MobileDatePicker:
        // раскладка по умолчанию требует absolute и уезжает за пределы блока).
        navLayout="around"
        onDayClick={handleDayClick}
        components={{
          DayButton: ({ day, modifiers, ...buttonProps }: DayButtonProps) => (
            <button {...buttonProps} title={modifiers.busy ? busyLabel(day.date) : undefined} />
          ),
        }}
        labels={{
          labelDayButton: (date, modifiers, options, dateLib) => {
            return modifiers.busy ? busyLabel(date) : labelDayButton(date, modifiers, options, dateLib);
          },
        }}
        modifiers={{
          // День возврата машину не занимает — у конца срока зачёркивание снято.
          busy: (date) => {
            const day = toISODate(date);
            return day >= today && !(complete && day === end) && isDayBusy(units, day);
          },
          rangeStart: (date) => Boolean(start) && toISODate(date) === start,
          rangeEnd: (date) => Boolean(end) && toISODate(date) === end,
          rangeMiddle: (date) => {
            if (!complete) return false;
            const day = toISODate(date);
            return day > start && day < end;
          },
          unreachable: (date) => returnLimit !== null && toISODate(date) > returnLimit,
        }}
        modifiersClassNames={{
          busy: 'is-busy',
          rangeStart: 'is-start',
          rangeEnd: 'is-end',
          rangeMiddle: 'is-middle',
          unreachable: 'is-unreachable',
        }}
        classNames={{
          root: 'sb-avcal__calendar',
          months: 'sb-avcal__months',
          month: 'sb-avcal__month',
          month_caption: 'sb-avcal__caption',
          caption_label: 'sb-avcal__caption-label',
          button_previous: 'sb-avcal__nav sb-avcal__nav--prev',
          button_next: 'sb-avcal__nav sb-avcal__nav--next',
          chevron: 'sb-avcal__chevron',
          weekdays: 'sb-avcal__weekdays',
          weekday: 'sb-avcal__weekday',
          month_grid: 'sb-avcal__grid',
          week: 'sb-avcal__week',
          day: 'sb-avcal__day',
          day_button: 'sb-avcal__day-button',
          disabled: 'is-disabled',
          today: 'is-today',
          outside: 'is-outside',
        }}
      />
    </div>
  );
}
