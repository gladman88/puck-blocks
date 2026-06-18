import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo, useRef } from 'react';

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
function renderHeading(heading, accent) {
  const word = accent?.trim();
  if (!word) return heading;
  const idx = heading.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return heading;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    heading.slice(0, idx),
    /* @__PURE__ */ jsx("span", { className: "sb-hero__accent", children: heading.slice(idx, idx + word.length) }),
    heading.slice(idx + word.length)
  ] });
}
function Hero({
  heading,
  accentWord,
  subheading,
  backgroundImage,
  ctaLabel,
  ctaHref,
  whatsapp,
  telegram
}) {
  const bg = safeImageUrl(backgroundImage);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "sb-hero",
      style: bg ? { backgroundImage: `url("${encodeURI(bg)}")` } : void 0,
      children: [
        bg ? /* @__PURE__ */ jsx("div", { className: "sb-hero__overlay", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-hero__inner", children: [
          /* @__PURE__ */ jsx("h1", { className: "sb-h1", children: renderHeading(heading, accentWord) }),
          subheading ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: subheading }) : null,
          hasCta || wa || tg ? /* @__PURE__ */ jsxs("div", { className: "sb-hero__cta", children: [
            hasCta ? /* @__PURE__ */ jsx("a", { className: "sb-btn", href, children: ctaLabel }) : null,
            wa ? /* @__PURE__ */ jsx("a", { className: "sb-hero__social", href: wa, target: "_blank", rel: "noopener noreferrer", "aria-label": "WhatsApp", children: /* @__PURE__ */ jsx(ContactIcon, { kind: "whatsapp" }) }) : null,
            tg ? /* @__PURE__ */ jsx("a", { className: "sb-hero__social", href: tg, target: "_blank", rel: "noopener noreferrer", "aria-label": "Telegram", children: /* @__PURE__ */ jsx(ContactIcon, { kind: "telegram" }) }) : null
          ] }) : null
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
  containerClassName = "",
  id
}) {
  return /* @__PURE__ */ jsx("section", { id: id || void 0, className: `sb-section ${className}`.trim(), children: /* @__PURE__ */ jsx("div", { className: `sb-container ${containerClassName}`.trim(), children }) });
}
function CheckBadge() {
  return /* @__PURE__ */ jsx("svg", { className: "sb-stat__badge", viewBox: "0 0 24 24", width: "46", height: "46", "aria-hidden": true, focusable: "false", children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
    }
  ) });
}
function StatCounters({ heading, items }) {
  return /* @__PURE__ */ jsxs(Section, { children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-stats", children: (items ?? []).map((item, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `sb-stat ${index % 2 === 0 ? "sb-stat--gold" : "sb-stat--dark"}`,
        children: [
          /* @__PURE__ */ jsx(CheckBadge, {}),
          /* @__PURE__ */ jsx("div", { className: "sb-stat__value", children: item.value }),
          item.text ? /* @__PURE__ */ jsx("p", { className: "sb-stat__text", children: item.text }) : null
        ]
      },
      index
    )) })
  ] });
}
function youtubeId(url) {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /youtube\.com\/(?:shorts|embed|live)\/([\w-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
function VideoEmbed({ url, title }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  if (id) {
    return /* @__PURE__ */ jsx("div", { className: "sb-video", children: playing ? /* @__PURE__ */ jsx(
      "iframe",
      {
        className: "sb-video__iframe",
        src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
        title: title ?? "\u0412\u0438\u0434\u0435\u043E",
        allow: "autoplay; encrypted-media; picture-in-picture",
        allowFullScreen: true
      }
    ) : /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "sb-video__poster",
        onClick: () => setPlaying(true),
        "aria-label": "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0438\u0434\u0435\u043E",
        children: [
          /* @__PURE__ */ jsx("img", { src: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, alt: "", loading: "lazy" }),
          /* @__PURE__ */ jsx("span", { className: "sb-video__play", "aria-hidden": true, children: "\u25B6" })
        ]
      }
    ) });
  }
  const href = safeHref(url);
  if (!href) return null;
  return /* @__PURE__ */ jsxs("a", { className: "sb-video sb-video__link", href, target: "_blank", rel: "noopener noreferrer", children: [
    /* @__PURE__ */ jsx("span", { className: "sb-video__play", "aria-hidden": true, children: "\u25B6" }),
    "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0438\u0434\u0435\u043E"
  ] });
}
function AboutPromo({
  heading,
  text,
  image,
  videoUrl,
  imagePosition = "right"
}) {
  const img = safeImageUrl(image);
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const body = /* @__PURE__ */ jsxs("div", { className: "sb-about__body", children: [
    /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }),
    text ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: text }) : null
  ] });
  if (!img && !hasVideo) {
    return /* @__PURE__ */ jsx(Section, { children: body });
  }
  return /* @__PURE__ */ jsx(Section, { className: imagePosition === "left" ? "sb-about--reverse" : "", children: /* @__PURE__ */ jsxs("div", { className: "sb-about__grid", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-about__media", children: [
      hasVideo ? /* @__PURE__ */ jsx(VideoEmbed, { url: videoUrl, title: heading }) : null,
      img ? /* @__PURE__ */ jsx("img", { className: "sb-about__img", src: img, alt: heading, loading: "lazy" }) : null
    ] }),
    body
  ] }) });
}
function FeatureCards({ heading, items, videoUrl, videoIndex }) {
  const list = items ?? [];
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const vIdx = typeof videoIndex === "number" && videoIndex >= 0 ? videoIndex : list.length;
  const cells = [];
  const pushVideo = () => cells.push(
    /* @__PURE__ */ jsx("div", { className: "sb-feature sb-feature--video", children: /* @__PURE__ */ jsx(VideoEmbed, { url: videoUrl, title: heading }) }, "video")
  );
  list.forEach((item, i) => {
    if (hasVideo && i === vIdx) pushVideo();
    const icon = safeImageUrl(item.icon);
    cells.push(
      /* @__PURE__ */ jsxs("div", { className: "sb-feature", children: [
        icon ? /* @__PURE__ */ jsx("img", { className: "sb-feature__icon", src: icon, alt: "", loading: "lazy" }) : null,
        /* @__PURE__ */ jsx("h3", { className: "sb-feature__title", children: item.title }),
        item.text ? /* @__PURE__ */ jsx("p", { className: "sb-feature__text", children: item.text }) : null
      ] }, i)
    );
  });
  if (hasVideo && vIdx >= list.length) pushVideo();
  return /* @__PURE__ */ jsxs(Section, { children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-features__grid", children: cells })
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
function Carousel({ title, children }) {
  const ref = useRef(null);
  const scrollByDir = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "sb-carousel", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-carousel__head", children: [
      /* @__PURE__ */ jsx("div", { className: "sb-carousel__title", children: title }),
      /* @__PURE__ */ jsxs("div", { className: "sb-carousel__nav", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollByDir(-1), "aria-label": "\u041D\u0430\u0437\u0430\u0434", children: "\u2039" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollByDir(1), "aria-label": "\u0412\u043F\u0435\u0440\u0451\u0434", children: "\u203A" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sb-carousel__track", ref, children })
  ] });
}
function Stars({ rating }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return /* @__PURE__ */ jsxs("span", { className: "sb-rcard__stars", "aria-label": `${full} \u0438\u0437 5`, children: [
    "\u2605\u2605\u2605\u2605\u2605".slice(0, full),
    /* @__PURE__ */ jsx("span", { className: "sb-rcard__stars-empty", children: "\u2605\u2605\u2605\u2605\u2605".slice(0, 5 - full) })
  ] });
}
function TextCard({ review }) {
  const [open, setOpen] = useState(false);
  const name = review.name?.trim();
  const avatar = safeImageUrl(review.avatar ?? "");
  const screenshot = safeImageUrl(review.screenshot ?? "");
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return /* @__PURE__ */ jsxs("article", { className: "sb-rcard", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-rcard__head", children: [
      avatar ? /* @__PURE__ */ jsx("img", { className: "sb-rcard__avatar", src: avatar, alt: "", loading: "lazy" }) : /* @__PURE__ */ jsx("span", { className: "sb-rcard__avatar sb-rcard__avatar--initial", "aria-hidden": true, children: initial }),
      /* @__PURE__ */ jsxs("div", { className: "sb-rcard__meta", children: [
        name ? /* @__PURE__ */ jsx("p", { className: "sb-rcard__name", children: name }) : null,
        review.rating ? /* @__PURE__ */ jsx(Stars, { rating: review.rating }) : null
      ] })
    ] }),
    review.text ? /* @__PURE__ */ jsx("p", { className: "sb-rcard__text", children: review.text }) : null,
    screenshot ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "sb-rcard__more", onClick: () => setOpen(true), children: "\u0427\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E" }),
      open ? /* @__PURE__ */ jsxs(
        "div",
        {
          className: "sb-lightbox",
          role: "dialog",
          "aria-modal": "true",
          onClick: () => setOpen(false),
          children: [
            /* @__PURE__ */ jsx("button", { type: "button", className: "sb-lightbox__close", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: "\xD7" }),
            /* @__PURE__ */ jsx(
              "img",
              {
                className: "sb-lightbox__img",
                src: screenshot,
                alt: name ? `\u041E\u0442\u0437\u044B\u0432 \u2014 ${name}` : "\u041E\u0442\u0437\u044B\u0432",
                onClick: (e) => e.stopPropagation()
              }
            )
          ]
        }
      ) : null
    ] }) : null
  ] });
}
function MediaCard({ item }) {
  const photo = safeImageUrl(item.photo ?? "");
  return /* @__PURE__ */ jsxs("figure", { className: "sb-rmedia", children: [
    item.videoUrl ? /* @__PURE__ */ jsx(VideoEmbed, { url: item.videoUrl, title: item.caption || "\u0412\u0438\u0434\u0435\u043E-\u043E\u0442\u0437\u044B\u0432" }) : photo ? /* @__PURE__ */ jsx("img", { className: "sb-rmedia__photo", src: photo, alt: item.caption ?? "", loading: "lazy" }) : null,
    item.caption ? /* @__PURE__ */ jsx("figcaption", { className: "sb-rmedia__caption", children: item.caption }) : null
  ] });
}
function ReviewsCarousel({ heading, anchorId, textReviews, mediaReviews }) {
  const texts = (textReviews ?? []).filter((r) => r.name || r.text);
  const media = (mediaReviews ?? []).filter((m) => m.videoUrl || m.photo);
  return /* @__PURE__ */ jsxs(Section, { id: anchorId || "reviews", children: [
    texts.length > 0 ? /* @__PURE__ */ jsx(Carousel, { title: heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2 sb-h2--inline", children: heading }) : null, children: texts.map((r, i) => /* @__PURE__ */ jsx("div", { className: "sb-carousel__cell sb-carousel__cell--text", children: /* @__PURE__ */ jsx(TextCard, { review: r }) }, i)) }) : heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    media.length > 0 ? /* @__PURE__ */ jsx(Carousel, { children: media.map((m, i) => /* @__PURE__ */ jsx("div", { className: "sb-carousel__cell sb-carousel__cell--media", children: /* @__PURE__ */ jsx(MediaCard, { item: m }) }, i)) }) : null
  ] });
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
    available: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E",
    total: "\u0432\u0441\u0435\u0433\u043E",
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
    available: "available",
    total: "total",
    viewAll: "View full catalog",
    empty: "No vehicles available",
    loading: "Loading\u2026",
    error: "Failed to load catalog"
  }
};
function groupVehicles(vehicles) {
  const groups = /* @__PURE__ */ new Map();
  for (const v of vehicles) {
    const key = `${v.brand}:${v.model}:${v.year ?? ""}:${v.color ?? ""}`;
    const existing = groups.get(key);
    if (existing) existing.push(v);
    else groups.set(key, [v]);
  }
  return Array.from(groups.values()).map((group) => {
    const available = group.filter((v) => v.is_available);
    const availableCount = available.length;
    let representative;
    if (availableCount === 0) {
      const withDate = group.filter((v) => v.free_from);
      const candidates = withDate.length > 0 ? withDate : group;
      representative = candidates.reduce((a, b) => {
        if (a.free_from !== b.free_from) return (a.free_from ?? "9999") <= (b.free_from ?? "9999") ? a : b;
        return (a.min_price_per_day ?? Infinity) <= (b.min_price_per_day ?? Infinity) ? a : b;
      });
    } else {
      const withPrice = available.filter((v) => v.min_price_per_day !== null);
      representative = withPrice.length > 0 ? withPrice.reduce((a, b) => (a.min_price_per_day ?? 0) <= (b.min_price_per_day ?? 0) ? a : b) : available[0];
    }
    return {
      vehicle: {
        ...representative,
        is_available: availableCount > 0,
        free_from: availableCount > 0 ? null : representative.free_from
      },
      total: group.length,
      availableCount
    };
  });
}
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
    ]).then(([cats, list]) => {
      if (cancelled) return;
      setCategories(Array.isArray(cats) ? cats : []);
      setVehicles(Array.isArray(list) ? list : []);
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
  const groups = useMemo(() => {
    const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
    return groupVehicles(list);
  }, [vehicles, activeCat]);
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
    state === "ready" && (groups.length === 0 ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.empty }) : /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__grid", children: groups.map((g) => {
      const v = g.vehicle;
      const href = base2 ? `${base2}${base2.includes("?") ? "&" : "?"}vehicle=${encodeURIComponent(v.id)}` : void 0;
      const countLabel = g.total > 1 ? g.availableCount > 0 ? `${g.availableCount} ${t.available}` : `${g.total} ${t.total}` : null;
      const media = /* @__PURE__ */ jsxs("div", { className: "sb-vcard__media", children: [
        v.photo_url ? /* @__PURE__ */ jsx("img", { src: v.photo_url, alt: v.display_name, loading: "lazy" }) : null,
        v.category ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__badge", style: { backgroundColor: v.category.color }, children: v.category.name }) : null,
        countLabel ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__count", children: countLabel }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-vcard__overlay", children: [
          !v.is_available ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__status", children: v.free_from ? `${t.freeFrom} ${formatDate(v.free_from, locale)}` : t.busy }) : null,
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
function MapContacts({
  anchorId,
  heading,
  mapEmbedUrl,
  phone,
  email,
  address,
  whatsapp,
  telegram,
  instagram
}) {
  const socials = [];
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: "instagram", href: ig });
  if (tg) socials.push({ kind: "telegram", href: tg });
  if (wa) socials.push({ kind: "whatsapp", href: wa });
  const map = safeHref(mapEmbedUrl);
  return /* @__PURE__ */ jsxs("section", { className: "sb-map", id: anchorId || "contacts", children: [
    map ? /* @__PURE__ */ jsx(
      "iframe",
      {
        className: "sb-map__frame",
        src: map,
        title: heading || "\u041A\u0430\u0440\u0442\u0430",
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        allowFullScreen: true
      }
    ) : null,
    /* @__PURE__ */ jsxs("div", { className: "sb-map__card", children: [
      heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
      /* @__PURE__ */ jsxs("div", { className: "sb-map__lines", children: [
        phone ? /* @__PURE__ */ jsx("a", { className: "sb-map__line", href: `tel:${phone.replace(/[^\d+]/g, "")}`, children: phone }) : null,
        email ? /* @__PURE__ */ jsx("a", { className: "sb-map__line", href: `mailto:${email}`, children: email }) : null,
        address ? /* @__PURE__ */ jsx("p", { className: "sb-map__line sb-map__address", children: address }) : null
      ] }),
      socials.length > 0 ? /* @__PURE__ */ jsx("div", { className: "sb-map__socials", children: socials.map((s) => /* @__PURE__ */ jsx("a", { href: s.href, target: "_blank", rel: "noopener noreferrer", "aria-label": s.kind, children: /* @__PURE__ */ jsx(ContactIcon, { kind: s.kind }) }, s.kind)) }) : null
    ] })
  ] });
}
var UPLOAD_URL = "/api/v1/fms/site/upload-image/";
function readCookie(name) {
  if (typeof document === "undefined") return void 0;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : void 0;
}
function ImageInput({
  value,
  onChange
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const upload = async (file) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const csrf = readCookie("csrftoken");
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        body,
        credentials: "include",
        headers: csrf ? { "X-CSRFToken": csrf } : void 0
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "sbf", children: [
    value ? /* @__PURE__ */ jsxs("div", { className: "sbf__preview", children: [
      /* @__PURE__ */ jsx("img", { src: value, alt: "" }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "sbf__remove", onClick: () => onChange(""), children: "\u0423\u0431\u0440\u0430\u0442\u044C" })
    ] }) : null,
    /* @__PURE__ */ jsxs("label", { className: `sbf__btn ${busy ? "sbf__btn--busy" : ""}`, children: [
      busy ? "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" : "\u2B06 \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443",
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          accept: "image/*",
          hidden: true,
          disabled: busy,
          onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        className: "sbf__url",
        placeholder: "\u2026\u0438\u043B\u0438 \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 URL",
        value: value ?? "",
        onChange: (e) => onChange(e.target.value)
      }
    ),
    error ? /* @__PURE__ */ jsx("p", { className: "sbf__error", children: error }) : null
  ] });
}
function imageField(label) {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => /* @__PURE__ */ jsx(ImageInput, { value: value ?? "", onChange: (next) => onChange(next) })
  };
}
var internalConfig = {
  root: {
    fields: {
      title: { type: "text", label: "SEO title" },
      description: { type: "textarea", label: "SEO description" },
      ogImage: imageField("OG-\u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 (\u0434\u043B\u044F \u0441\u043E\u0446\u0441\u0435\u0442\u0435\u0439)")
    },
    // Wrap the whole tree in the design-system root so tokens + base styles
    // apply identically in the editor preview and on the live site.
    render: ({ children }) => /* @__PURE__ */ jsx("div", { className: "sb-root", children })
  },
  categories: {
    layout: { title: "\u041A\u0430\u0440\u043A\u0430\u0441", components: ["SiteHeader", "Footer", "MapContacts"] },
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
        accentWord: { type: "text", label: "\u0410\u043A\u0446\u0435\u043D\u0442\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E (\u0437\u043E\u043B\u043E\u0442\u043E\u043C)" },
        subheading: { type: "textarea", label: "\u041F\u043E\u0434\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        backgroundImage: imageField("\u0424\u043E\u043D\u043E\u0432\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"),
        ctaLabel: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0442\u0435\u043A\u0441\u0442" },
        ctaHref: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        whatsapp: { type: "text", label: "WhatsApp \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 (\u043A\u043D\u043E\u043F\u043A\u0430 \u0443 CTA)" },
        telegram: { type: "text", label: "Telegram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 (\u043A\u043D\u043E\u043F\u043A\u0430 \u0443 CTA)" }
      },
      defaultProps: {
        heading: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439 \u0438 \u0431\u0430\u0439\u043A\u043E\u0432 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        accentWord: "\u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        subheading: "\u0421\u0432\u043E\u0431\u043E\u0434\u0430 \u043F\u0435\u0440\u0435\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0443 \u2014 \u0432\u0430\u0448 \u043A\u043B\u044E\u0447 \u043A \u043D\u0435\u0437\u0430\u0431\u044B\u0432\u0430\u0435\u043C\u044B\u043C \u043F\u0440\u0438\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F\u043C",
        backgroundImage: "",
        ctaLabel: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441",
        ctaHref: "#leadform",
        whatsapp: "https://wa.me/66959657805",
        telegram: "https://t.me/ShibaCars_Phuket"
      },
      render: Hero
    },
    AboutPromo: {
      label: "\u041F\u0440\u043E\u043C\u043E (\u043C\u0435\u0434\u0438\u0430 + \u0442\u0435\u043A\u0441\u0442)",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" },
        image: imageField("\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"),
        videoUrl: { type: "text", label: "\u0412\u0438\u0434\u0435\u043E \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 YouTube (\u043E\u043F\u0446.)" },
        imagePosition: {
          type: "radio",
          label: "\u041C\u0435\u0434\u0438\u0430",
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
        videoUrl: "",
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
          { value: "\u0411\u043E\u043B\u0435\u0435 40 \u043C\u0430\u0448\u0438\u043D", text: "\u0428\u0438\u0440\u043E\u043A\u0438\u0439 \u0432\u044B\u0431\u043E\u0440 \u0430\u0432\u0442\u043E \u2014 \u043E\u0442 \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0445 \u0434\u043E \u043C\u043E\u0449\u043D\u044B\u0445 \u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A\u043E\u0432" },
          { value: "\u0411\u043E\u043B\u0435\u0435 35 \u0431\u0430\u0439\u043A\u043E\u0432", text: "\u0421\u0442\u0438\u043B\u044C\u043D\u044B\u0435 \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u044B\u0435 \u0431\u0430\u0439\u043A\u0438 \u0434\u043B\u044F \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u044B\u0445 \u043F\u043E\u0435\u0437\u0434\u043E\u043A \u043F\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0443" },
          { value: "\u041F\u043E\u0434\u0430\u0447\u0430 \u0430\u0432\u0442\u043E \u0437\u0430 2 \u0447\u0430\u0441\u0430", text: "\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u043F\u0440\u044F\u043C\u043E \u043A \u0432\u0430\u043C \u2014 \u043C\u044B \u0446\u0435\u043D\u0438\u043C \u0432\u0430\u0448\u0435 \u0432\u0440\u0435\u043C\u044F" },
          { value: "3 \u0433\u043E\u0434\u0430 \u043D\u0430 \u0440\u044B\u043D\u043A\u0435", text: "\u041E\u043F\u044B\u0442 \u0438 \u0441\u0435\u0440\u0432\u0438\u0441 \u0434\u0435\u043B\u0430\u044E\u0442 \u043D\u0430\u0441 \u043B\u0438\u0434\u0435\u0440\u0430\u043C\u0438 \u0432 \u0441\u0444\u0435\u0440\u0435 \u0430\u0440\u0435\u043D\u0434\u044B \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435" }
        ]
      },
      render: StatCounters
    },
    FeatureCards: {
      label: "\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430 (\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A + \u0438\u043A\u043E\u043D\u043A\u0438 + \u0432\u0438\u0434\u0435\u043E)",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        items: {
          type: "array",
          label: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438",
          arrayFields: {
            icon: imageField("\u0418\u043A\u043E\u043D\u043A\u0430"),
            title: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
            text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442" }
          },
          defaultItemProps: { icon: "", title: "", text: "" },
          getItemSummary: (item) => item.title || "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430"
        },
        videoUrl: { type: "text", label: "\u0412\u0438\u0434\u0435\u043E \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 YouTube (\u043E\u043F\u0446.)" },
        videoIndex: { type: "number", label: "\u041F\u043E\u0437\u0438\u0446\u0438\u044F \u0432\u0438\u0434\u0435\u043E \u0432 \u0441\u0435\u0442\u043A\u0435 (0 = \u043F\u0435\u0440\u0432\u0430\u044F)", min: 0 }
      },
      defaultProps: {
        heading: "\u0412\u044B \u0441\u0430\u0434\u0438\u0442\u0435\u0441\u044C \u0432 \u0430\u0440\u0435\u043D\u0434\u043D\u0443\u044E \u043C\u0430\u0448\u0438\u043D\u0443, \u043A\u0430\u043A \u0432 \u0441\u0432\u043E\u044E!",
        items: [
          { icon: "/media/site/feat-autopark.png", title: "\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043F\u0430\u0440\u043A", text: "\u041D\u0430\u0448\u0438 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u0432\u0441\u0435\u0433\u0434\u0430 \u0432 \u043E\u0442\u043B\u0438\u0447\u043D\u043E\u043C \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438, \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u044F\u0442 \u0442\u0435\u0445\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0432 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0438\u0434\u0435 \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u044F \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0439\u043A\u0435." },
          { icon: "/media/site/feat-wash.png", title: "\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0443\u043D\u043A\u0442 \u043C\u043E\u0439\u043A\u0438", text: "\u041C\u044B \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u0435\u043C \u0431\u0435\u0437\u0443\u043F\u0440\u0435\u0447\u043D\u0443\u044E \u0447\u0438\u0441\u0442\u043E\u0442\u0443 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u043F\u0435\u0440\u0435\u0434 \u043A\u0430\u0436\u0434\u043E\u0439 \u0430\u0440\u0435\u043D\u0434\u043E\u0439 \u2014 \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043B\u044E\u0431\u0438\u043C, \u043A\u043E\u0433\u0434\u0430 \u043D\u0430\u0448\u0438\u043C \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C \u043F\u0440\u0438\u044F\u0442\u043D\u043E \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C." },
          { icon: "/media/site/feat-icon3.svg", title: "\u0413\u0430\u0439\u0434 \u043F\u043E \u043B\u0443\u0447\u0448\u0438\u043C \u043C\u0435\u0441\u0442\u0430\u043C", text: "\u041F\u0440\u0438 \u0430\u0440\u0435\u043D\u0434\u0435 \u0430\u0432\u0442\u043E \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0430\u0439\u0434 \u0441 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u043C\u0438 \u043B\u043E\u043A\u0430\u0446\u0438\u044F\u043C\u0438: \u043E\u0442 \u0436\u0438\u0432\u043E\u043F\u0438\u0441\u043D\u044B\u0445 \u043F\u043B\u044F\u0436\u0435\u0439 \u0434\u043E \u0441\u043A\u0440\u044B\u0442\u044B\u0445 \u043A\u0430\u0444\u0435 \u0438 \u0444\u043E\u0442\u043E\u0433\u0435\u043D\u0438\u0447\u043D\u044B\u0445 \u0443\u0433\u043E\u043B\u043A\u043E\u0432 \u0433\u043E\u0440\u043E\u0434\u0430." },
          { icon: "/media/site/feat-icon5.svg", title: "\u041A\u043E\u043C\u0444\u043E\u0440\u0442 \u0432 \u0434\u0435\u0442\u0430\u043B\u044F\u0445", text: "\u0412 \u043A\u0430\u0436\u0434\u043E\u043C \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435 \u0435\u0441\u0442\u044C \u0431\u0443\u0442\u0438\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430, \u0441\u0430\u043B\u0444\u0435\u0442\u043A\u0438, \u0437\u0430\u0440\u044F\u0434\u043D\u044B\u0435 \u043A\u0430\u0431\u0435\u043B\u0438 \u0438 \u0437\u043E\u043D\u0442 \u2014 \u0447\u0442\u043E\u0431\u044B \u0432\u044B \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B\u0438 \u0441\u0435\u0431\u044F \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0441 \u043F\u0435\u0440\u0432\u044B\u0445 \u043C\u0438\u043D\u0443\u0442 \u043F\u0443\u0442\u0438." },
          { icon: "/media/site/feat-icon6.svg", title: "\u042D\u043A\u0438\u043F\u0438\u0440\u043E\u0432\u043A\u0430 \u043C\u043E\u0442\u043E\u0446\u0438\u043A\u043B\u0430", text: "\u041A\u0430\u0436\u0434\u044B\u0439 \u043C\u043E\u0442\u043E\u0446\u0438\u043A\u043B \u0443\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u043E\u0432\u0430\u043D \u043D\u0430\u0434\u0451\u0436\u043D\u044B\u043C \u0434\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u043C \u0434\u043B\u044F \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u0448\u043B\u0435\u043C\u043E\u043C \u2014 \u0434\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0443\u0434\u043E\u0431\u0441\u0442\u0432\u0430 \u0438 \u043F\u043E\u043B\u043D\u043E\u0439 \u0441\u0432\u043E\u0431\u043E\u0434\u044B \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u043F\u043E\u0435\u0437\u0434\u043A\u0438." }
        ],
        videoUrl: "",
        videoIndex: 2
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
      label: "\u041E\u0442\u0437\u044B\u0432\u044B",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (\u043E\u043F\u0446.)" },
        anchorId: { type: "text", label: "\u042F\u043A\u043E\u0440\u044C \u0434\u043B\u044F \u043C\u0435\u043D\u044E (\u043D\u0430\u043F\u0440. reviews)" },
        textReviews: {
          type: "array",
          label: "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u043E\u0442\u0437\u044B\u0432\u044B",
          arrayFields: {
            name: { type: "text", label: "\u0418\u043C\u044F" },
            rating: { type: "number", label: "\u041E\u0446\u0435\u043D\u043A\u0430 (1\u20135)", min: 1, max: 5 },
            text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442 \u043E\u0442\u0437\u044B\u0432\u0430" },
            avatar: imageField("\u0410\u0432\u0430\u0442\u0430\u0440"),
            screenshot: imageField("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u043E\u0442\u0437\u044B\u0432\u0430 (\xAB\u0427\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E\xBB)")
          },
          defaultItemProps: { name: "", rating: 5, text: "", avatar: "", screenshot: "" },
          getItemSummary: (item, index) => item.name || `\u041E\u0442\u0437\u044B\u0432 ${(index ?? 0) + 1}`
        },
        mediaReviews: {
          type: "array",
          label: "\u041C\u0435\u0434\u0438\u0430-\u043E\u0442\u0437\u044B\u0432\u044B (\u0432\u0438\u0434\u0435\u043E / \u0444\u043E\u0442\u043E)",
          arrayFields: {
            videoUrl: { type: "text", label: "\u0412\u0438\u0434\u0435\u043E \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 YouTube" },
            photo: imageField("\u0424\u043E\u0442\u043E / \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442"),
            caption: { type: "text", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C (\u043E\u043F\u0446.)" }
          },
          defaultItemProps: { videoUrl: "", photo: "", caption: "" },
          getItemSummary: (item, index) => item.caption || (item.videoUrl ? "\u0412\u0438\u0434\u0435\u043E" : `\u041C\u0435\u0434\u0438\u0430 ${(index ?? 0) + 1}`)
        }
      },
      defaultProps: {
        heading: "\u041E\u0442\u0437\u044B\u0432\u044B",
        anchorId: "reviews",
        textReviews: [],
        mediaReviews: []
      },
      render: ReviewsCarousel
    },
    SiteHeader: {
      label: "\u0428\u0430\u043F\u043A\u0430 \u0441\u0430\u0439\u0442\u0430",
      fields: {
        logoText: { type: "text", label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 \u0442\u0435\u043A\u0441\u0442" },
        logoImage: imageField("\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"),
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
    },
    MapContacts: {
      label: "\u041A\u0430\u0440\u0442\u0430 + \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        anchorId: { type: "text", label: "\u042F\u043A\u043E\u0440\u044C \u0434\u043B\u044F \u043C\u0435\u043D\u044E (\u043D\u0430\u043F\u0440. contacts)" },
        mapEmbedUrl: { type: "textarea", label: "Google Maps \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 embed (\u2026/maps/embed?pb=\u2026)" },
        phone: { type: "text", label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" },
        email: { type: "text", label: "Email" },
        address: { type: "textarea", label: "\u0410\u0434\u0440\u0435\u0441" },
        whatsapp: { type: "text", label: "WhatsApp \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        telegram: { type: "text", label: "Telegram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        instagram: { type: "text", label: "Instagram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" }
      },
      defaultProps: {
        heading: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
        anchorId: "contacts",
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3674.4538436663242!2d98.361052!3d7.858001000000001!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30502f7913f0e6e7%3A0x75b4dc07a4f93826!2sShiba%20Cars%20Carwash%20%26%20Detailing!5e1!3m2!1sru!2sru!4v1748868294470!5m2!1sru!2sru",
        phone: "+66959657805",
        email: "shibacars@gmail.com",
        address: "24/31 Wichit, Mueang District, Phuket 83000, Thailand",
        whatsapp: "https://wa.me/66959657805",
        telegram: "https://t.me/ShibaCars_Phuket",
        instagram: "https://www.instagram.com/shibacars_phuket"
      },
      render: MapContacts
    }
  }
};
var puckConfig = internalConfig;

export { AboutPromo, FeatureCards, Footer, Hero, LeadForm, MapContacts, ReviewsCarousel, RichText, SiteHeader, StatCounters, TermsAccordion, VehicleCatalog, puckConfig };
