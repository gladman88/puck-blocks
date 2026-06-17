import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatCounters } from './StatCounters';
import { FeatureCards } from './FeatureCards';
import { TermsAccordion } from './TermsAccordion';
import { ReviewsCarousel } from './ReviewsCarousel';
import { AboutPromo } from './AboutPromo';

describe('StatCounters', () => {
  it('renders one card per item', () => {
    const { container } = render(
      <StatCounters items={[{ value: '40+', text: 'машин' }, { value: '35+', text: 'байков' }]} />,
    );
    expect(container.querySelectorAll('.sb-stat').length).toBe(2);
    expect(container.textContent).toContain('40+');
  });
});

describe('FeatureCards', () => {
  it('renders titles and drops a javascript: icon URL', () => {
    const { container } = render(
      <FeatureCards
        items={[
          { icon: 'javascript:alert(1)', title: 'Безопасно', text: 't' },
          { icon: 'https://cdn/x.svg', title: 'С иконкой', text: 't' },
        ]}
      />,
    );
    const imgs = container.querySelectorAll('img.sb-feature__icon');
    expect(imgs.length).toBe(1); // unsafe icon dropped, safe one kept
    expect(imgs[0].getAttribute('src')).toBe('https://cdn/x.svg');
    expect(container.querySelectorAll('.sb-feature').length).toBe(2);
  });
});

describe('TermsAccordion', () => {
  it('renders a <details> per item', () => {
    const { container } = render(
      <TermsAccordion items={[{ title: 'A', content: 'a' }, { title: 'B', content: 'b' }]} />,
    );
    expect(container.querySelectorAll('details.sb-term').length).toBe(2);
    expect(container.querySelector('summary')?.textContent).toBe('A');
  });
});

describe('ReviewsCarousel', () => {
  it('drops images with unsafe src', () => {
    const { container } = render(
      <ReviewsCarousel
        images={[{ src: 'javascript:evil' }, { src: 'https://cdn/a.jpg' }, { src: '/local/b.jpg' }]}
      />,
    );
    expect(container.querySelectorAll('img.sb-reviews__img').length).toBe(2);
  });
});

describe('AboutPromo', () => {
  it('renders without grid when there is no image', () => {
    const { container } = render(<AboutPromo heading="H" text="t" />);
    expect(container.querySelector('.sb-about__grid')).toBeNull();
    expect(container.querySelector('.sb-h2')?.textContent).toBe('H');
  });

  it('adds the reverse modifier when image is on the left', () => {
    const { container } = render(
      <AboutPromo heading="H" image="https://cdn/x.jpg" imagePosition="left" />,
    );
    expect(container.querySelector('section.sb-about--reverse')).not.toBeNull();
    expect(container.querySelector('img.sb-about__img')?.getAttribute('src')).toBe('https://cdn/x.jpg');
  });
});
