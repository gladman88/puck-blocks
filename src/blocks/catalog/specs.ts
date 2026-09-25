// Vehicle specs for the catalog card, built from the TYPED fields of the API
// (numbers + enums). Units and labels live here, not in the data: the old
// free-text fields ("170 л.с.", "до 100 км/ч: 6,2 сек") are gone from the card
// (backend CD-114), so every value is formatted the same way in both locales.

export type Locale = 'ru' | 'en';

// API shape: DecimalField comes as a string ("2.0"), integers as numbers,
// an empty spec as null.
type Num = number | string | null | undefined;

export interface VehicleSpecs {
  vehicle_type?: string;
  fuel_type?: string;
  transmission?: string;
  drive_type?: string;
  body_type?: string;
  seats?: Num;
  engine_volume_cc?: Num;
  engine_volume_l?: Num;
  forced_induction?: string;
  battery_kwh?: Num;
  range_km?: Num;
  horse_power_hp?: Num;
  max_speed_kmh?: Num;
  sprint_0_100_s?: Num;
  clearance_mm?: Num;
  weight_kg?: Num;
  tank_volume_l?: Num;
  fuel_consumption_l_100km?: Num;
  power_consumption_kwh_100km?: Num;
}

export interface SpecRow {
  key: string;
  label: string;
  value: string;
}

const LABELS: Record<Locale, Record<string, string>> = {
  ru: {
    engine: 'Двигатель',
    battery: 'Батарея',
    power: 'Мощность',
    fuel: 'Топливо',
    transmission: 'КПП',
    drive: 'Привод',
    body: 'Кузов',
    seats: 'Мест',
    range: 'Запас хода',
    sprint: 'Разгон 0–100',
    max_speed: 'Макс. скорость',
    clearance: 'Клиренс',
    weight: 'Масса',
    tank: 'Бак',
    fuel_consumption: 'Расход',
    power_consumption: 'Расход энергии',
  },
  en: {
    engine: 'Engine',
    battery: 'Battery',
    power: 'Power',
    fuel: 'Fuel',
    transmission: 'Transmission',
    drive: 'Drive',
    body: 'Body',
    seats: 'Seats',
    range: 'Range',
    sprint: '0–100',
    max_speed: 'Top speed',
    clearance: 'Clearance',
    weight: 'Weight',
    tank: 'Tank',
    fuel_consumption: 'Consumption',
    power_consumption: 'Energy use',
  },
};

const UNITS: Record<Locale, Record<string, string>> = {
  ru: {
    l: 'л', cc: 'см³', kwh: 'кВт·ч', hp: 'л.с.', kmh: 'км/ч', s: 'с', mm: 'мм',
    kg: 'кг', km: 'км', l100: 'л/100 км', kwh100: 'кВт·ч/100 км',
  },
  en: {
    l: 'L', cc: 'cc', kwh: 'kWh', hp: 'hp', kmh: 'km/h', s: 's', mm: 'mm',
    kg: 'kg', km: 'km', l100: 'L/100 km', kwh100: 'kWh/100 km',
  },
};

// Enum values. `plug_in_hybrid` is NOT a hybrid for the client: it charges from
// a socket (backend FuelType, docs/vehicles.md).
const ENUM_LABELS: Record<Locale, Record<string, string>> = {
  ru: {
    automatic: 'Автомат', manual: 'Механика', cvt: 'Вариатор', robot: 'Робот',
    petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид',
    plug_in_hybrid: 'Гибрид с зарядкой',
    fwd: 'Передний', rwd: 'Задний', awd: 'Полный',
    turbo: 'турбо', bi_turbo: 'би-турбо', supercharger: 'компрессор',
    sedan: 'Седан', hatchback: 'Хэтчбек', liftback: 'Лифтбек', wagon: 'Универсал',
    coupe: 'Купе', cabriolet: 'Кабриолет', roadster: 'Родстер', crossover: 'Кроссовер',
    suv: 'Внедорожник', minivan: 'Минивэн', minibus: 'Микроавтобус', pickup: 'Пикап',
    scooter: 'Скутер', maxi_scooter: 'Максискутер', naked: 'Нейкед', sportbike: 'Спортбайк',
    sport_tourer: 'Спорт-турист', tourer: 'Турист', cruiser: 'Круизер', chopper: 'Чоппер',
    classic: 'Классик', scrambler: 'Скрэмблер', enduro: 'Эндуро', adventure: 'Турэндуро',
    supermoto: 'Мотард',
  },
  en: {
    automatic: 'Automatic', manual: 'Manual', cvt: 'CVT', robot: 'Robot',
    petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid',
    plug_in_hybrid: 'Plug-in hybrid',
    fwd: 'FWD', rwd: 'RWD', awd: 'AWD',
    turbo: 'turbo', bi_turbo: 'bi-turbo', supercharger: 'supercharged',
    sedan: 'Sedan', hatchback: 'Hatchback', liftback: 'Liftback', wagon: 'Wagon',
    coupe: 'Coupe', cabriolet: 'Convertible', roadster: 'Roadster', crossover: 'Crossover',
    suv: 'SUV', minivan: 'Minivan', minibus: 'Minibus', pickup: 'Pickup',
    scooter: 'Scooter', maxi_scooter: 'Maxi-scooter', naked: 'Naked', sportbike: 'Sportbike',
    sport_tourer: 'Sport tourer', tourer: 'Tourer', cruiser: 'Cruiser', chopper: 'Chopper',
    classic: 'Classic', scrambler: 'Scrambler', enduro: 'Enduro', adventure: 'Adventure',
    supermoto: 'Supermoto',
  },
};

function toNumber(v: Num): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function fmt(n: number, locale: Locale, fractionDigits?: number): string {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 1,
  }).format(n);
}

function enumLabel(value: string | undefined, locale: Locale): string | null {
  if (!value) return null;
  return ENUM_LABELS[locale][value.toLowerCase()] ?? value;
}

/** Rows in display order. The first four are the key specs shown without the
 * «Все характеристики» toggle: engine (or battery) → power → fuel → transmission. */
export function buildSpecRows(d: VehicleSpecs, locale: Locale): SpecRow[] {
  const L = LABELS[locale];
  const U = UNITS[locale];
  const rows: SpecRow[] = [];
  const push = (key: string, value: string | null) => {
    if (value) rows.push({ key, label: L[key], value });
  };
  const withUnit = (v: Num, unit: string, digits?: number) => {
    const n = toNumber(v);
    // Non-breaking space: «258 л.с.» must not wrap between the number and the unit.
    return n === null ? null : `${fmt(n, locale, digits)}\u00a0${U[unit]}`;
  };

  const battery = withUnit(d.battery_kwh, 'kwh');
  let engine: string | null;
  if (d.vehicle_type === 'motorcycle') {
    engine = withUnit(d.engine_volume_cc, 'cc');
  } else {
    engine = withUnit(d.engine_volume_l, 'l', 1);
    const boost = d.forced_induction && d.forced_induction !== 'none'
      ? enumLabel(d.forced_induction, locale)
      : null;
    if (engine && boost) engine = `${engine}, ${boost}`;
  }
  // An electric car has no engine volume: its battery takes the engine slot,
  // as the old free-text `engine_volume` ("116.8 кВтч") did.
  if (engine) push('engine', engine);
  else push('battery', battery);

  push('power', withUnit(d.horse_power_hp, 'hp'));
  push('fuel', enumLabel(d.fuel_type, locale));
  push('transmission', enumLabel(d.transmission, locale));
  push('drive', enumLabel(d.drive_type, locale));
  push('body', enumLabel(d.body_type, locale));
  const seats = toNumber(d.seats);
  push('seats', seats === null ? null : fmt(seats, locale));
  if (engine) push('battery', battery);
  push('range', withUnit(d.range_km, 'km'));
  push('sprint', withUnit(d.sprint_0_100_s, 's'));
  push('max_speed', withUnit(d.max_speed_kmh, 'kmh'));
  push('clearance', withUnit(d.clearance_mm, 'mm'));
  push('weight', withUnit(d.weight_kg, 'kg'));
  push('tank', withUnit(d.tank_volume_l, 'l'));
  push('fuel_consumption', withUnit(d.fuel_consumption_l_100km, 'l100'));
  push('power_consumption', withUnit(d.power_consumption_kwh_100km, 'kwh100'));
  return rows;
}
