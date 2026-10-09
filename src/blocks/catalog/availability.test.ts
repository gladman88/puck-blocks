import { describe, expect, it } from 'vitest';
import { busyDaysIn, isDayBusy, maxReturnDay, unitCovering, type UnitAvailability } from './availability';

// Пример утверждённого макета: модель из двух байков.
const units: UnitAvailability[] = [
  { vehicle_id: 'u1', busy: [{ start: '2026-10-09', end: '2026-10-14' }, { start: '2026-11-01', end: '2026-11-09' }] },
  { vehicle_id: 'u2', busy: [{ start: '2026-10-12', end: '2026-10-20' }, { start: '2026-10-25', end: '2026-11-03' }] },
];

describe('isDayBusy', () => {
  it('is true only when every unit is busy that day', () => {
    for (const day of ['2026-10-12', '2026-10-13', '2026-11-01', '2026-11-02']) {
      expect(isDayBusy(units, day)).toBe(true);
    }
  });

  it('the return day is already free (the range is [start, end))', () => {
    expect(isDayBusy(units, '2026-10-14')).toBe(false);
    expect(isDayBusy(units, '2026-11-03')).toBe(false);
  });

  it('one free unit is enough', () => {
    expect(isDayBusy(units, '2026-10-10')).toBe(false);
  });

  it('no units → free', () => {
    expect(isDayBusy([], '2026-10-12')).toBe(false);
  });
});

describe('unitCovering', () => {
  it('returns the first unit that is free for the whole period', () => {
    expect(unitCovering(units, '2026-10-14', '2026-10-20')).toBe('u1');
    expect(unitCovering(units, '2026-11-03', '2026-11-07')).toBe('u2');
  });

  it('returning on the day of somebody else’s pick-up is allowed', () => {
    expect(unitCovering(units, '2026-10-10', '2026-10-12')).toBe('u2');
  });

  it('null when no single unit covers the period', () => {
    expect(unitCovering(units, '2026-11-01', '2026-11-05')).toBeNull();
    // Each day is free on some unit, but no ONE unit is free throughout.
    expect(unitCovering(units, '2026-10-20', '2026-11-04')).toBeNull();
  });

  it('prefers the earlier unit in the list when several fit', () => {
    expect(unitCovering(units, '2026-10-20', '2026-10-25')).toBe('u1');
    expect(unitCovering([units[1], units[0]], '2026-10-20', '2026-10-25')).toBe('u2');
  });

  it('no units → null', () => {
    expect(unitCovering([], '2026-10-14', '2026-10-20')).toBeNull();
  });
});

describe('maxReturnDay', () => {
  it('is the latest "next busy start" among the units free on the pick-up day', () => {
    expect(maxReturnDay(units, '2026-10-10')).toBe('2026-10-12');
    expect(maxReturnDay(units, '2026-10-20')).toBe('2026-11-01');
  });

  it('null when the pick-up day is busy on every unit', () => {
    expect(maxReturnDay(units, '2026-10-12')).toBeNull();
  });

  it('null when some unit has no later booking at all', () => {
    expect(maxReturnDay(units, '2026-11-10')).toBeNull();
    expect(maxReturnDay([], '2026-10-10')).toBeNull();
  });
});

describe('busyDaysIn', () => {
  it('collapses busy days of the period into inclusive ranges', () => {
    expect(busyDaysIn(units, '2026-11-01', '2026-11-05')).toEqual([['2026-11-01', '2026-11-02']]);
    expect(busyDaysIn(units, '2026-10-10', '2026-11-05')).toEqual([
      ['2026-10-12', '2026-10-13'],
      ['2026-11-01', '2026-11-02'],
    ]);
  });

  it('a busy stretch running to the end of the period is closed at the last rented day', () => {
    expect(busyDaysIn(units, '2026-10-10', '2026-10-13')).toEqual([['2026-10-12', '2026-10-12']]);
  });

  it('empty when nothing is busy / no units', () => {
    expect(busyDaysIn(units, '2026-10-14', '2026-10-20')).toEqual([]);
    expect(busyDaysIn([], '2026-11-01', '2026-11-05')).toEqual([]);
  });
});
