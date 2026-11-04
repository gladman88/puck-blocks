import { describe, it, expect, vi, afterEach } from 'vitest';
import { shareVehicle } from './share';

afterEach(() => {
  // jsdom has no navigator.share — drop whatever a test defined.
  delete (navigator as unknown as { share?: unknown }).share;
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('shareVehicle', () => {
  it('navigator.share used when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const outcome = await shareVehicle({ vehicleId: 'v1', title: 'BMW Z4', promptLabel: 'Share' });

    expect(outcome).toBe('shared');
    expect(share).toHaveBeenCalledTimes(1);
    expect(share.mock.calls[0][0].title).toBe('BMW Z4');
    expect(share.mock.calls[0][0].url).toContain('vehicle=v1');
    expect(writeText).not.toHaveBeenCalled();

    share.mockRejectedValueOnce(new Error('AbortError'));
    expect(await shareVehicle({ vehicleId: 'v1', title: 'BMW Z4', promptLabel: 'Share' })).toBe('dismissed');
  });

  it('clipboard fallback returns copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    const outcome = await shareVehicle({ vehicleId: 'v1', title: 'BMW Z4', promptLabel: 'Share' });

    expect(outcome).toBe('copied');
    expect(writeText.mock.calls[0][0]).toContain('vehicle=v1');

    // Clipboard refused → prompt with the link.
    writeText.mockRejectedValueOnce(new Error('denied'));
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    expect(await shareVehicle({ vehicleId: 'v1', title: 'BMW Z4', promptLabel: 'Share' })).toBe('prompted');
    expect(prompt).toHaveBeenCalledWith('Share', expect.stringContaining('vehicle=v1'));
  });

  it('keeps referral code in the url', async () => {
    window.history.replaceState(null, '', '/en?utm=x');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    await shareVehicle({ vehicleId: 'v7', title: 'X', referralCode: 'AG1234', promptLabel: 'Share' });

    const url = new URL(writeText.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/en');
    expect(url.searchParams.get('vehicle')).toBe('v7');
    expect(url.searchParams.get('ref')).toBe('AG1234');
    expect(url.searchParams.get('utm')).toBe('x');
  });
});
