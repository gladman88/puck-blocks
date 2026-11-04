import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the «Ссылка скопирована» plate stays up. */
export const COPIED_TOAST_MS = 2000;
/** Its slide in/out time — the CSS `--sb-vcard-anim` (0 with reduced motion). */
export const COPIED_TOAST_ANIM_MS = 220;

/** hidden → shown (slides in, 2 s) → leaving (slides out) → hidden. */
export type CopiedToastPhase = 'hidden' | 'shown' | 'leaving';

export interface CopiedToast {
  phase: CopiedToastPhase;
  /** The plate is up (also the 2 s «done» state of the share button). */
  shown: boolean;
  /** Start (or restart) the 2 s plate. A no-op once the owner unmounted —
   *  safe to call after an `await` (share sheet / clipboard). */
  show: () => void;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * The «Ссылка скопирована» plate after «Поделиться» — shared by the catalog
 * card and the vehicle window. Timers are cleared on unmount and on a repeat
 * press (which restarts the 2 s). Markup stays with the caller: keep the
 * live region (`role="status"`) mounted and render the text only while
 * `phase !== 'hidden'`, so it is announced when shown, not on mount.
 */
export function useCopiedToast(): CopiedToast {
  const [phase, setPhase] = useState<CopiedToastPhase>('hidden');
  const mounted = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const show = useCallback(() => {
    if (!mounted.current) return;
    timers.current.forEach(clearTimeout);
    setPhase('shown');
    const anim = prefersReducedMotion() ? 0 : COPIED_TOAST_ANIM_MS;
    timers.current = [
      setTimeout(() => setPhase('leaving'), COPIED_TOAST_MS),
      setTimeout(() => setPhase('hidden'), COPIED_TOAST_MS + anim),
    ];
  }, []);

  return { phase, shown: phase === 'shown', show };
}
