// Editor-supplied URLs render on a public page. React does NOT block
// `javascript:` in href, so we allowlist safe schemes and drop the rest.
// Shared by every block that accepts a link or image URL.
const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:|tel:)/i;
const SAFE_IMAGE = /^(https?:\/\/|\/)/i;

export function safeHref(href?: string): string | undefined {
  const value = href?.trim();
  return value && SAFE_HREF.test(value) ? value : undefined;
}

export function safeImageUrl(url?: string): string | undefined {
  const value = url?.trim();
  return value && SAFE_IMAGE.test(value) ? value : undefined;
}
