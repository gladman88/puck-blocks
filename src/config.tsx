import type { Config } from '@puckeditor/core';
import { Hero, type HeroProps } from './blocks/Hero';
import { RichText, type RichTextProps } from './blocks/RichText';
import { StatCounters, type StatCountersProps } from './blocks/StatCounters';
import { AboutPromo, type AboutPromoProps } from './blocks/AboutPromo';
import { FeatureCards, type FeatureCardsProps } from './blocks/FeatureCards';
import { TermsAccordion, type TermsAccordionProps } from './blocks/TermsAccordion';
import { ReviewsCarousel, type ReviewsCarouselProps } from './blocks/ReviewsCarousel';
import { SiteHeader, type SiteHeaderProps } from './blocks/SiteHeader';
import { Footer, type FooterProps } from './blocks/Footer';
import { LeadForm, type LeadFormProps } from './blocks/LeadForm';
import { VehicleCatalog, type VehicleCatalogProps } from './blocks/VehicleCatalog';
import { MapContacts, type MapContactsProps } from './blocks/MapContacts';
import { imageField } from './fields/imageField';

/** Props for every editable component, keyed by component name. */
export interface Props {
  Hero: HeroProps;
  RichText: RichTextProps;
  StatCounters: StatCountersProps;
  AboutPromo: AboutPromoProps;
  FeatureCards: FeatureCardsProps;
  TermsAccordion: TermsAccordionProps;
  ReviewsCarousel: ReviewsCarouselProps;
  SiteHeader: SiteHeaderProps;
  Footer: FooterProps;
  LeadForm: LeadFormProps;
  VehicleCatalog: VehicleCatalogProps;
  MapContacts: MapContactsProps;
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
      ogImage: imageField('OG-картинка (для соцсетей)'),
    },
    // Wrap the whole tree in the design-system root so tokens + base styles
    // apply identically in the editor preview and on the live site.
    render: ({ children }) => <div className="sb-root">{children}</div>,
  },
  categories: {
    layout: { title: 'Каркас', components: ['SiteHeader', 'Footer', 'MapContacts'] },
    content: { title: 'Контент', components: ['Hero', 'AboutPromo', 'RichText', 'LeadForm'] },
    catalog: { title: 'Каталог', components: ['VehicleCatalog'] },
    sections: {
      title: 'Секции',
      components: ['StatCounters', 'FeatureCards', 'TermsAccordion', 'ReviewsCarousel'],
    },
  },
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        heading: { type: 'text', label: 'Заголовок' },
        subheading: { type: 'textarea', label: 'Подзаголовок' },
        backgroundImage: imageField('Фоновое изображение'),
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
      label: 'Промо (медиа + текст)',
      fields: {
        heading: { type: 'text', label: 'Заголовок' },
        text: { type: 'textarea', label: 'Текст' },
        image: imageField('Изображение'),
        videoUrl: { type: 'text', label: 'Видео — ссылка YouTube (опц.)' },
        imagePosition: {
          type: 'radio',
          label: 'Медиа',
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
        videoUrl: '',
        imagePosition: 'right',
      },
      render: AboutPromo,
    },
    RichText: {
      label: 'Текст',
      fields: {
        // No contentEditable: this block splits the value into paragraphs, so
        // it can't be a single inline-editable node — edit via the side panel.
        content: { type: 'textarea', label: 'Текст' },
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
          { value: 'Более 40 машин', text: 'Широкий выбор авто — от компактных до мощных внедорожников' },
          { value: 'Более 35 байков', text: 'Стильные и надёжные байки для комфортных поездок по острову' },
          { value: 'Подача авто за 2 часа', text: 'Быстрая доставка автомобиля прямо к вам — мы ценим ваше время' },
          { value: '3 года на рынке', text: 'Опыт и сервис делают нас лидерами в сфере аренды транспорта на Пхукете' },
        ],
      },
      render: StatCounters,
    },
    FeatureCards: {
      label: 'Преимущества (заголовок + иконки + видео)',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        items: {
          type: 'array',
          label: 'Карточки',
          arrayFields: {
            icon: imageField('Иконка'),
            title: { type: 'text', label: 'Заголовок' },
            text: { type: 'textarea', label: 'Текст' },
          },
          defaultItemProps: { icon: '', title: '', text: '' },
          getItemSummary: (item) => item.title || 'Карточка',
        },
        videoUrl: { type: 'text', label: 'Видео — ссылка YouTube (опц.)' },
        videoIndex: { type: 'number', label: 'Позиция видео в сетке (0 = первая)', min: 0 },
      },
      defaultProps: {
        heading: 'Вы садитесь в арендную машину, как в свою!',
        items: [
          { icon: '/media/site/feat-autopark.png', title: 'Собственный автопарк', text: 'Наши автомобили всегда в отличном техническом состоянии, регулярно проходят техосмотр и поддерживаются в идеальном виде благодаря собственной автомойке.' },
          { icon: '/media/site/feat-wash.png', title: 'Собственный пункт мойки', text: 'Мы гарантируем безупречную чистоту автомобиля перед каждой арендой — потому что любим, когда нашим клиентам приятно путешествовать.' },
          { icon: '/media/site/feat-icon3.svg', title: 'Гайд по лучшим местам', text: 'При аренде авто вы получаете персональный гайд с проверенными локациями: от живописных пляжей до скрытых кафе и фотогеничных уголков города.' },
          { icon: '/media/site/feat-icon5.svg', title: 'Комфорт в деталях', text: 'В каждом автомобиле есть бутилированная вода, салфетки, зарядные кабели и зонт — чтобы вы чувствовали себя комфортно с первых минут пути.' },
          { icon: '/media/site/feat-icon6.svg', title: 'Экипировка мотоцикла', text: 'Каждый мотоцикл укомплектован надёжным держателем для телефона и качественным шлемом — для вашего удобства и полной свободы во время поездки.' },
        ],
        videoUrl: '',
        videoIndex: 2,
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
      label: 'Отзывы',
      fields: {
        heading: { type: 'text', label: 'Заголовок (опц.)' },
        anchorId: { type: 'text', label: 'Якорь для меню (напр. reviews)' },
        textReviews: {
          type: 'array',
          label: 'Текстовые отзывы',
          arrayFields: {
            name: { type: 'text', label: 'Имя' },
            rating: { type: 'number', label: 'Оценка (1–5)', min: 1, max: 5 },
            text: { type: 'textarea', label: 'Текст отзыва' },
            avatar: imageField('Аватар'),
          },
          defaultItemProps: { name: '', rating: 5, text: '', avatar: '' },
          getItemSummary: (item, index) => item.name || `Отзыв ${(index ?? 0) + 1}`,
        },
        mediaReviews: {
          type: 'array',
          label: 'Медиа-отзывы (видео / фото)',
          arrayFields: {
            videoUrl: { type: 'text', label: 'Видео — ссылка YouTube' },
            photo: imageField('Фото / скриншот'),
            caption: { type: 'text', label: 'Подпись (опц.)' },
          },
          defaultItemProps: { videoUrl: '', photo: '', caption: '' },
          getItemSummary: (item, index) =>
            item.caption || (item.videoUrl ? 'Видео' : `Медиа ${(index ?? 0) + 1}`),
        },
      },
      defaultProps: {
        heading: 'Отзывы',
        anchorId: 'reviews',
        textReviews: [],
        mediaReviews: [],
      },
      render: ReviewsCarousel,
    },
    SiteHeader: {
      label: 'Шапка сайта',
      fields: {
        logoText: { type: 'text', label: 'Логотип — текст' },
        logoImage: imageField('Логотип — изображение'),
        links: {
          type: 'array',
          label: 'Меню',
          arrayFields: {
            label: { type: 'text', label: 'Название' },
            href: { type: 'text', label: 'Ссылка' },
          },
          defaultItemProps: { label: '', href: '' },
          getItemSummary: (item) => item.label || 'Пункт',
        },
        phone: { type: 'text', label: 'Телефон' },
        whatsapp: { type: 'text', label: 'WhatsApp — ссылка' },
        telegram: { type: 'text', label: 'Telegram — ссылка' },
        instagram: { type: 'text', label: 'Instagram — ссылка' },
      },
      defaultProps: {
        logoText: 'SHIBA CARS',
        logoImage: '',
        links: [
          { label: 'Автомобили', href: '#car' },
          { label: 'Байки', href: '#bike' },
          { label: 'Отзывы', href: '#reviews' },
          { label: 'Контакты', href: '#contacts' },
        ],
        phone: '+66959657805',
        whatsapp: 'https://wa.me/66959657805',
        telegram: 'https://t.me/ShibaCars_Phuket',
        instagram: 'https://www.instagram.com/shibacars_phuket',
      },
      render: SiteHeader,
    },
    Footer: {
      label: 'Футер',
      fields: {
        phone: { type: 'text', label: 'Телефон' },
        email: { type: 'text', label: 'Email' },
        whatsapp: { type: 'text', label: 'WhatsApp — ссылка' },
        telegram: { type: 'text', label: 'Telegram — ссылка' },
        instagram: { type: 'text', label: 'Instagram — ссылка' },
        mapUrl: { type: 'text', label: 'Карта — ссылка' },
        links: {
          type: 'array',
          label: 'Навигация',
          arrayFields: {
            label: { type: 'text', label: 'Название' },
            href: { type: 'text', label: 'Ссылка' },
          },
          defaultItemProps: { label: '', href: '' },
          getItemSummary: (item) => item.label || 'Пункт',
        },
        note: { type: 'textarea', label: 'Примечание' },
      },
      defaultProps: {
        phone: '+66959657805',
        email: 'shibacars@gmail.com',
        whatsapp: 'https://wa.me/66959657805',
        telegram: 'https://t.me/ShibaCars_Phuket',
        instagram: 'https://www.instagram.com/shibacars_phuket',
        mapUrl: 'https://maps.app.goo.gl/eAvKTvF2KHJjC9ds8',
        links: [
          { label: 'Автомобили', href: '#car' },
          { label: 'Байки', href: '#bike' },
          { label: 'Отзывы', href: '#reviews' },
        ],
        note: '',
      },
      render: Footer,
    },
    LeadForm: {
      label: 'Форма заявки',
      fields: {
        heading: { type: 'text', label: 'Заголовок' },
        text: { type: 'textarea', label: 'Текст' },
        buttonLabel: { type: 'text', label: 'Текст кнопки' },
        successMessage: { type: 'text', label: 'Сообщение после отправки' },
        endpoint: { type: 'text', label: 'Endpoint (URL приёма заявок)' },
      },
      defaultProps: {
        heading: 'Забронировать',
        text: 'Подача автомобиля в течение 2 часов',
        buttonLabel: 'Отправить заявку',
        successMessage: 'Спасибо! Мы скоро свяжемся с вами.',
        endpoint: '',
      },
      render: LeadForm,
    },
    VehicleCatalog: {
      label: 'Каталог ТС',
      fields: {
        heading: { type: 'text', label: 'Заголовок' },
        vehicleType: {
          type: 'radio',
          label: 'Тип',
          options: [
            { label: 'Автомобили', value: 'car' },
            { label: 'Байки', value: 'motorcycle' },
          ],
        },
        catalogUrl: { type: 'text', label: 'Ссылка на полный каталог' },
      },
      defaultProps: {
        heading: 'Автомобили',
        vehicleType: 'car',
        catalogUrl: '',
      },
      render: VehicleCatalog,
    },
    MapContacts: {
      label: 'Карта + контакты',
      fields: {
        heading: { type: 'text', label: 'Заголовок' },
        anchorId: { type: 'text', label: 'Якорь для меню (напр. contacts)' },
        mapEmbedUrl: { type: 'textarea', label: 'Google Maps — ссылка embed (…/maps/embed?pb=…)' },
        phone: { type: 'text', label: 'Телефон' },
        email: { type: 'text', label: 'Email' },
        address: { type: 'textarea', label: 'Адрес' },
        whatsapp: { type: 'text', label: 'WhatsApp — ссылка' },
        telegram: { type: 'text', label: 'Telegram — ссылка' },
        instagram: { type: 'text', label: 'Instagram — ссылка' },
      },
      defaultProps: {
        heading: 'Контакты',
        anchorId: 'contacts',
        mapEmbedUrl:
          'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3674.4538436663242!2d98.361052!3d7.858001000000001!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30502f7913f0e6e7%3A0x75b4dc07a4f93826!2sShiba%20Cars%20Carwash%20%26%20Detailing!5e1!3m2!1sru!2sru!4v1748868294470!5m2!1sru!2sru',
        phone: '+66959657805',
        email: 'shibacars@gmail.com',
        address: '24/31 Wichit, Mueang District, Phuket 83000, Thailand',
        whatsapp: 'https://wa.me/66959657805',
        telegram: 'https://t.me/ShibaCars_Phuket',
        instagram: 'https://www.instagram.com/shibacars_phuket',
      },
      render: MapContacts,
    },
  },
};

// Exported as the loose `Config` type so consumers' <Puck>/<Render> accept it
// directly (a strongly-typed Config<Props, RootProps> isn't assignable because
// Puck's render prop is invariant). Authoring safety is kept via internalConfig.
export const puckConfig = internalConfig as unknown as Config;
