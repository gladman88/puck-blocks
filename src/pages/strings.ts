import { pluralDays } from '../blocks/catalog/dates';

/** ru «от 1 дня / от 3 дней / от 21 дня» — genitive after «от». */
function fromDaysRu(n: number): string {
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  return `${n} ${a === 1 && b !== 11 ? 'дня' : 'дней'}`;
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  const word = a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  return `${n} ${word}`;
}

/** Strings of the model / category page components (ru + en). */
export const PAGE_STRINGS = {
  ru: {
    rentInPhuket: 'аренда на Пхукете',
    baseTrim: 'Базовая',
    trims: 'Комплектации',
    seatsCount: (n: number) => pluralRu(n, 'место', 'места', 'мест'),
    from: 'от',
    perDay: '/ сутки',
    priceNote: (minDays: number | null, maxDay: string | null) =>
      [
        minDays && minDays > 1 ? `при аренде от ${fromDaysRu(minDays)}` : null,
        maxDay ? `за 1 день — ${maxDay} ฿` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    onRequest: 'Цена по запросу',
    days: (n: number) => pluralDays(n, 'ru'),
    deposit: 'Депозит',
    or: 'или',
    book: 'Забронировать',
    ask: 'Задать вопрос',
    trust: ['Подача за 2 часа', 'Официальный договор', 'Поддержка на русском'],
    statusFree: 'Свободна сейчас',
    statusFreesOn: (date: string) => `Освободится ${date}`,
    gallery: 'Фото',
    prevPhoto: 'Предыдущее фото',
    nextPhoto: 'Следующее фото',
    photoN: (n: number) => `Фото ${n}`,
    breadcrumbs: 'Навигационная цепочка',
    about: 'О модели',
    keyFacts: 'Главное',
    factRangeEv: 'на одном заряде',
    factRange: 'запас хода',
    factConsumption: 'расход',
    factPower: 'мощность',
    factSprint: 'до 100 км/ч',
    factSeats: 'мест в салоне',
    specs: 'Характеристики',
    groupEngine: 'Двигатель и запас хода',
    groupDynamics: 'Динамика',
    groupBody: 'Кузов и салон',
    seatsRow: 'Мест',
    perDayRow: 'В сутки',
    monthRow: '30 дней',
    freeRow: 'Свободна',
    freeNow: 'сейчас',
    freeFrom: (date: string) => `с ${date}`,
    busy: 'занята',
    choose: 'Выбрать',
    chosen: 'Выбрана',
    modelsCount: (n: number) => pluralRu(n, 'модель', 'модели', 'моделей'),
    statsPrice: (minDays: number | null) =>
      `/ сутки${minDays && minDays > 1 ? ` при аренде от ${fromDaysRu(minDays)}` : ''}`,
    statsFree: (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'свободна' : 'свободны'} сегодня`,
    categories: 'Категории',
    seasonPrices: 'Цены по сезонам',
    helpTitle: 'Поможем выбрать',
    helpText: 'Расскажите, сколько вас и куда планируете ездить, — подберём машину и пришлём свободные даты.',
    groupStats: (n: number, price: string | null) =>
      [pluralRu(n, 'модель', 'модели', 'моделей'), price ? `от ${price} ฿` : null].filter(Boolean).join(' · '),
    allOf: (_label: string, n: number) => `Смотреть все · ${n}`,
  },
  en: {
    rentInPhuket: 'rental in Phuket',
    baseTrim: 'Standard',
    trims: 'Trims',
    seatsCount: (n: number) => `${n} ${n === 1 ? 'seat' : 'seats'}`,
    from: 'from',
    perDay: '/ day',
    priceNote: (minDays: number | null, maxDay: string | null) =>
      [
        minDays && minDays > 1 ? `for rentals of ${minDays}+ days` : null,
        maxDay ? `1 day — ${maxDay} ฿` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    onRequest: 'Price on request',
    days: (n: number) => pluralDays(n, 'en'),
    deposit: 'Deposit',
    or: 'or',
    book: 'Book',
    ask: 'Ask a question',
    trust: ['Delivery in 2 hours', 'Official rental contract', 'Support in Russian and English'],
    statusFree: 'Available now',
    statusFreesOn: (date: string) => `Free from ${date}`,
    gallery: 'Photos',
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    photoN: (n: number) => `Photo ${n}`,
    breadcrumbs: 'Breadcrumbs',
    about: 'About the model',
    keyFacts: 'Key facts',
    factRangeEv: 'on one charge',
    factRange: 'range',
    factConsumption: 'consumption',
    factPower: 'power',
    factSprint: '0–100 km/h',
    factSeats: 'seats',
    specs: 'Specifications',
    groupEngine: 'Engine and range',
    groupDynamics: 'Performance',
    groupBody: 'Body and interior',
    seatsRow: 'Seats',
    perDayRow: 'Per day',
    monthRow: '30 days',
    freeRow: 'Available',
    freeNow: 'now',
    freeFrom: (date: string) => `from ${date}`,
    busy: 'booked',
    choose: 'Choose',
    chosen: 'Chosen',
    modelsCount: (n: number) => `${n} ${n === 1 ? 'model' : 'models'}`,
    statsPrice: (minDays: number | null) =>
      `/ day${minDays && minDays > 1 ? ` for rentals of ${minDays}+ days` : ''}`,
    statsFree: (n: number) => `${n} available today`,
    categories: 'Categories',
    seasonPrices: 'Prices by season',
    helpTitle: 'Need help choosing?',
    helpText: 'Tell us how many of you there are and where you plan to go — we will suggest a car and send free dates.',
    groupStats: (n: number, price: string | null) =>
      [`${n} ${n === 1 ? 'model' : 'models'}`, price ? `from ${price} ฿` : null].filter(Boolean).join(' · '),
    allOf: (_label: string, n: number) => `See all · ${n}`,
  },
} as const;

export type PageStrings = (typeof PAGE_STRINGS)['ru'] | (typeof PAGE_STRINGS)['en'];
