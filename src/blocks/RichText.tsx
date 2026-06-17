export interface RichTextProps {
  /** Plain text. Blank lines separate paragraphs; single newlines are preserved. */
  content: string;
}

/** Simple text section. Framework-neutral; styled by the shipped design CSS. */
export function RichText({ content }: RichTextProps) {
  const paragraphs = (content ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="sb-section">
      <div className="sb-container sb-richtext">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
