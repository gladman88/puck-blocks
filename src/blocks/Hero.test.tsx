import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
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

  it('wraps the accent word in a gold span', () => {
    const { container } = render(<Hero heading="Аренда на Пхукете" accentWord="Пхукете" />);
    expect(container.querySelector('.sb-hero__accent')?.textContent).toBe('Пхукете');
  });

  it('second button «Каталог» links to the cars catalog anchor', () => {
    const { container } = render(
      <Hero heading="t" ctaLabel="Забронировать" ctaHref="#leadform" secondaryLabel="Каталог" secondaryHref="#car" />,
    );
    const links = container.querySelectorAll('.sb-hero__cta a');
    expect(Array.from(links).map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Забронировать', '#leadform'],
      ['Каталог', '#car'],
    ]);
    expect(links[1].classList.contains('sb-hero__secondary')).toBe(true);
  });

  it('no second button without its label or with an unsafe link', () => {
    const { container: a } = render(<Hero heading="t" ctaLabel="c" ctaHref="#x" secondaryHref="#car" />);
    expect(a.querySelectorAll('.sb-hero__cta a')).toHaveLength(1);
    const { container: b } = render(<Hero heading="t" ctaLabel="c" ctaHref="#x" secondaryLabel="К" secondaryHref="javascript:alert(1)" />);
    expect(b.querySelectorAll('.sb-hero__cta a')).toHaveLength(1);
  });

  it('no WhatsApp/Telegram buttons by the CTA, even for pages saved with them (header has them)', () => {
    const { container } = render(
      <Hero heading="t" ctaLabel="c" ctaHref="#x" whatsapp="https://wa.me/1" telegram="https://t.me/x" />,
    );
    expect(container.querySelector('.sb-hero__socials')).toBeNull();
    expect(container.querySelectorAll('.sb-hero__cta a')).toHaveLength(1);
  });
});

type Listener = () => void;
function mockMedia(opts: { phone: boolean; reduced?: boolean; legacy?: boolean }) {
  const state = { phone: opts.phone, reduced: Boolean(opts.reduced) };
  const listeners: Record<'phone' | 'reduced', Listener[]> = { phone: [], reduced: [] };
  const spies = { add: vi.fn(), remove: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() };
  window.matchMedia = ((q: string) => {
    const key = q.includes('reduced-motion') ? 'reduced' : 'phone';
    const mql: Record<string, unknown> = {
      get matches() {
        return key === 'phone' ? state.phone : state.reduced;
      },
      media: q,
    };
    if (opts.legacy) {
      mql.addListener = (cb: Listener) => {
        spies.addListener(key, cb);
        listeners[key].push(cb);
      };
      mql.removeListener = (cb: Listener) => {
        spies.removeListener(key, cb);
        listeners[key] = listeners[key].filter((l) => l !== cb);
      };
    } else {
      mql.addEventListener = (_: string, cb: Listener) => {
        spies.add(key, cb);
        listeners[key].push(cb);
      };
      mql.removeEventListener = (_: string, cb: Listener) => {
        spies.remove(key, cb);
        listeners[key] = listeners[key].filter((l) => l !== cb);
      };
    }
    return mql;
  }) as unknown as typeof window.matchMedia;
  return {
    spies,
    listeners,
    set(phone: boolean) {
      state.phone = phone;
      [...listeners.phone].forEach((l) => l());
    },
    setReduced(reduced: boolean) {
      state.reduced = reduced;
      [...listeners.reduced].forEach((l) => l());
    },
  };
}

describe('Hero mobile video', () => {
  let play: ReturnType<typeof vi.spyOn>;
  let pause: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'connection', { configurable: true, value: undefined });
  });
  const props = { heading: 't', mobileVideoHevc: '/media/site-video/a.mp4', mobileVideo: '/media/site-video/b.mp4' };

  it('renders no video element without video props', () => {
    mockMedia({ phone: true });
    const { container } = render(<Hero heading="t" />);
    expect(container.querySelector('video')).toBeNull();
  });

  it('server markup has video without sources', async () => {
    const { renderToString } = await import('react-dom/server');
    const html = renderToString(<Hero {...props} />);
    expect(html).toContain('<video');
    expect(html).not.toContain('<source');
    expect(html).toContain('muted');
    expect(html.toLowerCase()).toContain('playsinline');
    expect(html).toContain('loop');
    expect(html).toContain('preload="none"');
  });

  it('adds hevc then h264 sources on a phone viewport', () => {
    mockMedia({ phone: true });
    const { container } = render(<Hero {...props} />);
    const s = container.querySelectorAll('video source');
    expect(s.length).toBe(2);
    expect(s[0].getAttribute('type')).toBe('video/mp4; codecs="hvc1"');
    expect(s[0].getAttribute('src')).toBe('/media/site-video/a.mp4');
    expect(s[1].getAttribute('type')).toBe('video/mp4');
    expect(s[1].getAttribute('src')).toBe('/media/site-video/b.mp4');
    expect(play).toHaveBeenCalled();
  });

  it('skips sources on desktop', () => {
    mockMedia({ phone: false });
    const { container } = render(<Hero {...props} />);
    expect(container.querySelectorAll('source').length).toBe(0);
  });

  it('skips sources with prefers-reduced-motion', () => {
    mockMedia({ phone: true, reduced: true });
    const { container } = render(<Hero {...props} />);
    expect(container.querySelectorAll('source').length).toBe(0);
  });

  it('skips sources with saveData', () => {
    mockMedia({ phone: true });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
    const { container } = render(<Hero {...props} />);
    expect(container.querySelectorAll('source').length).toBe(0);
  });

  it('rotating to landscape pauses, back to portrait plays', () => {
    const m = mockMedia({ phone: true });
    render(<Hero {...props} />);
    play.mockClear();
    act(() => m.set(false));
    expect(pause).toHaveBeenCalled();
    act(() => m.set(true));
    expect(play).toHaveBeenCalled();
  });

  it('only h264 when hevc is empty', () => {
    mockMedia({ phone: true });
    const { container } = render(<Hero heading="t" mobileVideo="/media/site-video/b.mp4" />);
    const s = container.querySelectorAll('video source');
    expect(s.length).toBe(1);
    expect(s[0].getAttribute('type')).toBe('video/mp4');
  });

  it('sets poster css variable and has-video class', () => {
    mockMedia({ phone: false });
    const { container } = render(<Hero {...props} mobileVideoPoster="/img/p.jpg" />);
    const section = container.querySelector('section') as HTMLElement;
    expect(section.className).toContain('sb-hero--has-video');
    expect(section.style.getPropertyValue('--sb-hero-poster')).toContain('/img/p.jpg');
    expect(container.querySelector('.sb-hero__overlay')).not.toBeNull();
  });

  it('keeps the background image on phones when there is video but no poster', () => {
    mockMedia({ phone: true });
    const { container, rerender } = render(<Hero {...props} backgroundImage="/img/bg.jpg" />);
    let section = container.querySelector('section') as HTMLElement;
    expect(section.className).not.toContain('sb-hero--has-poster');
    expect(section.style.getPropertyValue('--sb-hero-poster')).toBe('');
    expect(section.style.backgroundImage).toContain('bg.jpg');
    rerender(<Hero {...props} backgroundImage="/img/bg.jpg" mobileVideoPoster="/img/p.jpg" />);
    section = container.querySelector('section') as HTMLElement;
    expect(section.className).toContain('sb-hero--has-poster');
    expect(section.style.getPropertyValue('--sb-hero-poster')).toContain('/img/p.jpg');
  });

  it('replacing the video swaps sources instead of appending', () => {
    mockMedia({ phone: true });
    const { container, rerender } = render(<Hero {...props} />);
    rerender(<Hero heading="t" mobileVideoHevc="/media/site-video/c.mp4" mobileVideo="/media/site-video/d.mp4" />);
    const s = container.querySelectorAll('video source');
    expect(s.length).toBe(2);
    expect(s[0].getAttribute('src')).toBe('/media/site-video/c.mp4');
    expect(s[1].getAttribute('src')).toBe('/media/site-video/d.mp4');
  });

  it('falls back to addListener/removeListener on old Safari', () => {
    const m = mockMedia({ phone: true, legacy: true });
    const { unmount } = render(<Hero {...props} />);
    expect(m.spies.addListener).toHaveBeenCalledTimes(2);
    unmount();
    expect(m.spies.removeListener).toHaveBeenCalledTimes(2);
    expect(m.listeners.phone.length).toBe(0);
    expect(m.listeners.reduced.length).toBe(0);
  });

  it('unsubscribes on unmount', () => {
    const m = mockMedia({ phone: true });
    const { unmount } = render(<Hero {...props} />);
    expect(m.spies.add).toHaveBeenCalledTimes(2);
    unmount();
    expect(m.spies.remove).toHaveBeenCalledTimes(2);
    expect(m.listeners.phone.length).toBe(0);
    expect(m.listeners.reduced.length).toBe(0);
  });

  it('toggles the playing class on playing and error events', () => {
    mockMedia({ phone: true });
    const { container } = render(<Hero {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video.className).not.toContain('sb-hero__video--playing');
    fireEvent(video, new Event('playing'));
    expect(video.className).toContain('sb-hero__video--playing');
    fireEvent(video, new Event('error'));
    expect(video.className).not.toContain('sb-hero__video--playing');
  });

  it('pauses when reduced motion turns on', () => {
    const m = mockMedia({ phone: true });
    render(<Hero {...props} />);
    pause.mockClear();
    act(() => m.setReduced(true));
    expect(pause).toHaveBeenCalled();
    play.mockClear();
    act(() => m.setReduced(false));
    expect(play).toHaveBeenCalled();
  });
});
