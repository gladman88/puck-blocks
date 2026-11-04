import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StepHeader, type StepHeaderProps } from './StepHeader';

afterEach(cleanup);

function renderHeader(over: Partial<StepHeaderProps> = {}) {
  const props: StepHeaderProps = {
    photoUrl: 'https://cdn.example.com/ducati.jpg',
    name: 'Ducati Monster',
    year: 2024,
    categoryName: 'Мотоциклы',
    backLabel: 'Назад',
    closeLabel: 'Закрыть',
    onBack: vi.fn(),
    onClose: vi.fn(),
    ...over,
  };
  return { props, ...render(<StepHeader {...props} />) };
}

describe('StepHeader', () => {
  it('shows photo, name, year and category', () => {
    const { container } = renderHeader();
    const photo = container.querySelector('img.sb-stephead__photo') as HTMLImageElement;
    expect(photo.getAttribute('src')).toBe('https://cdn.example.com/ducati.jpg');
    expect(photo.getAttribute('alt')).toBe('');
    expect(screen.getByRole('heading', { name: 'Ducati Monster' })).toBeTruthy();
    expect(container.querySelector('.sb-vcard__sub')?.textContent).toBe('2024Мотоциклы');
    cleanup();
    // No photo → no broken <img>; no year/category → no sub line.
    const bare = renderHeader({ photoUrl: '', year: null, categoryName: null });
    expect(bare.container.querySelector('img')).toBeNull();
    expect(bare.container.querySelector('.sb-vcard__sub')).toBeNull();
  });

  it('back and close call handlers', () => {
    const { props } = renderHeader({ backLabel: 'Back', closeLabel: 'Close' });
    fireEvent.click(screen.getByRole('button', { name: /Back/ }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
    expect(props.onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it('no per-day range', () => {
    const { container } = renderHeader();
    expect(container.querySelector('.sb-vcard__range')).toBeNull();
    expect(container.querySelector('.sb-vcard__over')).toBeNull();
    expect(container.textContent).not.toMatch(/฿|THB|\/день|\/day|в сутки/);
  });
});
