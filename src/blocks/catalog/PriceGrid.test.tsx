import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { PriceGrid, periodLabel, seasonLabel, type PricingPeriod, type PricingSeason } from './PriceGrid';

afterEach(cleanup);

const NB = '\u00a0';
const REF = '2026-11-04';
const PERIODS: PricingPeriod[] = [
  { min_days: 1, max_days: 1 },
  { min_days: 2, max_days: 3 },
  { min_days: 4, max_days: 7 },
  { min_days: 8, max_days: 14 },
  { min_days: 15, max_days: 27 },
  { min_days: 28, max_days: null },
];
const SEASONS: PricingSeason[] = [
  { start_date: '2026-11-01', end_date: '2026-11-30', prices: ['2200.00', '2000.00', '1800.00', '1700.00', '1600.00', '1400.00'] },
  { start_date: '2026-12-01', end_date: '2026-12-31', prices: ['17000.00', '1666.01', '1666.67', null, '1600.00', '1500.00'] },
];

const rows = () => Array.from(document.querySelectorAll('.sb-pgrid__table tbody tr'));
const cells = (tr: Element) => Array.from(tr.querySelectorAll('td')).map((c) => c.textContent);

describe('PriceGrid', () => {
  it('rows are seasons, columns are periods', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    const head = Array.from(document.querySelectorAll('.sb-pgrid__table thead th')).map((th) => th.textContent);
    expect(head).toEqual(['Сезон', '1 день', '2–3', '4–7', '8–14', '15–27', '28+']);
    expect(rows()).toHaveLength(2);
    expect(cells(rows()[0])).toEqual([`2${NB}200`, `2${NB}000`, `1${NB}800`, `1${NB}700`, `1${NB}600`, `1${NB}400`]);
    // Headers are real table headers (columns and the season row label).
    expect(within(rows()[0] as HTMLElement).getByRole('rowheader').textContent).toBe('Ноябрь2026');
    expect(screen.getByRole('table', { name: /Цены по сезонам/ })).toBeTruthy();
    // The last (longest) period is gold in every row.
    for (const tr of rows()) {
      const tds = tr.querySelectorAll('td');
      expect(tds[tds.length - 1].classList.contains('is-best')).toBe(true);
      expect(tds[0].classList.contains('is-best')).toBe(false);
    }
  });

  it('showLabel: caption shown by default, hidden on false — the table keeps its name', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    expect(document.querySelector('.sb-pgrid > .sb-vd__lab')?.textContent).toBe('Цены по сезонам · за сутки, ฿');
    cleanup();
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="en" showLabel={false} />);
    expect(document.querySelector('.sb-pgrid .sb-vd__lab')).toBeNull();
    expect(screen.getByRole('table', { name: 'Prices by season · per day, ฿' })).toBeTruthy();
  });

  it('current season row highlighted, no badge', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    expect(rows()[0].classList.contains('is-now')).toBe(true);
    expect(rows()[1].classList.contains('is-now')).toBe(false);
    // Only the month and the year in the label — no «сейчас» tag.
    expect(rows()[0].querySelector('th')!.children).toHaveLength(1);
    expect(document.querySelector('.sb-pgrid')!.textContent).not.toMatch(/сейчас|текущ/i);
  });

  it('highlights the season containing the reference date, not just the first row', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate="2026-12-20" locale="ru" />);
    expect(rows().map((tr) => tr.classList.contains('is-now'))).toEqual([false, true]);
    cleanup();
    // Season bounds are inclusive.
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate="2026-11-30" locale="ru" />);
    expect(rows().map((tr) => tr.classList.contains('is-now'))).toEqual([true, false]);
  });

  it('first season in the future → no highlight', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate="2026-10-15" locale="ru" />);
    expect(rows()).toHaveLength(2);
    expect(document.querySelector('.sb-pgrid tr.is-now')).toBeNull();
    cleanup();
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={null} locale="ru" />);
    expect(document.querySelector('.sb-pgrid tr.is-now')).toBeNull();
  });

  it('prices rounded up to whole baht', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    const dec = cells(rows()[1]);
    expect(dec[0]).toBe(`17${NB}000`);
    expect(dec[1]).toBe(`1${NB}667`); // 1666.01 → up
    expect(dec[2]).toBe(`1${NB}667`);
    expect(document.querySelector('.sb-pgrid')!.textContent).not.toMatch(/\.\d/);
  });

  it('missing price shows dash', () => {
    render(
      <PriceGrid
        periods={PERIODS}
        referenceDate={REF}
        seasons={[...SEASONS, { start_date: '2027-01-01', end_date: '2027-01-31', prices: ['2000.00'] }]}
        locale="ru"
      />,
    );
    expect(cells(rows()[1])[3]).toBe('—');
    // A shorter prices array: the missing columns are dashes, the row keeps its width.
    expect(cells(rows()[2])).toEqual([`2${NB}000`, '—', '—', '—', '—', '—']);
  });

  it('month and year on two lines', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    const th = rows()[1].querySelector('th')!;
    expect(th.firstChild?.textContent).toBe('Декабрь');
    expect(th.querySelector('small')?.textContent).toBe('2026');
  });

  it('multi-month season label', () => {
    expect(seasonLabel('2026-12-01', '2027-02-28', 'ru')).toEqual({ name: 'дек – фев', years: '2026–2027' });
    expect(seasonLabel('2027-03-01', '2027-04-30', 'ru')).toEqual({ name: 'мар – апр', years: '2027' });
    // Part of a month — days, so two seasons in one month never share a label.
    expect(seasonLabel('2026-12-01', '2026-12-15', 'ru')).toEqual({ name: '1–15 дек', years: '2026' });
    expect(seasonLabel('2026-12-20', '2027-01-10', 'en')).toEqual({ name: '20 Dec – 10 Jan', years: '2026–2027' });
    render(
      <PriceGrid
        periods={PERIODS}
        referenceDate={REF}
        seasons={[{ start_date: '2026-12-01', end_date: '2027-02-28', prices: SEASONS[0].prices }]}
        locale="ru"
      />,
    );
    const th = rows()[0].querySelector('th')!;
    expect(th.firstChild?.textContent).toBe('дек – фев');
    expect(th.querySelector('small')?.textContent).toBe('2026–2027');
  });

  it('en strings', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="en" />);
    const root = document.querySelector('.sb-pgrid')!;
    expect(root.querySelector('.sb-vd__lab')?.textContent).toBe('Prices by season · per day, ฿');
    const head = Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(head).toEqual(['Season', '1 day', '2–3', '4–7', '8–14', '15–27', '28+']);
    expect(rows()[0].querySelector('th')!.firstChild?.textContent).toBe('November');
    expect(root.querySelector('.sb-pgrid__legend')?.textContent).toBe(
      'Column — length of the whole rental in days, row — season. If a rental spans two seasons, the days of each season are charged at its price.',
    );
    expect(root.textContent).not.toMatch(/[а-яё]/i);
  });

  it('ru heading and the one-line legend, no example block', () => {
    render(<PriceGrid periods={PERIODS} seasons={SEASONS} referenceDate={REF} locale="ru" />);
    const root = document.querySelector('.sb-pgrid')!;
    expect(root.querySelector('.sb-vd__lab')?.textContent).toBe('Цены по сезонам · за сутки, ฿');
    expect(root.querySelector('.sb-pgrid__legend')?.textContent).toBe(
      'Столбец — срок всей аренды в днях, строка — сезон. Если аренда захватывает два сезона, дни каждого сезона считаются по его цене.',
    );
    expect(root.querySelectorAll('p')).toHaveLength(2);
    expect(root.textContent).not.toMatch(/Пример/);
  });

  it('nothing to show → renders nothing', () => {
    const { container } = render(<PriceGrid periods={PERIODS} seasons={[]} referenceDate={REF} locale="ru" />);
    expect(container.firstChild).toBeNull();
  });

  it('period labels', () => {
    expect(periodLabel({ min_days: 1, max_days: 1 }, 'ru')).toBe('1 день');
    expect(periodLabel({ min_days: 1, max_days: 29 }, 'en')).toBe('1–29');
    expect(periodLabel({ min_days: 30, max_days: null }, 'en')).toBe('30+');
  });
});
