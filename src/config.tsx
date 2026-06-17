import type { Config } from '@measured/puck';
import { Hero, type HeroProps } from './blocks/Hero';
import { RichText, type RichTextProps } from './blocks/RichText';

/** Props for every editable component, keyed by component name. */
export interface Props {
  Hero: HeroProps;
  RichText: RichTextProps;
}

/** Page-level (root) fields — these drive SEO metadata, not visible layout. */
export interface RootProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * The single Puck config shared by the editor (in FMS) and the renderer
 * (in frontend_site). Keeping it here guarantees the editor preview and the
 * live page render identically.
 */
const internalConfig: Config<Props, RootProps> = {
  root: {
    fields: {
      title: { type: 'text', label: 'SEO title' },
      description: { type: 'textarea', label: 'SEO description' },
      ogImage: { type: 'text', label: 'OG image URL' },
    },
    render: ({ children }) => <>{children}</>,
  },
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        backgroundImage: { type: 'text', label: 'Background image URL' },
        ctaLabel: { type: 'text', label: 'CTA label' },
        ctaHref: { type: 'text', label: 'CTA link' },
      },
      defaultProps: {
        heading: 'Shiba Cars',
        subheading: 'Car & motorbike rental in Phuket',
        backgroundImage: '',
        ctaLabel: '',
        ctaHref: '',
      },
      render: Hero,
    },
    RichText: {
      label: 'Rich text',
      fields: {
        content: { type: 'textarea', label: 'Content' },
      },
      defaultProps: {
        content: 'Your text here.',
      },
      render: RichText,
    },
  },
};

// Exported as the loose `Config` type so consumers' <Puck>/<Render> accept it
// directly — a strongly-typed Config<Props, RootProps> isn't assignable because
// Puck's render prop (PuckComponent<Props>) is invariant. Authoring safety is
// preserved via the typed `internalConfig` above.
export const puckConfig = internalConfig as unknown as Config;
