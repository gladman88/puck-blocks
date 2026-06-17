export interface RichTextProps {
  /** Plain text. Blank lines separate paragraphs; single newlines are preserved. */
  content: string;
}

/**
 * Simple text block. Framework-neutral plain HTML. Rich formatting (markdown)
 * can be layered later without changing the data contract.
 */
export function RichText({ content }: RichTextProps) {
  const paragraphs = (content ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 whitespace-pre-line leading-relaxed last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
