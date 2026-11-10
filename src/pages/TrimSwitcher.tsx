import { trimLabel, versionSubtitle } from './model';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';

/**
 * Trim switcher of a model page (hero card, «Цены по сезонам»): one button per
 * trim with its seats/year subtitle; the choice is the page's shared state, so
 * every switcher and the trim-dependent parts move together. Nothing with one
 * trim. `inline` — sized to its content (not the full card width). Needs
 * `ModelPageProvider`.
 */
export function TrimSwitcher({ inline = false }: { inline?: boolean }) {
  const page = useModelPage();
  if (!page || !page.selected || page.versions.length < 2) return null;
  const { locale, versions, selected, select } = page;
  const t = PAGE_STRINGS[locale];

  return (
    <div
      className={`sb-mp-seg${inline ? ' sb-mp-seg--inline' : ''}`}
      style={{ ['--n' as string]: versions.length }}
      role="group"
      aria-label={t.trims}
    >
      {versions.map((v) => {
        const sub = versionSubtitle(v, versions, t.seatsCount);
        const on = v.key === selected.key;
        return (
          <button
            key={v.key}
            type="button"
            className={on ? 'is-on' : undefined}
            aria-pressed={on}
            onClick={() => select(v.key)}
          >
            {trimLabel(v.trim, t.baseTrim)}
            {sub ? <i>{sub}</i> : null}
          </button>
        );
      })}
    </div>
  );
}
