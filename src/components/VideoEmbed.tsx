import { useState } from 'react';
import { safeHref } from '../sanitize';

/** Extract an 11-char YouTube id from the common URL shapes. */
export function youtubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /youtube\.com\/(?:shorts|embed|live)\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * 16:9 video. YouTube → poster image that swaps to an inline autoplay iframe on
 * click (no JS cost until played). A non-YouTube URL falls back to a "watch"
 * link. Renders nothing if the URL is empty/unsafe.
 */
export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);

  if (id) {
    return (
      <div className="sb-video">
        {playing ? (
          <iframe
            className="sb-video__iframe"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={title ?? 'Видео'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="sb-video__poster"
            onClick={() => setPlaying(true)}
            aria-label="Смотреть видео"
          >
            <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="sb-video__play" aria-hidden>
              ▶
            </span>
          </button>
        )}
      </div>
    );
  }

  const href = safeHref(url);
  if (!href) return null;

  return (
    <a className="sb-video sb-video__link" href={href} target="_blank" rel="noopener noreferrer">
      <span className="sb-video__play" aria-hidden>
        ▶
      </span>
      Смотреть видео
    </a>
  );
}
