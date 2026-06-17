import { Section } from '../components/Section';

export interface TermItem {
  title: string;
  content?: string;
}

export interface TermsAccordionProps {
  heading?: string;
  items: TermItem[];
}

/** Collapsible terms/conditions (native <details>, no JS, accessible). */
export function TermsAccordion({ heading, items }: TermsAccordionProps) {
  return (
    <Section containerClassName="sb-terms">
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
