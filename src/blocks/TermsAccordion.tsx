import { Section } from '../components/Section';

export interface TermItem {
  title: string;
  content?: string;
}

export interface TermsAccordionProps {
  heading?: string;
  /** Section anchor id so the header nav can scroll here (e.g. "conditions"). */
  anchorId?: string;
  items: TermItem[];
}

/** Collapsible terms/conditions (native <details>, no JS, accessible). */
export function TermsAccordion({ heading, anchorId, items }: TermsAccordionProps) {
  return (
    <Section containerClassName="sb-terms" id={anchorId || undefined}>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      {(items ?? []).map((item, index) => (
        <details className="sb-term" key={index}>
          <summary className="sb-term__summary">{item.title}</summary>
          {item.content ? <div className="sb-term__content">{item.content}</div> : null}
        </details>
      ))}
    </Section>
  );
}
