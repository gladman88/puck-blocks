import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileDatePicker } from './MobileDatePicker';

// The sheet is portal'd to document.body; without this its markup (and the
// body scroll lock) leaks into the next test.
afterEach(() => cleanup());

describe('MobileDatePicker', () => {
  it('disables dates before the supplied minimum and applies one selected date', () => {
    const onSelect = vi.fn();
    render(
      <MobileDatePicker
        field="to"
        locale="en"
        minDate="2026-08-21"
        dateFromLabel="Start date"
        dateToLabel="End date"
        closeLabel="Close calendar"
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'End date' });
    expect(dialog.querySelectorAll('.is-disabled').length).toBeGreaterThan(0);

    fireEvent.click(within(dialog).getByRole('button', { name: /23 August 2026/i }));
    expect(onSelect).toHaveBeenCalledWith('2026-08-23');
  });
});

describe('MobileDatePicker month navigation', () => {
  const open = () =>
    render(
      <MobileDatePicker
        field="from"
        locale="en"
        minDate="2026-09-01"
        dateFromLabel="Start date"
        dateToLabel="End date"
        closeLabel="Close calendar"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

  /**
   * Production incident: the arrows were absolutely positioned against the
   * fixed overlay (react-day-picker v9 renders the default nav as a child of
   * `months`, not of the caption as v8 did), so they landed at the screen edges
   * and nobody could reach October. Pin them INSIDE the month they navigate.
   */
  it('keeps the month arrows inside the month block, in flow', () => {
    open();

    const month = document.querySelector('.sb-date-sheet__month')!;
    const buttons = document.querySelectorAll('.sb-date-sheet__nav-button');

    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(month.contains(button)).toBe(true));
    expect(document.querySelector('.sb-date-sheet__nav')).toBeNull();
  });

  it('moves to the next month and offers its days', () => {
    open();

    expect(screen.getByText('September 2026')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(screen.getByText('October 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: /15 October 2026/i })).toBeTruthy();
  });

  it('marks the previous arrow disabled at the earliest allowed month', () => {
    open();

    expect(
      screen.getByRole('button', { name: /previous month/i }).getAttribute('aria-disabled'),
    ).toBe('true');
  });
});
