import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

// src/sanitize.ts
var SAFE_HREF = /^(https?:\/\/|\/|#|mailto:|tel:)/i;
var SAFE_IMAGE = /^(https?:\/\/|\/)/i;
function safeHref(href) {
  const value = href?.trim();
  return value && SAFE_HREF.test(value) ? value : void 0;
}
function safeImageUrl(url) {
  const value = url?.trim();
  return value && SAFE_IMAGE.test(value) ? value : void 0;
}
function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }) {
  const bg = safeImageUrl(backgroundImage);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "sb-hero",
      style: bg ? { backgroundImage: `url("${encodeURI(bg)}")` } : void 0,
      children: [
        bg ? /* @__PURE__ */ jsx("div", { className: "sb-hero__overlay", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-hero__inner", children: [
          /* @__PURE__ */ jsx("h1", { className: "sb-h1", children: heading }),
          subheading ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: subheading }) : null,
          hasCta ? /* @__PURE__ */ jsx("div", { className: "sb-hero__cta", children: /* @__PURE__ */ jsx("a", { className: "sb-btn", href, children: ctaLabel }) }) : null
        ] })
      ]
    }
  );
}
function RichText({ content }) {
  const text = typeof content === "string" ? content : "";
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return /* @__PURE__ */ jsx("section", { className: "sb-section", children: /* @__PURE__ */ jsx("div", { className: "sb-container sb-richtext", children: paragraphs.map((paragraph, index) => /* @__PURE__ */ jsx("p", { children: paragraph }, index)) }) });
}
function Section({
  children,
  className = "",
  containerClassName = ""
}) {
  return /* @__PURE__ */ jsx("section", { className: `sb-section ${className}`.trim(), children: /* @__PURE__ */ jsx("div", { className: `sb-container ${containerClassName}`.trim(), children }) });
}
function StatCounters({ heading, items }) {
  return /* @__PURE__ */ jsxs(Section, { children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-stats__grid", children: (items ?? []).map((item, index) => /* @__PURE__ */ jsxs("div", { className: "sb-stat", children: [
      /* @__PURE__ */ jsx("div", { className: "sb-stat__value", children: item.value }),
      item.text ? /* @__PURE__ */ jsx("p", { className: "sb-stat__text", children: item.text }) : null
    ] }, index)) })
  ] });
}
function AboutPromo({ heading, text, image, imagePosition = "right" }) {
  const img = safeImageUrl(image);
  const body = /* @__PURE__ */ jsxs("div", { className: "sb-about__body", children: [
    /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }),
    text ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: text }) : null
  ] });
  if (!img) {
    return /* @__PURE__ */ jsx(Section, { children: body });
  }
  return /* @__PURE__ */ jsx(Section, { className: imagePosition === "left" ? "sb-about--reverse" : "", children: /* @__PURE__ */ jsxs("div", { className: "sb-about__grid", children: [
    /* @__PURE__ */ jsx("div", { className: "sb-about__media", children: /* @__PURE__ */ jsx("img", { className: "sb-about__img", src: img, alt: heading, loading: "lazy" }) }),
    body
  ] }) });
}
function FeatureCards({ heading, items }) {
  return /* @__PURE__ */ jsxs(Section, { children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-features__grid", children: (items ?? []).map((item, index) => {
      const icon = safeImageUrl(item.icon);
      return /* @__PURE__ */ jsxs("div", { className: "sb-feature", children: [
        icon ? /* @__PURE__ */ jsx("img", { className: "sb-feature__icon", src: icon, alt: "", loading: "lazy" }) : null,
        /* @__PURE__ */ jsx("h3", { className: "sb-feature__title", children: item.title }),
        item.text ? /* @__PURE__ */ jsx("p", { className: "sb-feature__text", children: item.text }) : null
      ] }, index);
    }) })
  ] });
}
function TermsAccordion({ heading, items }) {
  return /* @__PURE__ */ jsxs(Section, { containerClassName: "sb-terms", children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    (items ?? []).map((item, index) => /* @__PURE__ */ jsxs("details", { className: "sb-term", children: [
      /* @__PURE__ */ jsx("summary", { className: "sb-term__summary", children: item.title }),
      item.content ? /* @__PURE__ */ jsx("div", { className: "sb-term__content", children: item.content }) : null
    ] }, index))
  ] });
}
function ReviewsCarousel({ heading, images }) {
  const safe = (images ?? []).map((image) => ({ src: safeImageUrl(image.src), alt: image.alt })).filter((image) => Boolean(image.src));
  return /* @__PURE__ */ jsxs(Section, { children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-reviews__track", children: safe.map((image, index) => /* @__PURE__ */ jsx("div", { className: "sb-reviews__item", children: /* @__PURE__ */ jsx("img", { className: "sb-reviews__img", src: image.src, alt: image.alt ?? "", loading: "lazy" }) }, index)) })
  ] });
}
var base = {
  className: "sb-ico",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
function ContactIcon({ kind }) {
  switch (kind) {
    case "phone":
      return /* @__PURE__ */ jsx("svg", { ...base, children: /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" }) });
    case "whatsapp":
      return /* @__PURE__ */ jsxs("svg", { ...base, children: [
        /* @__PURE__ */ jsx("path", { d: "M21 11.5a8.5 8.5 0 0 1-12.6 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z" }),
        /* @__PURE__ */ jsx("path", { d: "M8.5 9c.4 3.2 3.3 6.1 6.5 6.5" })
      ] });
    case "telegram":
      return /* @__PURE__ */ jsxs("svg", { ...base, children: [
        /* @__PURE__ */ jsx("path", { d: "m22 3-9.5 18-2.8-6.7L3 11.5 22 3z" }),
        /* @__PURE__ */ jsx("path", { d: "M22 3 9.7 14.3" })
      ] });
    case "instagram":
      return /* @__PURE__ */ jsxs("svg", { ...base, children: [
        /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "5" }),
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
        /* @__PURE__ */ jsx("circle", { cx: "17.5", cy: "6.5", r: "0.6", fill: "currentColor", stroke: "none" })
      ] });
    default:
      return null;
  }
}
function SiteHeader({
  logoText,
  logoImage,
  links,
  phone,
  whatsapp,
  telegram,
  instagram
}) {
  const logoImg = safeImageUrl(logoImage);
  const contacts = [];
  const phoneHref = phone ? safeHref(phone.startsWith("tel:") ? phone : `tel:${phone.replace(/\s+/g, "")}`) : void 0;
  if (phoneHref) contacts.push({ kind: "phone", href: phoneHref });
  const wa = safeHref(whatsapp);
  if (wa) contacts.push({ kind: "whatsapp", href: wa });
  const tg = safeHref(telegram);
  if (tg) contacts.push({ kind: "telegram", href: tg });
  const ig = safeHref(instagram);
  if (ig) contacts.push({ kind: "instagram", href: ig });
  return /* @__PURE__ */ jsx("header", { className: "sb-header", children: /* @__PURE__ */ jsxs("div", { className: "sb-header__inner", children: [
    /* @__PURE__ */ jsx("a", { className: "sb-header__brand", href: "/", children: logoImg ? /* @__PURE__ */ jsx("img", { src: logoImg, alt: logoText || "logo" }) : logoText || "SHIBA CARS" }),
    /* @__PURE__ */ jsx("nav", { className: "sb-header__nav", children: (links ?? []).map((link, index) => {
      const href = safeHref(link.href);
      return href ? /* @__PURE__ */ jsx("a", { href, children: link.label }, index) : null;
    }) }),
    /* @__PURE__ */ jsx("div", { className: "sb-header__contacts", children: contacts.map((contact, index) => /* @__PURE__ */ jsx(
      "a",
      {
        className: "sb-icon-link",
        href: contact.href,
        "aria-label": contact.kind,
        ...contact.kind === "phone" ? {} : { target: "_blank", rel: "noopener noreferrer" },
        children: /* @__PURE__ */ jsx(ContactIcon, { kind: contact.kind })
      },
      index
    )) })
  ] }) });
}
function Footer({
  phone,
  email,
  whatsapp,
  telegram,
  instagram,
  mapUrl,
  links,
  note
}) {
  const phoneHref = phone ? safeHref(phone.startsWith("tel:") ? phone : `tel:${phone.replace(/\s+/g, "")}`) : void 0;
  const emailHref = email ? safeHref(email.startsWith("mailto:") ? email : `mailto:${email}`) : void 0;
  const mapHref = safeHref(mapUrl);
  const socials = [];
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: "whatsapp", href: wa });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: "telegram", href: tg });
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: "instagram", href: ig });
  const navLinks = (links ?? []).map((link) => ({ label: link.label, href: safeHref(link.href) })).filter((link) => Boolean(link.href));
  return /* @__PURE__ */ jsxs("footer", { className: "sb-footer", id: "contacts", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-footer__inner", children: [
      /* @__PURE__ */ jsxs("div", { className: "sb-footer__col", children: [
        /* @__PURE__ */ jsx("h4", { children: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B" }),
        /* @__PURE__ */ jsxs("div", { className: "sb-footer__list", children: [
          phoneHref ? /* @__PURE__ */ jsx("a", { href: phoneHref, children: phone }) : null,
          emailHref ? /* @__PURE__ */ jsx("a", { href: emailHref, children: email }) : null,
          mapHref ? /* @__PURE__ */ jsx("a", { href: mapHref, target: "_blank", rel: "noopener noreferrer", children: "\u041D\u0430 \u043A\u0430\u0440\u0442\u0435" }) : null
        ] })
      ] }),
      navLinks.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-footer__col", children: [
        /* @__PURE__ */ jsx("h4", { children: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" }),
        /* @__PURE__ */ jsx("div", { className: "sb-footer__list", children: navLinks.map((link, index) => /* @__PURE__ */ jsx("a", { href: link.href, children: link.label }, index)) })
      ] }) : null,
      socials.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-footer__col", children: [
        /* @__PURE__ */ jsx("h4", { children: "\u041C\u044B \u0432 \u0441\u043E\u0446\u0441\u0435\u0442\u044F\u0445" }),
        /* @__PURE__ */ jsx("div", { className: "sb-footer__socials", children: socials.map((social, index) => /* @__PURE__ */ jsx(
          "a",
          {
            className: "sb-icon-link",
            href: social.href,
            "aria-label": social.kind,
            target: "_blank",
            rel: "noopener noreferrer",
            children: /* @__PURE__ */ jsx(ContactIcon, { kind: social.kind })
          },
          index
        )) })
      ] }) : null
    ] }),
    note ? /* @__PURE__ */ jsx("p", { className: "sb-footer__note", children: note }) : null
  ] });
}
function LeadForm({
  heading,
  text,
  buttonLabel = "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443",
  successMessage = "\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
  endpoint
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("whatsapp");
  const [status, setStatus] = useState("idle");
  const onSubmit = async (event) => {
    event.preventDefault();
    if (!phone.trim()) return;
    if (!endpoint) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, contact_method: method })
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  };
  return /* @__PURE__ */ jsx(Section, { className: "sb-leadform", children: /* @__PURE__ */ jsxs("div", { className: "sb-leadform__inner", id: "leadform", children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    text ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: text }) : null,
    status === "ok" ? /* @__PURE__ */ jsx("p", { className: "sb-form__status sb-form__status--ok", children: successMessage }) : /* @__PURE__ */ jsxs("form", { className: "sb-form", onSubmit, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "sb-input",
          type: "text",
          placeholder: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F",
          value: name,
          onChange: (event) => setName(event.target.value)
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "sb-input",
          type: "tel",
          placeholder: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
          required: true,
          value: phone,
          onChange: (event) => setPhone(event.target.value)
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "sb-select",
          "aria-label": "\u0421\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0438",
          value: method,
          onChange: (event) => setMethod(event.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "whatsapp", children: "WhatsApp" }),
            /* @__PURE__ */ jsx("option", { value: "telegram", children: "Telegram" }),
            /* @__PURE__ */ jsx("option", { value: "phone", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "sb-btn", type: "submit", disabled: status === "sending", children: buttonLabel }),
      status === "err" ? /* @__PURE__ */ jsx("p", { className: "sb-form__status sb-form__status--err", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437." }) : null
    ] })
  ] }) });
}
var STRINGS = {
  ru: {
    all: "\u0412\u0441\u0435",
    from: "\u043E\u0442",
    perDay: "\u0E3F/\u0434\u0435\u043D\u044C",
    busy: "\u0437\u0430\u043D\u044F\u0442\u0430",
    freeFrom: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u0441",
    onRequest: "\u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
    viewAll: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0435\u0441\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433",
    empty: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026",
    error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433"
  },
  en: {
    all: "All",
    from: "from",
    perDay: "\u0E3F/day",
    busy: "busy",
    freeFrom: "free from",
    onRequest: "on request",
    viewAll: "View full catalog",
    empty: "No vehicles available",
    loading: "Loading\u2026",
    error: "Failed to load catalog"
  }
};
function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
      day: "2-digit",
      month: "short"
    });
  } catch {
    return iso;
  }
}
function VehicleCatalog({
  heading,
  vehicleType = "car",
  apiBase = "",
  catalogUrl,
  puck
}) {
  const locale = puck?.metadata?.locale === "en" ? "en" : "ru";
  const t = STRINGS[locale];
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setActiveCat(null);
    const headers = { "ngrok-skip-browser-warning": "true" };
    Promise.all([
      fetch(`${apiBase}/api/v1/catalog/categories/`, { headers }).then(
        (r) => r.ok ? r.json() : []
      ),
      fetch(`${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`, { headers }).then(
        (r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        }
      )
    ]).then(([cats, list2]) => {
      if (cancelled) return;
      setCategories(Array.isArray(cats) ? cats : []);
      setVehicles(Array.isArray(list2) ? list2 : []);
      setState("ready");
    }).catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicleType]);
  const usedCats = new Set(
    vehicles.map((v) => v.category?.id).filter((id) => Boolean(id))
  );
  const tabs = categories.filter((c) => usedCats.has(c.id));
  const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
  const base2 = safeHref(catalogUrl);
  return /* @__PURE__ */ jsxs(Section, { className: "sb-vcatalog", children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    state === "ready" && tabs.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vcatalog__tabs", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-vcatalog__tab ${activeCat === null ? "sb-vcatalog__tab--active" : ""}`,
          onClick: () => setActiveCat(null),
          children: t.all
        }
      ),
      tabs.map((c) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-vcatalog__tab ${activeCat === c.id ? "sb-vcatalog__tab--active" : ""}`,
          onClick: () => setActiveCat(c.id),
          children: c.name
        },
        c.id
      ))
    ] }) : null,
    state === "loading" ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.loading }) : null,
    state === "error" ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.error }) : null,
    state === "ready" && (list.length === 0 ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.empty }) : /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__grid", children: list.map((v) => {
      const href = base2 ? `${base2}${base2.includes("?") ? "&" : "?"}vehicle=${encodeURIComponent(v.id)}` : void 0;
      const media = /* @__PURE__ */ jsxs("div", { className: "sb-vcard__media", children: [
        v.photo_url ? /* @__PURE__ */ jsx("img", { src: v.photo_url, alt: v.display_name, loading: "lazy" }) : null,
        v.category ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__badge", style: { backgroundColor: v.category.color }, children: v.category.name }) : null,
        !v.is_available ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__chip", children: v.free_from ? `${t.freeFrom} ${formatDate(v.free_from, locale)}` : t.busy }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-vcard__overlay", children: [
          /* @__PURE__ */ jsx("h3", { className: "sb-vcard__name", children: v.display_name }),
          /* @__PURE__ */ jsxs("div", { className: "sb-vcard__meta", children: [
            /* @__PURE__ */ jsxs("span", { className: "sb-vcard__year", children: [
              v.year ?? "",
              v.is_available ? /* @__PURE__ */ jsx("span", { className: "sb-dot" }) : null
            ] }),
            /* @__PURE__ */ jsx("span", { className: "sb-vcard__price", children: v.min_price_per_day !== null ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("small", { children: [
                t.from,
                " "
              ] }),
              Math.round(v.min_price_per_day).toLocaleString("en-US"),
              /* @__PURE__ */ jsxs("small", { children: [
                " ",
                t.perDay
              ] })
            ] }) : /* @__PURE__ */ jsx("small", { children: t.onRequest }) })
          ] })
        ] })
      ] });
      return href ? /* @__PURE__ */ jsx("a", { className: "sb-vcard", href, children: media }, v.id) : /* @__PURE__ */ jsx("div", { className: "sb-vcard", children: media }, v.id);
    }) })),
    state === "ready" && base2 ? /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__foot", children: /* @__PURE__ */ jsx("a", { className: "sb-btn sb-btn--ghost", href: base2, children: t.viewAll }) }) : null
  ] });
}
var internalConfig = {
  root: {
    fields: {
      title: { type: "text", label: "SEO title" },
      description: { type: "textarea", label: "SEO description" },
      ogImage: { type: "text", label: "OG image URL" }
    },
    // Wrap the whole tree in the design-system root so tokens + base styles
    // apply identically in the editor preview and on the live site.
    render: ({ children }) => /* @__PURE__ */ jsx("div", { className: "sb-root", children })
  },
  categories: {
    layout: { title: "\u041A\u0430\u0440\u043A\u0430\u0441", components: ["SiteHeader", "Footer"] },
    content: { title: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442", components: ["Hero", "AboutPromo", "RichText", "LeadForm"] },
    catalog: { title: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433", components: ["VehicleCatalog"] },
    sections: {
      title: "\u0421\u0435\u043A\u0446\u0438\u0438",
      components: ["StatCounters", "FeatureCards", "TermsAccordion", "ReviewsCarousel"]
    }
  },
  components: {
    Hero: {
      label: "Hero",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        subheading: { type: "textarea", label: "\u041F\u043E\u0434\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        backgroundImage: { type: "text", label: "\u0424\u043E\u043D \u2014 URL \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" },
        ctaLabel: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0442\u0435\u043A\u0441\u0442" },
        ctaHref: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" }
      },
      defaultProps: {
        heading: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439 \u0438 \u0431\u0430\u0439\u043A\u043E\u0432 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        subheading: "\u0421\u0432\u043E\u0431\u043E\u0434\u0430 \u043F\u0435\u0440\u0435\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0443 \u2014 \u0432\u0430\u0448 \u043A\u043B\u044E\u0447 \u043A \u043D\u0435\u0437\u0430\u0431\u044B\u0432\u0430\u0435\u043C\u044B\u043C \u043F\u0440\u0438\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F\u043C",
        backgroundImage: "",
        ctaLabel: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441",
        ctaHref: "#leadform"
      },
      render: Hero
    },
    AboutPromo: {
      label: "\u041F\u0440\u043E\u043C\u043E (\u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 + \u0442\u0435\u043A\u0441\u0442)",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" },
        image: { type: "text", label: "URL \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" },
        imagePosition: {
          type: "radio",
          label: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430",
          options: [
            { label: "\u0421\u043F\u0440\u0430\u0432\u0430", value: "right" },
            { label: "\u0421\u043B\u0435\u0432\u0430", value: "left" }
          ]
        }
      },
      defaultProps: {
        heading: "\u0412\u044B \u0441\u0430\u0434\u0438\u0442\u0435\u0441\u044C \u0432 \u0430\u0440\u0435\u043D\u0434\u043D\u0443\u044E \u043C\u0430\u0448\u0438\u043D\u0443, \u043A\u0430\u043A \u0432 \u0441\u0432\u043E\u044E!",
        text: "",
        image: "",
        imagePosition: "right"
      },
      render: AboutPromo
    },
    RichText: {
      label: "\u0422\u0435\u043A\u0441\u0442",
      fields: {
        // No contentEditable: this block splits the value into paragraphs, so
        // it can't be a single inline-editable node — edit via the side panel.
        content: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" }
      },
      defaultProps: { content: "\u0422\u0435\u043A\u0441\u0442\u2026" },
      render: RichText
    },
    StatCounters: {
      label: "\u0426\u0438\u0444\u0440\u044B / \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        items: {
          type: "array",
          label: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438",
          arrayFields: {
            value: { type: "text", label: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" },
            text: { type: "textarea", label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }
          },
          defaultItemProps: { value: "", text: "" },
          getItemSummary: (item) => item.value || "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430"
        }
      },
      defaultProps: {
        heading: "",
        items: [
          { value: "3 \u0433\u043E\u0434\u0430 \u043D\u0430 \u0440\u044B\u043D\u043A\u0435", text: "\u041E\u043F\u044B\u0442 \u0438 \u0441\u0435\u0440\u0432\u0438\u0441 \u0434\u0435\u043B\u0430\u044E\u0442 \u043D\u0430\u0441 \u043B\u0438\u0434\u0435\u0440\u0430\u043C\u0438 \u0432 \u0441\u0444\u0435\u0440\u0435 \u0430\u0440\u0435\u043D\u0434\u044B \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435" },
          { value: "\u0411\u043E\u043B\u0435\u0435 35 \u0431\u0430\u0439\u043A\u043E\u0432", text: "\u0421\u0442\u0438\u043B\u044C\u043D\u044B\u0435 \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u044B\u0435 \u0431\u0430\u0439\u043A\u0438 \u0434\u043B\u044F \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u044B\u0445 \u043F\u043E\u0435\u0437\u0434\u043E\u043A \u043F\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0443" },
          { value: "\u041F\u043E\u0434\u0430\u0447\u0430 \u0430\u0432\u0442\u043E \u0437\u0430 2 \u0447\u0430\u0441\u0430", text: "\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u043F\u0440\u044F\u043C\u043E \u043A \u0432\u0430\u043C \u2014 \u043C\u044B \u0446\u0435\u043D\u0438\u043C \u0432\u0430\u0448\u0435 \u0432\u0440\u0435\u043C\u044F" },
          { value: "\u0411\u043E\u043B\u0435\u0435 40 \u043C\u0430\u0448\u0438\u043D", text: "\u0428\u0438\u0440\u043E\u043A\u0438\u0439 \u0432\u044B\u0431\u043E\u0440 \u0430\u0432\u0442\u043E \u2014 \u043E\u0442 \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0445 \u0434\u043E \u043C\u043E\u0449\u043D\u044B\u0445 \u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A\u043E\u0432" }
        ]
      },
      render: StatCounters
    },
    FeatureCards: {
      label: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        items: {
          type: "array",
          label: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438",
          arrayFields: {
            icon: { type: "text", label: "\u0418\u043A\u043E\u043D\u043A\u0430 \u2014 URL" },
            title: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
            text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" }
          },
          defaultItemProps: { icon: "", title: "", text: "" },
          getItemSummary: (item) => item.title || "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430"
        }
      },
      defaultProps: {
        heading: "",
        items: [
          { icon: "", title: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430 \u043C\u043E\u0442\u043E\u0446\u0438\u043A\u043B\u0430", text: "\u041A\u0430\u0436\u0434\u044B\u0439 \u043C\u043E\u0442\u043E\u0446\u0438\u043A\u043B \u0443\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u043E\u0432\u0430\u043D \u043D\u0430\u0434\u0451\u0436\u043D\u044B\u043C \u0434\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u043C \u0434\u043B\u044F \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u0448\u043B\u0435\u043C\u043E\u043C" },
          { icon: "", title: "\u0413\u0430\u0439\u0434 \u043F\u043E \u043B\u0443\u0447\u0448\u0438\u043C \u043C\u0435\u0441\u0442\u0430\u043C", text: "\u041F\u0440\u0438 \u0430\u0440\u0435\u043D\u0434\u0435 \u0430\u0432\u0442\u043E \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0430\u0439\u0434 \u0441 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u043C\u0438 \u043B\u043E\u043A\u0430\u0446\u0438\u044F\u043C\u0438" },
          { icon: "", title: "\u041A\u043E\u043C\u0444\u043E\u0440\u0442 \u0432 \u0434\u0435\u0442\u0430\u043B\u044F\u0445", text: "\u0411\u0443\u0442\u0438\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430, \u0441\u0430\u043B\u0444\u0435\u0442\u043A\u0438, \u0437\u0430\u0440\u044F\u0434\u043D\u044B\u0435 \u043A\u0430\u0431\u0435\u043B\u0438 \u0438 \u0437\u043E\u043D\u0442" },
          { icon: "", title: "\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043F\u0430\u0440\u043A", text: "\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0442\u0435\u0445\u043E\u0441\u043C\u043E\u0442\u0440, \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0430\u0432\u0442\u043E\u043C\u043E\u0439\u043A\u0430" },
          { icon: "", title: "\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 \u043C\u043E\u0439\u043A\u0438", text: "\u0411\u0435\u0437\u0443\u043F\u0440\u0435\u0447\u043D\u0430\u044F \u0447\u0438\u0441\u0442\u043E\u0442\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u043F\u0435\u0440\u0435\u0434 \u043A\u0430\u0436\u0434\u043E\u0439 \u0430\u0440\u0435\u043D\u0434\u043E\u0439" }
        ]
      },
      render: FeatureCards
    },
    TermsAccordion: {
      label: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F (\u0430\u043A\u043A\u043E\u0440\u0434\u0435\u043E\u043D)",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        items: {
          type: "array",
          label: "\u041F\u0443\u043D\u043A\u0442\u044B",
          arrayFields: {
            title: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
            content: { type: "textarea", label: "\u0421\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435" }
          },
          defaultItemProps: { title: "", content: "" },
          getItemSummary: (item) => item.title || "\u041F\u0443\u043D\u043A\u0442"
        }
      },
      defaultProps: {
        heading: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F",
        items: [
          { title: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442, \u0441\u0442\u0430\u0436 \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B", content: "\u041E\u0442 22 \u043B\u0435\u0442, \u0441\u0442\u0430\u0436 \u043E\u0442 2 \u043B\u0435\u0442; \u0437\u0430\u0433\u0440\u0430\u043D\u043F\u0430\u0441\u043F\u043E\u0440\u0442 + \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0430 (\u041C\u0412\u0423). \u0411\u0435\u0437 \u041C\u0412\u0423 \u0441\u0442\u0440\u0430\u0445\u043E\u0432\u0430\u044F \u043C\u043E\u0436\u0435\u0442 \u043E\u0442\u043A\u0430\u0437\u0430\u0442\u044C \u0432 \u0432\u044B\u043F\u043B\u0430\u0442\u0435." },
          { title: "\u0411\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", content: "\u0424\u043E\u0442\u043E \u0437\u0430\u0433\u0440\u0430\u043D\u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430, \u0444\u043E\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0433\u043E \u0443\u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u0435\u043D\u0438\u044F, \u0430\u0432\u0430\u043D\u0441 \u0437\u0430 2 \u0441\u0443\u0442\u043E\u043A." },
          { title: "\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u043A\u0430 \u0438 \u0441\u0442\u0440\u0430\u0445\u043E\u0432\u043E\u0439 \u0434\u0435\u043F\u043E\u0437\u0438\u0442", content: "\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u043A\u0430 1-\u0433\u043E/\u0431\u0438\u0437\u043D\u0435\u0441 \u043A\u043B\u0430\u0441\u0441\u0430; \u0434\u0435\u043F\u043E\u0437\u0438\u0442 ~$200\u2013$800; \u0444\u0440\u0430\u043D\u0448\u0438\u0437\u0430 3000\u20137000 \u0431\u0430\u0442." },
          { title: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u043A\u0438\u043B\u043E\u043C\u0435\u0442\u0440\u0430\u0436", content: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0432 \u043B\u044E\u0431\u0443\u044E \u043B\u043E\u043A\u0430\u0446\u0438\u044E \u043F\u043B\u0430\u0442\u043D\u0430\u044F \u0438 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0440\u0430\u0439\u043E\u043D\u0430; \u0430\u0432\u0442\u043E \u043F\u043E\u0434\u0430\u0451\u043C \u0447\u0438\u0441\u0442\u044B\u043C \u0441 \u043F\u043E\u043B\u043D\u044B\u043C \u0431\u0430\u043A\u043E\u043C." },
          { title: "\u041A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0438\u0439 \u0441\u0435\u0440\u0432\u0438\u0441", content: "\u0410\u0440\u0435\u043D\u0434\u0430 \u043E\u0442 \u0441\u0443\u0442\u043E\u043A; \u043E\u043F\u043B\u0430\u0442\u0430 THB/RUB/USD/USDT \u043A\u0430\u0440\u0442\u043E\u0439 \u0438\u043B\u0438 \u043D\u0430\u043B\u0438\u0447\u043D\u044B\u043C\u0438; \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0434\u043E\u0433\u043E\u0432\u043E\u0440; \u0440\u0443\u0441\u0441\u043A\u043E\u044F\u0437\u044B\u0447\u043D\u0430\u044F \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430." }
        ]
      },
      render: TermsAccordion
    },
    ReviewsCarousel: {
      label: "\u041E\u0442\u0437\u044B\u0432\u044B (\u043A\u0430\u0440\u0443\u0441\u0435\u043B\u044C)",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        images: {
          type: "array",
          label: "\u0424\u043E\u0442\u043E",
          arrayFields: {
            src: { type: "text", label: "URL \u0444\u043E\u0442\u043E" },
            alt: { type: "text", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C (alt)" }
          },
          defaultItemProps: { src: "", alt: "" },
          getItemSummary: (item, index) => item.alt || `\u0424\u043E\u0442\u043E ${(index ?? 0) + 1}`
        }
      },
      defaultProps: {
        heading: "\u041E\u0442\u0437\u044B\u0432\u044B",
        images: []
      },
      render: ReviewsCarousel
    },
    SiteHeader: {
      label: "\u0428\u0430\u043F\u043A\u0430 \u0441\u0430\u0439\u0442\u0430",
      fields: {
        logoText: { type: "text", label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 \u0442\u0435\u043A\u0441\u0442" },
        logoImage: { type: "text", label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 URL \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F" },
        links: {
          type: "array",
          label: "\u041C\u0435\u043D\u044E",
          arrayFields: {
            label: { type: "text", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" },
            href: { type: "text", label: "\u0421\u0441\u044B\u043B\u043A\u0430" }
          },
          defaultItemProps: { label: "", href: "" },
          getItemSummary: (item) => item.label || "\u041F\u0443\u043D\u043A\u0442"
        },
        phone: { type: "text", label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" },
        whatsapp: { type: "text", label: "WhatsApp \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        telegram: { type: "text", label: "Telegram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        instagram: { type: "text", label: "Instagram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" }
      },
      defaultProps: {
        logoText: "SHIBA CARS",
        logoImage: "",
        links: [
          { label: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438", href: "#car" },
          { label: "\u0411\u0430\u0439\u043A\u0438", href: "#bike" },
          { label: "\u041E\u0442\u0437\u044B\u0432\u044B", href: "#reviews" },
          { label: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B", href: "#contacts" }
        ],
        phone: "+66959657805",
        whatsapp: "https://wa.me/66959657805",
        telegram: "https://t.me/ShibaCars_Phuket",
        instagram: "https://www.instagram.com/shibacars_phuket"
      },
      render: SiteHeader
    },
    Footer: {
      label: "\u0424\u0443\u0442\u0435\u0440",
      fields: {
        phone: { type: "text", label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" },
        email: { type: "text", label: "Email" },
        whatsapp: { type: "text", label: "WhatsApp \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        telegram: { type: "text", label: "Telegram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        instagram: { type: "text", label: "Instagram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        mapUrl: { type: "text", label: "\u041A\u0430\u0440\u0442\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        links: {
          type: "array",
          label: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F",
          arrayFields: {
            label: { type: "text", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" },
            href: { type: "text", label: "\u0421\u0441\u044B\u043B\u043A\u0430" }
          },
          defaultItemProps: { label: "", href: "" },
          getItemSummary: (item) => item.label || "\u041F\u0443\u043D\u043A\u0442"
        },
        note: { type: "textarea", label: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435" }
      },
      defaultProps: {
        phone: "+66959657805",
        email: "shibacars@gmail.com",
        whatsapp: "https://wa.me/66959657805",
        telegram: "https://t.me/ShibaCars_Phuket",
        instagram: "https://www.instagram.com/shibacars_phuket",
        mapUrl: "https://maps.app.goo.gl/eAvKTvF2KHJjC9ds8",
        links: [
          { label: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438", href: "#car" },
          { label: "\u0411\u0430\u0439\u043A\u0438", href: "#bike" },
          { label: "\u041E\u0442\u0437\u044B\u0432\u044B", href: "#reviews" }
        ],
        note: ""
      },
      render: Footer
    },
    LeadForm: {
      label: "\u0424\u043E\u0440\u043C\u0430 \u0437\u0430\u044F\u0432\u043A\u0438",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" },
        buttonLabel: { type: "text", label: "\u0422\u0435\u043A\u0441\u0442 \u043A\u043D\u043E\u043F\u043A\u0438" },
        successMessage: { type: "text", label: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438" },
        endpoint: { type: "text", label: "Endpoint (URL \u043F\u0440\u0438\u0451\u043C\u0430 \u0437\u0430\u044F\u0432\u043E\u043A)" }
      },
      defaultProps: {
        heading: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        text: "\u041F\u043E\u0434\u0430\u0447\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 2 \u0447\u0430\u0441\u043E\u0432",
        buttonLabel: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443",
        successMessage: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
        endpoint: ""
      },
      render: LeadForm
    },
    VehicleCatalog: {
      label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0422\u0421",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        vehicleType: {
          type: "radio",
          label: "\u0422\u0438\u043F",
          options: [
            { label: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438", value: "car" },
            { label: "\u0411\u0430\u0439\u043A\u0438", value: "motorcycle" }
          ]
        },
        catalogUrl: { type: "text", label: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043F\u043E\u043B\u043D\u044B\u0439 \u043A\u0430\u0442\u0430\u043B\u043E\u0433" }
      },
      defaultProps: {
        heading: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438",
        vehicleType: "car",
        catalogUrl: ""
      },
      render: VehicleCatalog
    }
  }
};
var puckConfig = internalConfig;

export { AboutPromo, FeatureCards, Footer, Hero, LeadForm, ReviewsCarousel, RichText, SiteHeader, StatCounters, TermsAccordion, VehicleCatalog, puckConfig };
