import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RichText } from './RichText';

describe('RichText', () => {
  it('splits content into paragraphs on blank lines', () => {
    const { container } = render(<RichText content={'first para\n\nsecond para'} />);
    const paras = container.querySelectorAll('p');
    expect(paras.length).toBe(2);
    expect(paras[0].textContent).toBe('first para');
    expect(paras[1].textContent).toBe('second para');
  });

  it('renders no paragraphs for empty content', () => {
    const { container } = render(<RichText content="" />);
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('does not crash on a non-string content value', () => {
    const { container } = render(<RichText content={123 as unknown as string} />);
    expect(container.querySelectorAll('p').length).toBe(0);
  });
});
