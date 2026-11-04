import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { COPIED_TOAST_ANIM_MS, COPIED_TOAST_MS, useCopiedToast } from './useCopiedToast';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useCopiedToast', () => {
  it('shows for 2s then hides', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopiedToast());
    expect(result.current.phase).toBe('hidden');

    act(() => result.current.show());
    expect(result.current.phase).toBe('shown');
    expect(result.current.shown).toBe(true);

    act(() => vi.advanceTimersByTime(COPIED_TOAST_MS - 1));
    expect(result.current.shown).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.phase).toBe('leaving');
    expect(result.current.shown).toBe(false);
    act(() => vi.advanceTimersByTime(COPIED_TOAST_ANIM_MS));
    expect(result.current.phase).toBe('hidden');
  });

  it('restart on second call', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopiedToast());
    act(() => result.current.show());
    act(() => vi.advanceTimersByTime(1500));
    act(() => result.current.show());
    // The first press's timers are gone: still up 1.5 s later…
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.phase).toBe('shown');
    // …and leaves 2 s after the second press.
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.phase).toBe('leaving');
  });

  it('no timers after unmount', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useCopiedToast());
    act(() => result.current.show());
    expect(vi.getTimerCount()).toBe(2);
    const show = result.current.show;
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    // A share that resolves after the owner is gone shows nothing.
    show();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reduced motion hides right after the 2 s', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce') }));
    const { result } = renderHook(() => useCopiedToast());
    act(() => result.current.show());
    act(() => vi.advanceTimersByTime(COPIED_TOAST_MS));
    expect(result.current.phase).toBe('hidden');
  });
});
