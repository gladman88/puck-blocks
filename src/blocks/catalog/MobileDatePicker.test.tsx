import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileDatePicker } from './MobileDatePicker';

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
