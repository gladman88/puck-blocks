import type { Config } from '@puckeditor/core';
import { Hero, type HeroProps } from './blocks/Hero';
import { RichText, type RichTextProps } from './blocks/RichText';

/** Props for every editable component, keyed by component name. */
export interface Props {
  Hero: HeroProps;
  RichText: RichTextProps;
}

/** Page-level (root) fields — drive SEO metadata, not visible layout. */
export interface RootProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

const internalConfig: Config<Props, RootProps> = {
  root: {
    fields: {
      title: { type: 'text', label: 'SEO title' },
      description: { type: 'textarea', label: 'SEO description' },
      ogImage: { type: 'text', label: 'OG image URL' },
    },
    // Wrap the whole tree in the design-system root so tokens + base styles
    // apply identically in the editor preview and on the live site.
    render: ({ children }) => <div className="sb-root">{children}</div>,
  },
  categories: {
    content: { title: 'Контент', components: ['Hero', 'RichText'] },
  },
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        heading: { type: 'text', label: 'Заголовок', contentEditable: true },
        subheading: { type: 'textarea', label: 'Подзаголовок', contentEditable: true },
        backgroundImage: { type: 'text', label: 'Фон — URL изображения' },
        ctaLabel: { type: 'text', label: 'Кнопка — текст' },
        ctaHref: { type: 'text', label: 'Кнопка — ссылка' },
      },
      defaultProps: {
        heading: 'Shiba Cars',
        subheading: 'Аренда авто и байков на Пхукете',
        backgroundImage: '',
        ctaLabel: '',
        ctaHref: '',
      },
      render: Hero,
    },
    RichText: {
      label: 'Текст',
      fields: {
        content: { type: 'textarea', label: 'Текст', contentEditable: true },
      },
      defaultProps: {
        content: 'Текст…',
      },
      render: RichText,
    },
  },
};

// Exported as the loose `Config` type so consumers' <Puck>/<Render> accept it
// directly (a strongly-typed Config<Props, RootProps> isn't assignable because
// Puck's render prop is invariant). Authoring safety is kept via internalConfig.
export const puckConfig = internalConfig as unknown as Config;
