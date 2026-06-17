export interface HeroProps {
  heading: string;
  subheading?: string;
  /** Optional background image URL. Plain CSS only — no framework image component. */
  backgroundImage?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// Editor-supplied URLs are rendered on a public page. React does NOT block
// `javascript:` in href, so we allowlist safe schemes and drop the rest.
const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:|tel:)/i;
const SAFE_IMAGE = /^(https?:\/\/|\/)/i;

function safeHref(href?: string): string | undefined {
  const value = href?.trim();
  return value && SAFE_HREF.test(value) ? value : undefined;
}

function safeImageUrl(url?: string): string | undefined {
  const value = url?.trim();
  return value && SAFE_IMAGE.test(value) ? value : undefined;
}

/**
 * Hero section. Framework-neutral: renders plain HTML elements so it works
 * server-side in Next.js and client-side in Vite without any next/* imports.
 */
export function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }: HeroProps) {
  const bg = safeImageUrl(backgroundImage);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  return (
    <section
      className="relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center text-white"
      style={
        bg
          ? {
              // Quoted + encoded to prevent CSS injection — the value comes from
              // the editor and is rendered into inline CSS on a public page.
              backgroundImage: `url("${encodeURI(bg)}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: '#111111' }
      }
    >
      {bg ? <div className="absolute inset-0 bg-black/40" aria-hidden="true" /> : null}
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
        {subheading ? <p className="text-balance text-lg opacity-90">{subheading}</p> : null}
        {hasCta ? (
          <a
            href={href}
            className="inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
