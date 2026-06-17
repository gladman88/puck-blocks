import type { Config } from '@puckeditor/core';
import { Hero, type HeroProps } from './blocks/Hero';
import { RichText, type RichTextProps } from './blocks/RichText';
import { StatCounters, type StatCountersProps } from './blocks/StatCounters';
import { AboutPromo, type AboutPromoProps } from './blocks/AboutPromo';
import { FeatureCards, type FeatureCardsProps } from './blocks/FeatureCards';
import { TermsAccordion, type TermsAccordionProps } from './blocks/TermsAccordion';
import { ReviewsCarousel, type ReviewsCarouselProps } from './blocks/ReviewsCarousel';

/** Props for every editable component, keyed by component name. */
export interface Props {
  Hero: HeroProps;
  RichText: RichTextProps;
  StatCounters: StatCountersProps;
  AboutPromo: AboutPromoProps;
  FeatureCards: FeatureCardsProps;
  TermsAccordion: TermsAccordionProps;
  ReviewsCarousel: ReviewsCarouselProps;
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
    content: { title: 'Контент', components: ['Hero', 'AboutPromo', 'RichText'] },
    sections: {
      title: 'Секции',
      components: ['StatCounters', 'FeatureCards', 'TermsAccordion', 'ReviewsCarousel'],
    },
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
        heading: 'Аренда автомобилей и байков на Пхукете',
        subheading: 'Свобода передвижения по острову — ваш ключ к незабываемым приключениям',
        backgroundImage: '',
        ctaLabel: 'Забронировать сейчас',
        ctaHref: '#leadform',
      },
      render: Hero,
    },
    AboutPromo: {
      label: 'Промо (картинка + текст)',
      fields: {
        heading: { type: 'text', label: 'Заголовок', contentEditable: true },
        text: { type: 'textarea', label: 'Текст', contentEditable: true },
        image: { type: 'text', label: 'URL изображения' },
        imagePosition: {
          type: 'radio',
          label: 'Картинка',
          options: [
            { label: 'Справа', value: 'right' },
            { label: 'Слева', value: 'left' },
          ],
        },
      },
      defaultProps: {
        heading: 'Вы садитесь в арендную машину, как в свою!',
        text: '',
        image: '',
        imagePosition: 'right',
      },
      render: AboutPromo,
    },
    RichText: {
      label: 'Текст',
      fields: {
        content: { type: 'textarea', label: 'Текст', contentEditable: true },
      },
      defaultProps: { content: 'Текст…' },
      render: RichText,
    },
    StatCounters: {
      label: 'Цифры / преимущества',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        items: {
          type: 'array',
          label: 'Карточки',
          arrayFields: {
            value: { type: 'text', label: 'Значение' },
            text: { type: 'textarea', label: 'Описание' },
          },
          defaultItemProps: { value: '', text: '' },
          getItemSummary: (item) => item.value || 'Карточка',
        },
      },
      defaultProps: {
        heading: '',
        items: [
          { value: '3 года на рынке', text: 'Опыт и сервис делают нас лидерами в сфере аренды транспорта на Пхукете' },
          { value: 'Более 35 байков', text: 'Стильные и надёжные байки для комфортных поездок по острову' },
          { value: 'Подача авто за 2 часа', text: 'Быстрая доставка автомобиля прямо к вам — мы ценим ваше время' },
          { value: 'Более 40 машин', text: 'Широкий выбор авто — от компактных до мощных внедорожников' },
        ],
      },
      render: StatCounters,
    },
    FeatureCards: {
      label: 'Карточки преимуществ',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        items: {
          type: 'array',
          label: 'Карточки',
          arrayFields: {
            icon: { type: 'text', label: 'Иконка — URL' },
            title: { type: 'text', label: 'Заголовок' },
            text: { type: 'textarea', label: 'Текст' },
          },
          defaultItemProps: { icon: '', title: '', text: '' },
          getItemSummary: (item) => item.title || 'Карточка',
        },
      },
      defaultProps: {
        heading: '',
        items: [
          { icon: '', title: 'Экипировка мотоцикла', text: 'Каждый мотоцикл укомплектован надёжным держателем для телефона и качественным шлемом' },
          { icon: '', title: 'Гайд по лучшим местам', text: 'При аренде авто вы получаете персональный гайд с проверенными локациями' },
          { icon: '', title: 'Комфорт в деталях', text: 'Бутилированная вода, салфетки, зарядные кабели и зонт' },
          { icon: '', title: 'Собственный автопарк', text: 'Регулярный техосмотр, собственная автомойка' },
          { icon: '', title: 'Собственный пункт мойки', text: 'Безупречная чистота автомобиля перед каждой арендой' },
        ],
      },
      render: FeatureCards,
    },
    TermsAccordion: {
      label: 'Условия (аккордеон)',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        items: {
          type: 'array',
          label: 'Пункты',
          arrayFields: {
            title: { type: 'text', label: 'Заголовок' },
            content: { type: 'textarea', label: 'Содержимое' },
          },
          defaultItemProps: { title: '', content: '' },
          getItemSummary: (item) => item.title || 'Пункт',
        },
      },
      defaultProps: {
        heading: 'Условия',
        items: [
          { title: 'Возраст, стаж и документы', content: 'От 22 лет, стаж от 2 лет; загранпаспорт + международные права (МВУ). Без МВУ страховая может отказать в выплате.' },
          { title: 'Бронирование', content: 'Фото загранпаспорта, фото водительского удостоверения, аванс за 2 суток.' },
          { title: 'Страховка и страховой депозит', content: 'Страховка 1-го/бизнес класса; депозит ~$200–$800; франшиза 3000–7000 бат.' },
          { title: 'Доставка и километраж', content: 'Доставка в любую локацию платная и зависит от района; авто подаём чистым с полным баком.' },
          { title: 'Клиентский сервис', content: 'Аренда от суток; оплата THB/RUB/USD/USDT картой или наличными; официальный договор; русскоязычная поддержка.' },
        ],
      },
      render: TermsAccordion,
    },
    ReviewsCarousel: {
      label: 'Отзывы (карусель)',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        images: {
          type: 'array',
          label: 'Фото',
          arrayFields: {
            src: { type: 'text', label: 'URL фото' },
            alt: { type: 'text', label: 'Подпись (alt)' },
          },
          defaultItemProps: { src: '', alt: '' },
          getItemSummary: (item, index) => item.alt || `Фото ${(index ?? 0) + 1}`,
        },
      },
      defaultProps: {
        heading: 'Отзывы',
        images: [],
      },
      render: ReviewsCarousel,
    },
  },
};

// Exported as the loose `Config` type so consumers' <Puck>/<Render> accept it
// directly (a strongly-typed Config<Props, RootProps> isn't assignable because
// Puck's render prop is invariant). Authoring safety is kept via internalConfig.
export const puckConfig = internalConfig as unknown as Config;
