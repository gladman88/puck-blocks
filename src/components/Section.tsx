import type { ReactNode } from 'react';

/**
 * Shared layout primitive: consistent vertical rhythm + centered max-width
 * container. Blocks compose from this instead of re-implementing spacing.
 */
export function Section({
  children,
  className = '',
  containerClassName = '',
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section className={`sb-section ${className}`.trim()}>
      <div className={`sb-container ${containerClassName}`.trim()}>{children}</div>
    </section>
  );
}
