# puck-blocks

Shared content blocks and [Puck](https://puckeditor.com) visual-editor config for building marketing pages.

The blocks are **framework-neutral React components** (no `next/*` imports), so the
same package powers both:

- the **editor** (`<Puck>`) — embedded in an admin panel, and
- the **renderer** (`<Render>`) — on a public Next.js or Vite site.

Keeping the components and the Puck config in one place guarantees the editor
preview and the live page render identically.

## Install

Consumed as a git dependency (no npm registry):

```jsonc
// package.json
{
  "dependencies": {
    "puck-blocks": "github:gladman88/puck-blocks#v0.2.0"
  }
}
```

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

| Block      | Purpose                | Fields                                                        |
| ---------- | ---------------------- | ------------------------------------------------------------- |
| `Hero`     | Top hero section       | `heading`, `subheading`, `backgroundImage`, `ctaLabel`, `ctaHref` |
| `RichText` | Simple text section    | `content` (blank line = new paragraph)                        |

Page-level (root) fields `title` / `description` / `ogImage` drive SEO metadata
on the host site — they are not visible layout.

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
