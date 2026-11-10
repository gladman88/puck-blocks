import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import type { CatalogVehicle } from '../blocks/VehicleCatalog';
import {
  CategoryHeader,
  MobileBookingBar,
  ModelGrid,
  ModelHero,
  ModelOverview,
  ModelPageProvider,
  SpecGroups,
  TrimCompare,
  buildVersions,
  defaultVersion,
  type CatalogCategoryPage,
  type CatalogModelPage,
  type CatalogModelPageDetail,
  type CatalogModelUnit,
  type PageBookingConfig,
} from './index';

const NB = ' ';
const TODAY = '2026-11-10';

beforeEach(() => {
  // The booking window loads the vehicle detail — keep it pending.
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
  // jsdom has no scrollIntoView («Выбрать» of the trims scrolls to the hero).
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const booking: PageBookingConfig = { apiBase: '', botUsername: 'shiba_bot' };

function unit(over: Partial<CatalogModelUnit> = {}): CatalogModelUnit {
  return {
    id: 'u1',
    display_name: 'Zeekr 009',
    brand: 'Zeekr',
    model: '009',
    color: 'green',
    photo_url: '/media/u1.jpg',
    vehicle_type: 'car',
    year: 2026,
    category: { id: 'c1', name: 'Премиум', name_en: 'Premium', color: '#fc3' },
    min_price_per_day: 4334,
    is_available: true,
    free_from: null,
    free_from_time: null,
    trim: '',
    vehicle_model: { id: 1, slug: 'zeekr-009' },
    card_prices: {
      per_day_min: '4333.33',
      per_day_max: '7000.00',
      quotes: [
        { days: 7, total: '42000.00' },
        { days: 14, total: '77000.00' },
        { days: 30, total: '130000.00' },
      ],
      month_discount_pct: 38,
    },
    pricing_periods: [
      { min_days: 1, max_days: 1 },
      { min_days: 2, max_days: 27 },
      { min_days: 28, max_days: null },
    ],
    pricing_seasons: [{ start_date: '2026-11-01', end_date: '2026-12-15', prices: ['7000', '5000', '4333.33'] }],
    fuel_type: 'electric',
    body_type: 'minivan',
    seats: 7,
    battery_kwh: '116',
    horse_power_hp: 603,
    range_km: 686,
    sprint_0_100_s: '4.5',
    gallery_images: [
      { image_url: '/i/1.jpg', thumb_url: '/t/1.jpg', display_url: '/d/1.jpg', position: 0 },
      { image_url: '/i/2.jpg', thumb_url: '/t/2.jpg', display_url: '/d/2.jpg', position: 1 },
    ],
    deposits: [
      { currency_code: 'USD', amount: '1000' },
      { currency_code: 'THB', amount: '30000.00' },
    ],
    ...over,
  };
}

function model(units: CatalogModelUnit[], over: Partial<CatalogModelPageDetail> = {}): CatalogModelPageDetail {
  return {
    slug: 'zeekr-009',
    brand: 'Zeekr',
    name: '009',
    label: 'Zeekr 009',
    vehicle_type: 'car',
    category: { id: 'c1', slug: 'premium', name: 'Премиум', name_en: 'Premium' },
    photo_url: '/media/u1.jpg',
    price_from_per_day: '4333.33',
    price_from_min_days: 28,
    vehicle_count: units.length,
    available_today_count: units.filter((u) => u.is_available).length,
    has_text_ru: true,
    has_text_en: true,
    updated_at: '2026-11-10T00:00:00Z',
    description_ru: 'Электрический минивэн.',
    description_en: 'Electric minivan.',
    meta_description_ru: '',
    meta_description_en: '',
    units,
    similar: [],
    ...over,
  };
}

function renderPage(m: CatalogModelPageDetail, locale: 'ru' | 'en' = 'ru', children = <ModelHero telegramUrl="https://t.me/x" whatsappUrl="https://wa.me/1" />) {
  return render(
    <ModelPageProvider model={m} locale={locale} booking={booking} today={TODAY}>
      {children}
    </ModelPageProvider>,
  );
}

const busyBase = unit({ id: 'b1', trim: '', is_available: false, free_from: '2026-12-15', seats: 7 });
const freePremium = unit({ id: 'p1', trim: 'Premium', seats: 7, photo_url: '/media/p1.jpg' });
const busyFlagship = unit({ id: 'f1', trim: 'Flagship', is_available: false, free_from: '2026-11-16', seats: 6 });

describe('trims', () => {
  it('default trim — the one free today, else the one freed earliest', () => {
    expect(defaultVersion(buildVersions([busyBase, freePremium, busyFlagship]))?.key).toBe('premium');
    expect(defaultVersion(buildVersions([busyBase, busyFlagship]))?.key).toBe('flagship');

    renderPage(model([busyBase, freePremium, busyFlagship]));
    expect(screen.getByRole('button', { name: /Premium/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /Базовая/ }).getAttribute('aria-pressed')).toBe('false');
  });

  it('no trim → «Базовая», first; subtitle — seats when they differ, else the year', () => {
    renderPage(model([busyBase, freePremium, busyFlagship]));
    const seg = screen.getByRole('group', { name: 'Комплектации' });
    const buttons = within(seg).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Базовая7 мест', 'Flagship6 мест', 'Premium7 мест']);
    cleanup();
    renderPage(model([busyBase, unit({ id: 'p2', trim: 'Premium' })]));
    expect(screen.getByRole('button', { name: /Базовая/ }).textContent).toBe('Базовая2026');
  });

  it('a click on a trim switches the hero to it', () => {
    renderPage(model([busyBase, freePremium]));
    fireEvent.click(screen.getByRole('button', { name: /Базовая/ }));
    expect(screen.getByRole('button', { name: /Базовая/ }).getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('.sb-mp-status')?.textContent).toBe('Освободится 15 декабря');
    expect(document.querySelector('.sb-mp-status')?.className).toContain('sb-mp-status--soon');
    fireEvent.click(screen.getByRole('button', { name: /Premium/ }));
    expect(document.querySelector('.sb-mp-status')?.textContent).toBe('Свободна сейчас');
    expect(document.querySelector('.sb-mp-status')?.className).toBe('sb-mp-status');
  });
});

describe('ModelHero', () => {
  it('h1 holds the model and «аренда на Пхукете»; tags — category, fuel, body', () => {
    renderPage(model([freePremium]));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Zeekr 009 аренда на Пхукете');
    const tags = document.querySelectorAll('.sb-mp-book__tags span');
    expect(Array.from(tags).map((t) => t.textContent)).toEqual(['Премиум', 'Электро', 'Минивэн']);
    // One trim — no switcher.
    expect(screen.queryByRole('group', { name: 'Комплектации' })).toBeNull();
  });

  it('price «от N ฿ / сутки» with the rental condition and the 1-day price', () => {
    renderPage(model([freePremium]));
    expect(document.querySelector('.sb-mp-price b')?.textContent).toBe(`4 334${NB}฿`);
    expect(document.querySelector('.sb-mp-price__note')?.textContent).toBe(
      `при аренде от 28 дней · за 1 день — 7 000${NB}฿`,
    );
    const tiles = Array.from(document.querySelectorAll('.sb-mp-tile')).map((t) => t.textContent);
    expect(tiles).toEqual([`7 дней42 000${NB}฿`, `14 дней77 000${NB}฿`, `−38%30 дней130 000${NB}฿`]);
    expect(document.querySelector('.sb-mp-deposit')?.textContent).toBe(`Депозит30 000${NB}฿или 1 000${NB}USD`);
  });

  it('main photo — fetchpriority high, thumbs — lazy', () => {
    renderPage(model([freePremium]));
    const main = document.querySelector('.sb-mp-gal__main img')!;
    expect(main.getAttribute('fetchpriority')).toBe('high');
    expect(main.getAttribute('src')).toBe('/d/1.jpg');
    const thumbs = document.querySelectorAll('.sb-mp-thumb img');
    expect(thumbs).toHaveLength(2);
    thumbs.forEach((t) => expect(t.getAttribute('loading')).toBe('lazy'));
    fireEvent.click(screen.getByRole('button', { name: 'Следующее фото' }));
    expect(document.querySelector('.sb-mp-gal__main img')?.getAttribute('src')).toBe('/d/2.jpg');
  });

  it('«Забронировать» opens the booking window; ask links come from props', () => {
    renderPage(model([freePremium]));
    expect(screen.getByRole('link', { name: /Telegram/ }).getAttribute('href')).toBe('https://t.me/x');
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toBe('https://wa.me/1');
    expect(document.querySelector('.sb-modal')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Забронировать/ }));
    expect(document.querySelector('.sb-modal')).not.toBeNull();
  });

  it('trust row under the buttons — three items with badges', () => {
    renderPage(model([freePremium]));
    const items = Array.from(document.querySelectorAll('.sb-mp-book .sb-mp-trust li'));
    expect(items.map((li) => li.textContent)).toEqual(['Подача за 2 часа', 'Официальный договор', 'Поддержка на русском']);
    items.forEach((li) => expect(li.querySelector('.sb-mp-badge svg')).not.toBeNull());
  });

  it('en strings', () => {
    renderPage(model([busyBase, freePremium]), 'en');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Zeekr 009 rental in Phuket');
    expect(screen.getByRole('button', { name: /Standard/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Book$/ })).toBeTruthy();
    expect(document.querySelector('.sb-mp-price__note')?.textContent).toBe(
      `for rentals of 28+ days · 1 day — 7 000${NB}฿`,
    );
    expect(screen.getByText('Ask a question')).toBeTruthy();
    expect(Array.from(document.querySelectorAll('.sb-mp-trust li')).map((li) => li.textContent)).toEqual([
      'Delivery in 2 hours',
      'Official rental contract',
      'Support in Russian and English',
    ]);
    expect(document.querySelector('.sb-mp-status')?.textContent).toBe('Available now');
    fireEvent.click(screen.getByRole('button', { name: /Standard/ }));
    expect(document.querySelector('.sb-mp-status')?.textContent).toBe('Free from 15 December');
  });
});

describe('ModelOverview / SpecGroups', () => {
  it('four key figures in order: range, power, 0–100, seats', () => {
    renderPage(model([freePremium]), 'ru', <ModelOverview about={'Первый абзац.\n\nВторой.'} />);
    const facts = Array.from(document.querySelectorAll('.sb-mp-fact')).map((f) => f.textContent);
    expect(facts).toEqual(['686кмна одном заряде', '603л.с.мощность', '4,5сдо 100 км/ч', '7мест в салоне']);
    expect(document.querySelectorAll('.sb-mp-text')).toHaveLength(2);
  });

  it('empty specs are not drawn — neither rows nor columns', () => {
    render(<SpecGroups specs={{ vehicle_type: 'car', body_type: 'sedan', seats: 5 }} locale="ru" />);
    expect(screen.queryByText('Двигатель и запас хода')).toBeNull();
    expect(screen.queryByText('Динамика')).toBeNull();
    expect(screen.getByText('Кузов и салон')).toBeTruthy();
    const rows = Array.from(document.querySelectorAll('.sb-mp-sgroup li')).map((li) => li.textContent);
    expect(rows).toEqual(['КузовСедан', 'Мест5']);
  });

  it('nothing at all — no section', () => {
    const { container } = render(<SpecGroups specs={{ vehicle_type: 'car' }} locale="en" />);
    expect(container.innerHTML).toBe('');
  });
});

describe('TrimCompare', () => {
  it('hidden with one trim', () => {
    renderPage(model([freePremium, unit({ id: 'p9', trim: 'premium ' })]), 'ru', <TrimCompare />);
    expect(document.querySelector('.sb-mp-cmps')).toBeNull();
  });

  it('a card per trim; «Выбрать» selects it', () => {
    renderPage(
      model([busyBase, freePremium]),
      'ru',
      <>
        <ModelHero />
        <TrimCompare />
      </>,
    );
    const cards = document.querySelectorAll('.sb-mp-cmp');
    expect(cards).toHaveLength(2);
    expect(within(cards[0] as HTMLElement).getByText('с 15 дек.')).toBeTruthy();
    expect(Array.from(cards[1].querySelectorAll('li b')).map((b) => b.textContent)).toContain(`4 334 – 7 000${NB}฿`);
    fireEvent.click(within(cards[0] as HTMLElement).getByRole('button', { name: 'Выбрать' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    const seg = screen.getByRole('group', { name: 'Комплектации' });
    expect(within(seg).getByRole('button', { name: /Базовая/ }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('MobileBookingBar', () => {
  it('price of the chosen trim, Telegram, «Забронировать» opens the window', () => {
    renderPage(model([freePremium]), 'ru', <MobileBookingBar telegramUrl="https://t.me/x" />);
    const bar = document.querySelector('.sb-mp-mbar') as HTMLElement;
    expect(bar.textContent).toContain(`4 334${NB}฿`);
    expect(within(bar).getByRole('link', { name: 'Telegram' }).getAttribute('href')).toBe('https://t.me/x');
    fireEvent.click(within(bar).getByRole('button', { name: /Забронировать/ }));
    expect(document.querySelector('.sb-modal')).not.toBeNull();
  });
});

function catVehicle(over: Partial<CatalogVehicle>): CatalogVehicle {
  return {
    id: 'v',
    display_name: 'X',
    brand: 'B',
    model: 'M',
    color: '',
    photo_url: null,
    vehicle_type: 'car',
    year: 2024,
    category: { id: 'c1', name: 'Электрокары', name_en: 'EVs', color: '#0f0' },
    min_price_per_day: 1000,
    is_available: true,
    free_from: null,
    free_from_time: null,
    card_prices: null,
    vehicle_model: null,
    trim: '',
    ...over,
  };
}

describe('ModelGrid', () => {
  const vehicles = [
    catVehicle({ id: 'a1', display_name: 'BYD Seal', vehicle_model: { id: 1, slug: 'byd-seal' }, min_price_per_day: 1400, is_available: false, free_from: '2026-11-20' }),
    catVehicle({ id: 'a2', display_name: 'BYD Seal', vehicle_model: { id: 1, slug: 'byd-seal' }, min_price_per_day: 1500, color: 'white' }),
    catVehicle({ id: 'b1', display_name: 'Zeekr X', vehicle_model: { id: 2, slug: 'zeekr-x' }, min_price_per_day: 1300, is_available: false, free_from: '2026-11-12' }),
    catVehicle({ id: 'c1', display_name: 'Ora', vehicle_model: { id: 3, slug: 'ora' }, min_price_per_day: 900, category: { id: 'c2', name: 'Комфорт', name_en: 'Comfort', color: '#fff' } }),
  ];

  it('one card per model, free first then cheaper, each links to its model page', () => {
    render(<ModelGrid vehicles={vehicles} locale="ru" booking={booking} />);
    const links = Array.from(document.querySelectorAll('a.sb-vcard__open'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/ru/cars/ora', '/ru/cars/byd-seal', '/ru/cars/zeekr-x']);
    // The free unit stands for BYD Seal (2 units, 1 free).
    expect(links[1].getAttribute('aria-label')).toBe('BYD Seal');
    expect(document.querySelectorAll('.sb-vcard')[1].textContent).toContain('1 свободно');
  });

  it('a plain click opens the window instead of following the link', () => {
    render(<ModelGrid vehicles={vehicles} locale="en" booking={booking} categoryId="c1" />);
    const links = Array.from(document.querySelectorAll('a.sb-vcard__open'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/en/cars/byd-seal', '/en/cars/zeekr-x']);
    // fireEvent returns false when the default (navigation) was prevented.
    expect(fireEvent.click(links[0])).toBe(false);
    expect(document.querySelector('.sb-modal')).not.toBeNull();
  });

  it('onlySlugs + limit', () => {
    render(<ModelGrid vehicles={vehicles} locale="ru" booking={booking} onlySlugs={['zeekr-x', 'byd-seal']} limit={1} />);
    expect(Array.from(document.querySelectorAll('a.sb-vcard__open')).map((a) => a.getAttribute('href'))).toEqual([
      '/ru/cars/byd-seal',
    ]);
  });
});

describe('CategoryHeader', () => {
  const cat = (over: Partial<CatalogCategoryPage>): CatalogCategoryPage => ({
    id: 'c1',
    name: 'Электрокары',
    name_en: 'EVs',
    color: '#0f0',
    slug: 'electric',
    h1: '',
    h1_en: '',
    intro: '',
    intro_en: '',
    meta_description: '',
    meta_description_en: '',
    section: 'cars',
    is_published: true,
    has_text_ru: true,
    has_text_en: true,
    ...over,
  });
  const row = (over: Partial<CatalogModelPage>): CatalogModelPage => ({
    slug: 's',
    brand: 'B',
    name: 'N',
    label: 'B N',
    vehicle_type: 'car',
    category: { id: 'c1', slug: 'electric', name: 'Электрокары', name_en: 'EVs' },
    photo_url: null,
    price_from_per_day: '1000.00',
    price_from_min_days: 7,
    vehicle_count: 1,
    available_today_count: 1,
    has_text_ru: true,
    has_text_en: true,
    updated_at: '2026-11-10T00:00:00Z',
    ...over,
  });
  const models = [
    row({ slug: 'a', price_from_per_day: '933.40', price_from_min_days: 28 }),
    row({ slug: 'b', available_today_count: 0 }),
    row({ slug: 'c', category: { id: 'c3', slug: 'comfort', name: 'Комфорт', name_en: 'Comfort' } }),
    row({ slug: 'd', category: { id: 'c4', slug: 'draft', name: 'Черновик', name_en: '' } }),
  ];
  const categories = [
    cat({}),
    cat({ id: 'c3', slug: 'comfort', name: 'Комфорт', name_en: 'Comfort' }),
    cat({ id: 'c4', slug: 'draft', name: 'Черновик', is_published: false }),
    cat({ id: 'c5', slug: 'bikes-cat', name: 'Мото', section: 'bikes' }),
  ];

  it('figures line and links only to published categories of the section', () => {
    render(
      <CategoryHeader
        locale="ru"
        section="cars"
        h1="Аренда электромобилей на Пхукете"
        crumbs={[{ label: 'Главная', href: '/ru' }, { label: 'Электрокары' }]}
        models={models.slice(0, 2)}
        sectionModels={models}
        categories={categories}
        currentSlug="electric"
      />,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Аренда электромобилей на Пхукете');
    const stats = Array.from(document.querySelectorAll('.sb-mc-stats li')).map((li) => li.textContent);
    expect(stats).toEqual(['2 модели', `от 934${NB}฿ / сутки при аренде от 28 дней`, '1 свободна сегодня']);
    const chips = within(screen.getByRole('navigation', { name: 'Категории' })).getAllByRole('link');
    expect(chips.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Электрокары2', '/ru/cars/electric'],
      ['Комфорт1', '/ru/cars/comfort'],
    ]);
    expect(chips[0].getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Главная' }).getAttribute('href')).toBe('/ru');
  });

  it('en strings', () => {
    render(<CategoryHeader locale="en" section="cars" h1="EV rental in Phuket" models={models} categories={categories} />);
    const stats = Array.from(document.querySelectorAll('.sb-mc-stats li')).map((li) => li.textContent);
    expect(stats).toEqual(['4 models', `from 934${NB}฿ / day for rentals of 28+ days`, '3 available today']);
    expect(screen.getByRole('link', { name: /EVs/ }).getAttribute('href')).toBe('/en/cars/electric');
  });
});
