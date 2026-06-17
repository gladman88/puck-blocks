import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { LeadForm } from './LeadForm';

describe('SiteHeader', () => {
  it('renders safe nav links and drops javascript: links', () => {
    const { container } = render(
      <SiteHeader
        logoText="SHIBA"
        links={[
          { label: 'Авто', href: '#car' },
          { label: 'Зло', href: 'javascript:alert(1)' },
        ]}
        whatsapp="https://wa.me/1"
      />,
    );
    const navLinks = container.querySelectorAll('.sb-header__nav a');
    expect(navLinks.length).toBe(1);
    expect(navLinks[0].textContent).toBe('Авто');
    expect(container.querySelector('.sb-header__contacts .sb-icon-link')).not.toBeNull();
  });

  it('normalizes a bare phone number to a tel: link', () => {
    const { container } = render(<SiteHeader logoText="X" links={[]} phone="+66 95 965 7805" />);
    expect(container.querySelector('a.sb-icon-link')?.getAttribute('href')).toBe('tel:+66959657805');
  });
});

describe('Footer', () => {
  it('renders contacts (mailto/tel) and social icons', () => {
    const { container, getByText } = render(
      <Footer
        phone="+66959657805"
        email="a@b.com"
        whatsapp="https://wa.me/1"
        links={[{ label: 'Авто', href: '#car' }]}
      />,
    );
    expect(getByText('a@b.com')).toBeTruthy();
    expect(container.querySelector('a[href="mailto:a@b.com"]')).not.toBeNull();
    expect(container.querySelector('.sb-footer__socials .sb-icon-link')).not.toBeNull();
  });
});

describe('LeadForm', () => {
  it('requires a phone and shows the success message on submit (no endpoint)', () => {
    const { container, getByText, queryByText } = render(
      <LeadForm heading="H" successMessage="Готово!" />,
    );
    expect(queryByText('Готово!')).toBeNull();
    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    expect(phone.required).toBe(true);
    fireEvent.change(phone, { target: { value: '+660000000' } });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(getByText('Готово!')).toBeTruthy();
  });
});
