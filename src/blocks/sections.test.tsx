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
  it('renders one card per non-empty review', () => {
    const { container } = render(
      <ReviewsCarousel
        reviews={[
          { name: 'Иван', rating: 5, text: 'Отлично' },
          { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
          { name: '', text: '' }, // empty → dropped
        ]}
      />,
    );
    expect(container.querySelectorAll('.sb-review').length).toBe(2);
  });

  it('embeds a YouTube poster for a video review', () => {
    const { container } = render(
      <ReviewsCarousel reviews={[{ videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }]} />,
    );
    const poster = container.querySelector('.sb-video__poster img') as HTMLImageElement | null;
    expect(poster?.src).toContain('img.youtube.com/vi/dQw4w9WgXcQ');
  });

  it('renders stars for the rating', () => {
    const { container } = render(<ReviewsCarousel reviews={[{ name: 'A', rating: 4 }]} />);
    expect(container.querySelector('.sb-review__stars')?.getAttribute('aria-label')).toBe('4 из 5');
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

  it('renders a video in the media column (no image needed)', () => {
    const { container } = render(
      <AboutPromo heading="H" videoUrl="https://youtu.be/dQw4w9WgXcQ" />,
    );
    expect(container.querySelector('.sb-about__grid')).not.toBeNull();
    expect(container.querySelector('.sb-video__poster')).not.toBeNull();
  });
});
