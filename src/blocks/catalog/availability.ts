// Занятость модели по экземплярам — чистые функции над ответом
// GET /api/v1/catalog/availability/. Даты — строки ISO `YYYY-MM-DD`, сравниваются
// как строки. Промежуток занятости — `[start, end)`: `end` — день возврата,
// он уже свободен (в этот день машину можно выдать следующему клиенту).
import { addDays } from './dates';

export interface BusyRange {
  start: string;
  end: string;
}

export interface UnitAvailability {
  vehicle_id: string;
  busy: BusyRange[];
}

function unitBusyOn(unit: UnitAvailability, day: string): boolean {
  return unit.busy.some((b) => b.start <= day && day < b.end);
}

/** День занят у ВСЕХ экземпляров модели. Нет данных о занятости → свободно. */
export function isDayBusy(units: UnitAvailability[], day: string): boolean {
  return units.length > 0 && units.every((u) => unitBusyOn(u, day));
}

/** id первого по порядку экземпляра, свободного на весь срок `[start, end)`. */
export function unitCovering(units: UnitAvailability[], start: string, end: string): string | null {
  const unit = units.find((u) => !u.busy.some((b) => b.start < end && b.end > start));
  return unit ? unit.vehicle_id : null;
}

/** Самый поздний день возврата при получении в `start`: среди экземпляров,
 *  свободных в этот день, — самый поздний «первый занятый старт после start».
 *  `null` — ограничения нет (кто-то свободен бессрочно) или день занят у всех. */
export function maxReturnDay(units: UnitAvailability[], start: string): string | null {
  let latest: string | null = null;
  for (const unit of units) {
    if (unitBusyOn(unit, start)) continue;
    let next: string | null = null;
    for (const b of unit.busy) {
      if (b.start > start && (next === null || b.start < next)) next = b.start;
    }
    if (next === null) return null; // этот экземпляр свободен без ограничения
    if (latest === null || next > latest) latest = next;
  }
  return latest;
}

/** Занятые (у всех экземпляров) дни внутри `[start, end)`, свёрнутые в
 *  промежутки `[с, по]` включительно. */
export function busyDaysIn(units: UnitAvailability[], start: string, end: string): [string, string][] {
  const ranges: [string, string][] = [];
  if (!start || !end) return ranges;
  let from: string | null = null;
  let prev = '';
  for (let day = start; day && day < end; day = addDays(day, 1)) {
    if (isDayBusy(units, day)) {
      if (from === null) from = day;
    } else if (from !== null) {
      ranges.push([from, prev]);
      from = null;
    }
    prev = day;
  }
  if (from !== null) ranges.push([from, prev]);
  return ranges;
}
