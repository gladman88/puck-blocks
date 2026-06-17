export interface HeroProps {
  heading: string;
  subheading?: string;
  /** Optional background image URL. Plain <img>/CSS only — no framework-specific image component. */
  backgroundImage?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Hero section. Framework-neutral: renders plain HTML elements so it works
 * server-side in Next.js and client-side in Vite without any next/* imports.
 */
export function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }: HeroProps) {
  const hasCta = Boolean(ctaLabel && ctaHref);
  return (
    <section
      className="relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center text-white"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: '#111111' }
      }
    >
      {backgroundImage ? <div className="absolute inset-0 bg-black/40" aria-hidden="true" /> : null}
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
        {subheading ? <p className="text-balance text-lg opacity-90">{subheading}</p> : null}
        {hasCta ? (
          <a
            href={ctaHref}
            className="inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
