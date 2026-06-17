import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero URL sanitization (public-page XSS guard)', () => {
  it('drops a javascript: CTA href (no link rendered)', () => {
    const { container, queryByText } = render(
      <Hero heading="Title" ctaLabel="Click" ctaHref="javascript:alert(1)" />,
    );
    expect(container.querySelector('a')).toBeNull();
    expect(queryByText('Click')).toBeNull();
  });

  it('renders a safe https CTA href', () => {
    const { container } = render(
      <Hero heading="Title" ctaLabel="Click" ctaHref="https://example.com/book" />,
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com/book');
  });

  it('allows relative / anchor / mailto / tel hrefs', () => {
    for (const href of ['/contact', '#book', 'mailto:x@y.com', 'tel:+66123']) {
      const { container, unmount } = render(<Hero heading="t" ctaLabel="c" ctaHref={href} />);
      expect(container.querySelector('a')?.getAttribute('href')).toBe(href);
      unmount();
    }
  });

  it('drops a javascript: background image (falls back to colour, no url())', () => {
    const { container } = render(<Hero heading="t" backgroundImage="javascript:evil()" />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.style.backgroundImage).toBe('');
  });

  it('renders a safe background image as a quoted url()', () => {
    const { container } = render(<Hero heading="t" backgroundImage="https://cdn.example/x.jpg" />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.style.backgroundImage).toContain('url(');
    expect(section.style.backgroundImage).toContain('x.jpg');
  });
});
