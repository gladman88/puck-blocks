import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { LeadForm } from './LeadForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// The drawer portals to document.body — unmount between tests so open drawers
// from one test can't leak into another's document-scoped queries.
afterEach(cleanup);

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

  it('normalizes a bare phone number to a tel: link (rendered as text)', () => {
    const { container } = render(<SiteHeader logoText="X" links={[]} phone="+66 95 965 7805" />);
    expect(container.querySelector('a.sb-header__phone')?.getAttribute('href')).toBe('tel:+66959657805');
  });

  it('renders a call icon (tel:) for the mobile bar alongside the desktop text phone', () => {
    const { container } = render(<SiteHeader logoText="X" links={[]} phone="+66 95 965 7805" locale="en" />);
    const iconPhone = container.querySelector('.sb-header__contacts .sb-icon-link.sb-only-mobile');
    expect(iconPhone?.getAttribute('href')).toBe('tel:+66959657805');
  });

  it('opens a full-screen drawer (portaled) with nav + language flags and closes on link click', () => {
    const { container } = render(
      <SiteHeader
        logoText="SHIBA CARS"
        links={[{ label: 'Авто', href: '#car' }]}
        phone="+66959657805"
        whatsapp="https://wa.me/1"
        locale="ru"
      />,
    );
    const burger = container.querySelector('.sb-header__burger') as HTMLButtonElement;
    // Drawer is portaled to <body>, so it is NOT under `container`.
    expect(document.body.querySelector('.sb-drawer')).toBeNull();
    expect(burger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(burger);
    expect(document.body.querySelector('.sb-drawer')).not.toBeNull();
    expect(burger.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.sb-drawer__nav a')?.textContent).toBe('Авто');
    expect(document.querySelector('.sb-drawer .sb-lang--drawer')).not.toBeNull();

    fireEvent.click(document.querySelector('.sb-drawer__nav a') as Element);
    expect(document.body.querySelector('.sb-drawer')).toBeNull();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
  });

  it('locks body scroll while open and restores it on Esc close', () => {
    const { container } = render(
      <SiteHeader logoText="X" links={[{ label: 'Авто', href: '#car' }]} locale="ru" />,
    );
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(container.querySelector('.sb-header__burger') as Element);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.body.querySelector('.sb-drawer')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('LanguageSwitcher', () => {
  it('renders both flags and marks the current locale active', () => {
    const { container } = render(<LanguageSwitcher current="ru" />);
    expect(container.querySelectorAll('.sb-lang__flag').length).toBe(2);
    expect(container.querySelector('.sb-lang__flag.is-active')?.getAttribute('hreflang')).toBe('ru');
  });

  it('swaps only the locale prefix, preserving subpath + hash', () => {
    window.history.pushState({}, '', '/ru/terms#contacts');
    const { container } = render(<LanguageSwitcher current="ru" />);
    const en = Array.from(container.querySelectorAll('.sb-lang__flag')).find(
      (a) => a.getAttribute('hreflang') === 'en',
    );
    expect(en?.getAttribute('href')).toBe('/en/terms#contacts');
    window.history.pushState({}, '', '/');
  });

  it('falls back to the locale root when the path has no known locale prefix', () => {
    window.history.pushState({}, '', '/terms');
    const { container } = render(<LanguageSwitcher current="ru" />);
    const en = Array.from(container.querySelectorAll('.sb-lang__flag')).find(
      (a) => a.getAttribute('hreflang') === 'en',
    );
    expect(en?.getAttribute('href')).toBe('/en');
    window.history.pushState({}, '', '/');
  });
});

describe('Footer', () => {
  it('renders contacts (mailto/tel) and social icons', () => {
    const { container, getByText } = render(
      <Footer
        phone="+66959657805"
        email="a@b.com"
        whatsapp="https://wa.me/1"
        columns={[{ title: 'Авто', titleHref: '#car', links: [] }]}
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
