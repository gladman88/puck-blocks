import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import type { UnitAvailability } from './availability';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Пример утверждённого макета: модель из двух байков.
const units: UnitAvailability[] = [
  { vehicle_id: 'u1', busy: [{ start: '2026-10-09', end: '2026-10-14' }, { start: '2026-11-01', end: '2026-11-09' }] },
  { vehicle_id: 'u2', busy: [{ start: '2026-10-12', end: '2026-10-20' }, { start: '2026-10-25', end: '2026-11-03' }] },
];
const TODAY = '2026-10-09';

function setup(props: Partial<Parameters<typeof AvailabilityCalendar>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <AvailabilityCalendar
      units={units}
      today={TODAY}
      start=""
      end=""
      onChange={onChange}
      locale="ru"
      {...props}
    />,
  );
  const cell = (iso: string) => utils.container.querySelector(`td[data-day="${iso}"]`) as HTMLElement;
  const button = (iso: string) => cell(iso).querySelector('button') as HTMLButtonElement;
  const root = () => utils.container.querySelector('.sb-avcal') as HTMLElement;
  return { ...utils, onChange, cell, button, root };
}

describe('AvailabilityCalendar — picking a period', () => {
  it('the first click starts the period, the second one ends it', () => {
    const { onChange, button, rerender } = setup();
    fireEvent.click(button('2026-10-14'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-14', '');

    rerender(
      <AvailabilityCalendar units={units} today={TODAY} start="2026-10-14" end="" onChange={onChange} locale="ru" />,
    );
    fireEvent.click(button('2026-10-20'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-14', '2026-10-20');
  });

  it('a click before (or on) the start begins a new period', () => {
    const { onChange, button } = setup({ start: '2026-10-14' });
    fireEvent.click(button('2026-10-10'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-10', '');
    fireEvent.click(button('2026-10-14'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-14', '');
  });

  it('a click on a complete period starts over', () => {
    const { onChange, button } = setup({ start: '2026-10-14', end: '2026-10-20' });
    fireEvent.click(button('2026-10-22'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-22', '');
  });

  it('marks the start, the end and the days between', () => {
    const { cell } = setup({ start: '2026-10-14', end: '2026-10-17' });
    expect(cell('2026-10-14').classList.contains('is-start')).toBe(true);
    expect(cell('2026-10-17').classList.contains('is-end')).toBe(true);
    expect(cell('2026-10-15').classList.contains('is-middle')).toBe(true);
    expect(cell('2026-10-16').classList.contains('is-middle')).toBe(true);
    expect(cell('2026-10-18').classList.contains('is-middle')).toBe(false);
  });
});

describe('AvailabilityCalendar — busy and past days', () => {
  it('a busy day is struck through but still clickable', () => {
    const { onChange, cell, button } = setup();
    expect(cell('2026-10-12').classList.contains('is-busy')).toBe(true);
    expect(button('2026-10-12').disabled).toBe(false);
    fireEvent.click(button('2026-10-12'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-12', '');
  });

  it('busy day is announced to screen readers', () => {
    const { button } = setup();
    expect(button('2026-10-12').getAttribute('aria-label')).toContain('занято');
    expect(button('2026-10-12').getAttribute('title')).toContain('занято');
    expect(button('2026-10-10').getAttribute('aria-label')).not.toContain('занято');
  });

  it('a day with one free unit is not marked busy', () => {
    const { cell } = setup();
    expect(cell('2026-10-10').classList.contains('is-busy')).toBe(false);
    expect(cell('2026-10-14').classList.contains('is-busy')).toBe(false);
  });

  it('a past day is disabled and ignores clicks', () => {
    const { onChange, cell, button } = setup();
    expect(button('2026-10-08').disabled).toBe(true);
    expect(cell('2026-10-08').classList.contains('is-disabled')).toBe(true);
    fireEvent.click(button('2026-10-08'));
    expect(onChange).not.toHaveBeenCalled();
    // «Сегодня» — день из пропа, а не часы устройства.
    expect(button('2026-10-09').disabled).toBe(false);
    expect(cell('2026-10-09').classList.contains('is-today')).toBe(true);
  });

  it('no availability data → nothing is struck through', () => {
    const { container } = setup({ units: [] });
    expect(container.querySelector('.is-busy')).toBeNull();
  });

  it('while the return day is being picked, days past the limit are dimmed but clickable', () => {
    // Получение 10 окт.: свободен только байк 2, до 12 окт.
    const { onChange, cell, button } = setup({ start: '2026-10-10' });
    expect(cell('2026-10-12').classList.contains('is-unreachable')).toBe(false);
    expect(cell('2026-10-14').classList.contains('is-unreachable')).toBe(true);
    expect(button('2026-10-14').disabled).toBe(false);
    fireEvent.click(button('2026-10-14'));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-10', '2026-10-14');
  });
});

describe('AvailabilityCalendar — a period nobody covers', () => {
  it('puts is-conflict on the root and keeps the busy mark inside the period', () => {
    const { rerender, onChange, root } = setup({ months: 2, start: '2026-11-01', end: '2026-11-05' });
    expect(root().classList.contains('is-conflict')).toBe(true);
    const cell = (iso: string) => root().querySelector(`td[data-day="${iso}"]`) as HTMLElement;
    // Начало срока занято и остаётся зачёркнутым, занятый день внутри — тоже.
    expect(cell('2026-11-01').classList.contains('is-start')).toBe(true);
    expect(cell('2026-11-01').classList.contains('is-busy')).toBe(true);
    expect(cell('2026-11-02').classList.contains('is-middle')).toBe(true);
    expect(cell('2026-11-02').classList.contains('is-busy')).toBe(true);
    // Свободные дни срока не зачёркнуты.
    expect(cell('2026-11-03').classList.contains('is-busy')).toBe(false);

    rerender(
      <AvailabilityCalendar units={units} today={TODAY} start="2026-10-14" end="2026-10-20" onChange={onChange} locale="ru" months={2} />,
    );
    expect(root().classList.contains('is-conflict')).toBe(false);
  });

  it('no conflict without availability data', () => {
    const { root } = setup({ units: [], start: '2026-11-01', end: '2026-11-05' });
    expect(root().classList.contains('is-conflict')).toBe(false);
  });
});

describe('AvailabilityCalendar — months and navigation', () => {
  it('shows one month without matchMedia (SSR / jsdom) and two when asked', () => {
    const one = setup();
    expect(one.container.querySelectorAll('.sb-avcal__month')).toHaveLength(1);
    cleanup();
    const two = setup({ months: 2 });
    expect(two.container.querySelectorAll('.sb-avcal__month')).toHaveLength(2);
    expect(two.root().classList.contains('sb-avcal--two')).toBe(true);
  });

  it('follows the window width through matchMedia', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = setup();
    expect(container.querySelectorAll('.sb-avcal__month')).toHaveLength(2);
  });

  it('"previous" is inactive on the current month, "next" moves forward', () => {
    const { container, cell } = setup();
    const prev = container.querySelector('.sb-avcal__nav--prev') as HTMLButtonElement;
    const next = container.querySelector('.sb-avcal__nav--next') as HTMLButtonElement;
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    expect(cell('2026-11-15')).toBeNull();
    fireEvent.click(next);
    expect(cell('2026-11-15')).not.toBeNull();
    expect((container.querySelector('.sb-avcal__nav--prev') as HTMLElement).getAttribute('aria-disabled')).toBeNull();
  });

  it('opens on the month of the selected start', () => {
    const { cell } = setup({ start: '2026-11-03', end: '2026-11-07' });
    expect(cell('2026-11-03').classList.contains('is-start')).toBe(true);
  });
});
