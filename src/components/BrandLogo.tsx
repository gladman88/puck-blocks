/**
 * Two-tone wordmark — first word in the accent colour (gold), the rest muted —
 * approximating the «SHIBA CARS» logo. Used in the header and footer. Scalable
 * text, no image asset required (a real logo image can still be uploaded).
 */
export function BrandLogo({ text = 'SHIBA CARS', className = '' }: { text?: string; className?: string }) {
  const parts = text.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const rest = parts.slice(1).join(' ');
  return (
    <span className={`sb-logo ${className}`.trim()}>
      <span className="sb-logo__a">{first}</span>
      {rest ? <span className="sb-logo__b">{rest}</span> : null}
    </span>
  );
}
