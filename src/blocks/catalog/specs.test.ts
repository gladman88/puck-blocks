import { describe, expect, it } from 'vitest';
import { buildSpecRows } from './specs';

const rows = (d: Parameters<typeof buildSpecRows>[0], locale: 'ru' | 'en' = 'ru') =>
  buildSpecRows(d, locale).map((r) => [r.label, r.value.replace(/\s/g, ' ')]);
// ↑ Intl (ru) groups thousands with a no-break space and the unit is glued with
// one too; the assertions compare text, the glue is pinned separately below.

describe('buildSpecRows', () => {
  it('petrol car: engine with boost, units, locale decimal comma', () => {
    expect(
      rows({
        vehicle_type: 'car', fuel_type: 'petrol', transmission: 'automatic', drive_type: 'rwd',
        body_type: 'cabriolet', seats: 4, engine_volume_l: '2.0', forced_induction: 'turbo',
        horse_power_hp: 258, sprint_0_100_s: '6.2', max_speed_kmh: 250, clearance_mm: 123,
        weight_kg: 1715, tank_volume_l: '59.0', fuel_consumption_l_100km: '6.2',
      }),
    ).toEqual([
      ['Двигатель', '2,0 л, турбо'],
      ['Мощность', '258 л.с.'],
      ['Топливо', 'Бензин'],
      ['КПП', 'Автомат'],
      ['Привод', 'Задний'],
      ['Кузов', 'Кабриолет'],
      ['Мест', '4'],
      ['Разгон 0–100', '6,2 с'],
      ['Макс. скорость', '250 км/ч'],
      ['Клиренс', '123 мм'],
      ['Масса', '1 715 кг'],
      ['Бак', '59 л'],
      ['Расход', '6,2 л/100 км'],
    ]);
  });

  it('no boost suffix for a naturally aspirated engine', () => {
    expect(rows({ vehicle_type: 'car', engine_volume_l: '1.2', forced_induction: 'none' }))
      .toEqual([['Двигатель', '1,2 л']]);
  });

  it('electric car: battery takes the engine slot, no fuel-only rows', () => {
    expect(
      rows({
        vehicle_type: 'car', fuel_type: 'electric', battery_kwh: '66.0', range_km: 470,
        horse_power_hp: 489, power_consumption_kwh_100km: null, tank_volume_l: null,
      }).slice(0, 3),
    ).toEqual([
      ['Батарея', '66 кВт·ч'],
      ['Мощность', '489 л.с.'],
      ['Топливо', 'Электро'],
    ]);
  });

  it('plug-in hybrid: engine first, battery further down, localized fuel', () => {
    const r = rows({
      vehicle_type: 'car', fuel_type: 'plug_in_hybrid', engine_volume_l: '1.5',
      battery_kwh: '26.6', range_km: 150,
    });
    expect(r[0]).toEqual(['Двигатель', '1,5 л']);
    expect(r).toContainEqual(['Топливо', 'Гибрид с зарядкой']);
    expect(r).toContainEqual(['Батарея', '26,6 кВт·ч']);
    expect(r).toContainEqual(['Запас хода', '150 км']);
  });

  it('motorcycle: engine in cc, English units', () => {
    expect(
      rows({ vehicle_type: 'motorcycle', engine_volume_cc: 745, body_type: 'maxi_scooter', horse_power_hp: 59 }, 'en'),
    ).toEqual([
      ['Engine', '745 cc'],
      ['Power', '59 hp'],
      ['Body', 'Maxi-scooter'],
    ]);
  });

  it('number and unit never wrap apart', () => {
    expect(buildSpecRows({ vehicle_type: 'car', horse_power_hp: 258 }, 'ru')[0].value).toBe('258\u00a0л.с.');
  });

  it('empty values are hidden, not shown as 0 or null', () => {
    expect(rows({ vehicle_type: 'car', seats: null, horse_power_hp: '', sprint_0_100_s: undefined })).toEqual([]);
  });
});
