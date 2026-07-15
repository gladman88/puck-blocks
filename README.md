# puck-blocks

Shared content blocks and [Puck](https://puckeditor.com) visual-editor config for building marketing pages.

The blocks are **framework-neutral React components** (no `next/*` imports), so the
same package powers both:

- the **editor** (`<Puck>`) — embedded in an admin panel, and
- the **renderer** (`<Render>`) — on a public Next.js or Vite site.

Keeping the components and the Puck config in one place guarantees the editor
preview and the live page render identically.

## Install

Consumed as a git dependency (no npm registry), **pinned to an exact commit SHA**
(not a branch) so installs are reproducible:

```jsonc
// package.json
{
  "dependencies": {
    "puck-blocks": "github:gladman88/puck-blocks#<commit-sha>"
  }
}
```

> **⚠️ A puck-blocks change is INVISIBLE to the consumers until you RE-PIN.**
> Because they pin a fixed commit SHA, `frontend_site` and `frontend_fms` keep
> using the OLD commit until their `package.json` SHA is bumped. Re-pinning is
> mandatory after every functional change — never skip it.

**Re-pin loop** (consumers `frontend_site` + `frontend_fms`):
1. change `src/` → `npm run build` (commit `dist/`) → bump `version` → commit →
   **push puck-blocks**.
2. resolve the new SHA (`git ls-remote https://github.com/gladman88/puck-blocks.git HEAD`).
3. in EACH consumer: `npm install github:gladman88/puck-blocks#<new-sha>` →
   `npx tsc --noEmit` → commit the `package.json` + lockfile bump → push.

Docs-only changes (no `dist/` change) don't need a re-pin. Locale parity (ru + en)
is required for every user-facing string.

For local development against a checkout in a sibling folder, use a file link
instead (don't commit this — keep the git ref in committed code):

```bash
npm install ../puck-blocks   # or: "puck-blocks": "file:../puck-blocks"
```

### Peer dependencies

The host app provides these (they are **not** bundled):

```bash
npm install @puckeditor/core react react-dom
```

### Styles

Blocks ship their own **self-contained CSS** (design tokens as CSS variables +
component styles, all `sb-`-prefixed and scoped under `.sb-root`). No Tailwind
dependency — the blocks render identically in any host app (the FMS editor
preview and the public site), independent of the host's theme/reset. Import it
once in every consumer:

```ts
import 'puck-blocks/styles.css';
```

Rebrand/tweak by overriding the `--sb-*` CSS variables on `.sb-root`.

## Usage

### Render a published page (public site)

```tsx
import { Render } from '@puckeditor/core';
import { puckConfig } from 'puck-blocks';

export default function Page({ data }) {
  return <Render config={puckConfig} data={data} />;
}
```

### Edit a page (admin)

```tsx
import { Puck } from '@puckeditor/core';
import { puckConfig } from 'puck-blocks';

export function SiteEditor({ data, onPublish }) {
  return <Puck config={puckConfig} data={data} onPublish={onPublish} />;
}
```

The page JSON produced by the editor is stored in the backend (the single source
of truth) and fetched by the renderer.

## Blocks

| Block             | Purpose                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `SiteHeader`      | Sticky header: logo, nav anchors, contacts                          |
| `Hero`            | Top hero section (heading, CTA, background)                         |
| `AboutPromo`      | About / promo split section                                         |
| `StatCounters`    | Animated stat counters                                              |
| `FeatureCards`    | Feature grid (+ optional promo `videoUrl`)                          |
| `VehicleCatalog`  | Live vehicle catalog (cars **or** bikes via `vehicleType`) → opens the booking modal. Fetches the public catalog API; deep-link `?vehicle=<id>` opens a card. Optional `showFilters` renders a full type/category/search/date/sort filter bar instead of category tabs (default off — site behavior unchanged); optional `referralCode` / `telegramUser` thread agent attribution and Telegram Mini App prefill into the booking flow (both host-supplied, this block never reads `window.Telegram`/localStorage itself) |
| `ReviewsCarousel` | Customer reviews carousel                                           |
| `TermsAccordion`  | Rental terms accordion                                              |
| `RichText`        | Simple text section (blank line = new paragraph)                   |
| `LeadForm`        | «Забронировать» callback form → backend `leads` API → manager Telegram |
| `MapContacts`     | Map + contact block                                                |
| `Footer`          | Footer columns + contacts                                          |

The catalog modal (`catalog/VehicleBookingModal`) is a mobile bottom sheet
(drag-to-dismiss) with a native scroll-snap photo carousel and a share/​deep-link
action — see the root project's CLAUDE.md → "Marketing Site, Catalog & Shared
Blocks" for the full UX contract.

Page-level (root) fields `title` / `description` / `ogImage` / `favicon` drive SEO
metadata + the tab icon on the host site — they are not visible layout.

## Develop

```bash
npm install
npm run dev        # tsup watch build
npm run typecheck  # tsc --noEmit
npm run build      # emit dist/ (ESM + CJS + types)
```

The built `dist/` is **committed to the repo** so git-dependency consumers need
no build step (and no dev dependencies) at install time — this avoids breaking a
consumer's production install (`npm ci --omit=dev`). **Rebuild (`npm run build`)
and commit `dist/` whenever you change `src/`.**

## License

[MIT](./LICENSE)
