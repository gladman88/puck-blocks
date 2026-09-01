import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// jsdom hands `import.meta.url` an http URL, so resolve from the package root.
// Comments are stripped: they quote the very declarations these pins forbid.
const css = readFileSync(resolve(process.cwd(), 'styles.css'), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

function rules(selector: string): string[] {
  const pattern = new RegExp(String.raw`(^|[},])\s*${selector.replace('.', '\\.')}\s*\{([^}]*)\}`, 'gm');
  return [...css.matchAll(pattern)].map((match) => match[2]);
}

function rule(selector: string): string {
  const found = rules(selector);
  expect(found.length).toBeGreaterThan(0);
  return found.join('\n');
}

/**
 * Layout cannot be asserted in jsdom, so the guarantees the mobile date sheet
 * rests on are pinned as stylesheet text instead. Both were live bugs on iOS.
 */
describe('date sheet stylesheet', () => {
  it('sizes the overlay conservatively and centres the dialog inside it', () => {
    const overlay = rule('.sb-date-sheet');

    // Measured on an iPhone: `inset: 0` and `100dvh` both resolve against the
    // LARGE viewport, which slid a bottom-anchored sheet under Safari's toolbar.
    expect(overlay).toContain('height: 100svh');
    expect(overlay).not.toMatch(/inset:\s*0/);
    expect(overlay).not.toContain('100dvh');
    // Centring survives an overlay that overhangs the visible area at both ends.
    expect(overlay).toContain('align-items: center');
    expect(overlay).not.toContain('align-items: flex-end');
    expect(overlay).toContain('env(safe-area-inset-bottom)');
  });

  it('caps the dialog and scrolls the calendar inside it', () => {
    expect(rule('.sb-date-sheet__dialog')).toContain('max-height: 100%');

    const calendar = rule('.sb-date-sheet__calendar');
    expect(calendar).toContain('overflow-y: auto');
    // A flex child ignores the cap without this.
    expect(calendar).toContain('min-height: 0');
  });

  it('lays the month arrows out in flow, never absolutely', () => {
    expect(rule('.sb-date-sheet__month')).toContain('grid-template-columns');
    expect(rules('.sb-date-sheet__nav')).toHaveLength(0);
    expect(rule('.sb-date-sheet__nav-button')).not.toMatch(/position:\s*absolute/);
  });
});
