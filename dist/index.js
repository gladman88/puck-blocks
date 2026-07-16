import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

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
function TermsAccordion({ heading, anchorId, items }) {
  return /* @__PURE__ */ jsxs(Section, { containerClassName: "sb-terms", id: anchorId || void 0, children: [
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
      open && typeof document !== "undefined" ? createPortal(
        /* @__PURE__ */ jsxs(
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
        ),
        document.body
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
function BrandLogo({ text = "SHIBA CARS", className = "" }) {
  const parts = text.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const rest = parts.slice(1).join(" ");
  return /* @__PURE__ */ jsxs("span", { className: `sb-logo ${className}`.trim(), children: [
    /* @__PURE__ */ jsx("span", { className: "sb-logo__a", children: first }),
    rest ? /* @__PURE__ */ jsx("span", { className: "sb-logo__b", children: rest }) : null
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
  const socials = [];
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: "instagram", href: ig });
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: "whatsapp", href: wa });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: "telegram", href: tg });
  const phoneHref = phone ? safeHref(phone.startsWith("tel:") ? phone : `tel:${phone.replace(/\s+/g, "")}`) : void 0;
  return /* @__PURE__ */ jsx("header", { className: "sb-header", children: /* @__PURE__ */ jsxs("div", { className: "sb-header__inner", children: [
    /* @__PURE__ */ jsx("a", { className: "sb-header__brand", href: "/", children: logoImg ? /* @__PURE__ */ jsx("img", { src: logoImg, alt: logoText || "logo" }) : /* @__PURE__ */ jsx(BrandLogo, { text: logoText || "SHIBA CARS" }) }),
    /* @__PURE__ */ jsx("nav", { className: "sb-header__nav", children: (links ?? []).map((link, index) => {
      const href = safeHref(link.href);
      return href ? /* @__PURE__ */ jsx("a", { href, children: link.label }, index) : null;
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "sb-header__contacts", children: [
      socials.map((contact, index) => /* @__PURE__ */ jsx(
        "a",
        {
          className: "sb-icon-link",
          href: contact.href,
          "aria-label": contact.kind,
          target: "_blank",
          rel: "noopener noreferrer",
          children: /* @__PURE__ */ jsx(ContactIcon, { kind: contact.kind })
        },
        index
      )),
      phoneHref ? /* @__PURE__ */ jsx("a", { className: "sb-header__phone", href: phoneHref, children: phone }) : null
    ] })
  ] }) });
}
function Footer({
  logoText,
  logoImage,
  note,
  columns,
  contactsTitle = "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
  phone,
  email,
  address,
  whatsapp,
  telegram,
  instagram
}) {
  const phoneHref = phone ? safeHref(phone.startsWith("tel:") ? phone : `tel:${phone.replace(/\s+/g, "")}`) : void 0;
  const emailHref = email ? safeHref(email.startsWith("mailto:") ? email : `mailto:${email}`) : void 0;
  const socials = [];
  const ig = safeHref(instagram);
  if (ig) socials.push({ kind: "instagram", href: ig });
  const tg = safeHref(telegram);
  if (tg) socials.push({ kind: "telegram", href: tg });
  const wa = safeHref(whatsapp);
  if (wa) socials.push({ kind: "whatsapp", href: wa });
  return /* @__PURE__ */ jsx("footer", { className: "sb-footer", children: /* @__PURE__ */ jsxs("div", { className: "sb-footer__inner", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-footer__brand", children: [
      safeImageUrl(logoImage) ? /* @__PURE__ */ jsx(
        "img",
        {
          className: "sb-footer__logo-img",
          src: safeImageUrl(logoImage),
          alt: logoText || "SHIBA CARS"
        }
      ) : /* @__PURE__ */ jsx(BrandLogo, { text: logoText || "SHIBA CARS", className: "sb-footer__logo" }),
      note ? /* @__PURE__ */ jsx("p", { className: "sb-footer__note", children: note }) : null
    ] }),
    (columns ?? []).map((col, index) => {
      const titleHref = safeHref(col.titleHref);
      const links = (col.links ?? []).map((l) => ({ label: l.label, href: safeHref(l.href) })).filter((l) => Boolean(l.href));
      return /* @__PURE__ */ jsxs("div", { className: "sb-footer__col", children: [
        /* @__PURE__ */ jsx("h4", { children: titleHref ? /* @__PURE__ */ jsx("a", { href: titleHref, children: col.title }) : col.title }),
        links.length > 0 ? /* @__PURE__ */ jsx("div", { className: "sb-footer__list", children: links.map((l, i) => /* @__PURE__ */ jsx("a", { href: l.href, children: l.label }, i)) }) : null
      ] }, index);
    }),
    /* @__PURE__ */ jsxs("div", { className: "sb-footer__col sb-footer__col--contacts", children: [
      /* @__PURE__ */ jsx("h4", { children: contactsTitle }),
      /* @__PURE__ */ jsxs("div", { className: "sb-footer__list", children: [
        phoneHref ? /* @__PURE__ */ jsx("a", { href: phoneHref, children: phone }) : null,
        emailHref ? /* @__PURE__ */ jsx("a", { href: emailHref, children: email }) : null,
        address ? /* @__PURE__ */ jsx("p", { className: "sb-footer__address", children: address }) : null
      ] }),
      socials.length > 0 ? /* @__PURE__ */ jsx("div", { className: "sb-footer__socials", children: socials.map((s) => /* @__PURE__ */ jsx(
        "a",
        {
          className: "sb-icon-link",
          href: s.href,
          "aria-label": s.kind,
          target: "_blank",
          rel: "noopener noreferrer",
          children: /* @__PURE__ */ jsx(ContactIcon, { kind: s.kind })
        },
        s.kind
      )) }) : null
    ] })
  ] }) });
}
function LeadForm({
  heading,
  text,
  contactLabel = "\u041A\u0430\u043A \u0441 \u0432\u0430\u043C\u0438 \u0441\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F?",
  buttonLabel = "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
  successMessage = "\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
  endpoint,
  image
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("whatsapp");
  const [status, setStatus] = useState("idle");
  const img = safeImageUrl(image);
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
  return /* @__PURE__ */ jsx(Section, { className: "sb-leadform", children: /* @__PURE__ */ jsxs("div", { className: `sb-leadform__card ${img ? "" : "sb-leadform__card--solo"}`, id: "leadform", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-leadform__form", children: [
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
        contactLabel ? /* @__PURE__ */ jsx("label", { className: "sb-leadform__label", children: contactLabel }) : null,
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "sb-select",
            "aria-label": contactLabel || "\u0421\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0438",
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
    ] }),
    img ? /* @__PURE__ */ jsx("div", { className: "sb-leadform__media", children: /* @__PURE__ */ jsx("img", { src: img, alt: heading ?? "", loading: "lazy" }) }) : null
  ] }) });
}

// src/blocks/catalog/dates.ts
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(isoDate, n) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().split("T")[0];
}
function nextDay(isoDate) {
  return addDays(isoDate, 1);
}
function money(value) {
  if (value == null || value === "") return "";
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "";
}
function formatShortDate(isoDate, lang) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  });
}
var DEFAULT_CENTER = { lat: 7.8804, lng: 98.3923 };
var DEFAULT_ZOOM = 11;
var SELECTED_ZOOM = 16;
var DEBOUNCE_MS = 250;
function displayValue(loc) {
  if (!loc) return "";
  return loc.name || loc.address;
}
function DeliveryAddressPicker({ apiKey, value, onSelect, strings }) {
  const [query, setQuery] = useState(() => displayValue(value));
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(
    apiKey ? "loading" : "unavailable"
  );
  const [mapOpen, setMapOpen] = useState(false);
  const suggestApiRef = useRef(null);
  const sessionTokenCtorRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const placeCtorRef = useRef(null);
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const markerCtorRef = useRef(null);
  const geocoderRef = useRef(null);
  const debounceRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    setQuery(displayValue(value));
  }, [value?.lat, value?.lng]);
  const newSessionToken = () => {
    sessionTokenRef.current = sessionTokenCtorRef.current ? new sessionTokenCtorRef.current() : null;
  };
  const syncMarker = (lat, lng, pan) => {
    if (!mapRef.current || !markerCtorRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new markerCtorRef.current({ map: mapRef.current, position: { lat, lng } });
    } else {
      markerRef.current.setPosition({ lat, lng });
    }
    if (pan) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(SELECTED_ZOOM);
    }
  };
  const pickFromPlaceId = async (placeId, fallbackLat, fallbackLng) => {
    const PlaceCtor = placeCtorRef.current;
    if (!PlaceCtor) {
      if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
      return;
    }
    try {
      const place = new PlaceCtor({ id: placeId });
      await place.fetchFields({ fields: ["location", "formattedAddress", "displayName", "id"] });
      if (!place.location) {
        if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
        return;
      }
      const lat = place.location.lat();
      const lng = place.location.lng();
      syncMarker(lat, lng, true);
      onSelectRef.current({
        address: place.formattedAddress || place.displayName || "",
        lat,
        lng,
        place_id: place.id,
        name: place.displayName
      });
    } catch {
      if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
    }
  };
  const pickFromMap = (lat, lng) => {
    syncMarker(lat, lng, true);
    if (!geocoderRef.current) {
      onSelectRef.current({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng });
      return;
    }
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, gstatus) => {
      if (gstatus === "OK" && results?.[0]) {
        onSelectRef.current({
          address: results[0].formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat,
          lng,
          place_id: results[0].place_id
        });
      } else {
        onSelectRef.current({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng });
      }
    });
  };
  const selectPrediction = async (prediction) => {
    setOpen(false);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["location", "formattedAddress", "displayName", "id"] });
      if (!place.location) return;
      const lat = place.location.lat();
      const lng = place.location.lng();
      onSelectRef.current({
        address: place.formattedAddress || place.displayName || "",
        lat,
        lng,
        place_id: place.id,
        name: place.displayName
      });
      syncMarker(lat, lng, true);
      newSessionToken();
    } catch {
    }
  };
  useEffect(() => {
    if (!apiKey) {
      setStatus("unavailable");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const google = window.google;
        if (!google) throw new Error("Google Maps bootstrap loader missing");
        const { AutocompleteSuggestion, AutocompleteSessionToken, Place } = await google.maps.importLibrary("places");
        if (cancelled) return;
        if (!AutocompleteSuggestion) throw new Error("AutocompleteSuggestion unavailable");
        suggestApiRef.current = AutocompleteSuggestion;
        sessionTokenCtorRef.current = AutocompleteSessionToken ?? null;
        placeCtorRef.current = Place ?? null;
        newSessionToken();
        setStatus("ready");
      } catch (err) {
        console.error("[DeliveryAddressPicker] Google Places init failed:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);
  const onInputChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const api = suggestApiRef.current;
    if (!q.trim() || !api) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: raw } = await api.fetchAutocompleteSuggestions({
          input: q,
          ...sessionTokenRef.current ? { sessionToken: sessionTokenRef.current } : {}
        });
        const preds = (raw ?? []).map((s) => s.placePrediction).filter((p) => p != null);
        setSuggestions(preds);
        setOpen(preds.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
  };
  useEffect(() => {
    if (!mapOpen || !apiKey || !mapDivRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const google = window.google;
        if (!google) return;
        const [maps, marker, geocoding] = await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
          google.maps.importLibrary("geocoding").catch(() => null)
          // Geocoding API optional
        ]);
        if (cancelled || !mapDivRef.current || !maps.Map) return;
        markerCtorRef.current = marker.Marker ?? null;
        if (geocoding?.Geocoder) geocoderRef.current = new geocoding.Geocoder();
        const center = value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;
        const map = new maps.Map(mapDivRef.current, {
          center,
          zoom: value ? SELECTED_ZOOM : DEFAULT_ZOOM,
          disableDefaultUI: true,
          zoomControl: true
          // clickableIcons ON (default) so a POI-icon tap carries its placeId.
        });
        mapRef.current = map;
        if (value) syncMarker(value.lat, value.lng, false);
        map.addListener("click", (e) => {
          if (e.placeId) {
            e.stop?.();
            pickFromPlaceId(e.placeId, e.latLng?.lat(), e.latLng?.lng());
          } else if (e.latLng) {
            pickFromMap(e.latLng.lat(), e.latLng.lng());
          }
        });
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mapOpen, apiKey]);
  useEffect(() => {
    if (mapRef.current && value) syncMarker(value.lat, value.lng, true);
  }, [value?.lat, value?.lng]);
  if (status === "error" || status === "unavailable") {
    return /* @__PURE__ */ jsx("div", { className: "sb-vd__addr-picker-inner", children: value ? /* @__PURE__ */ jsx(
      "input",
      {
        className: "sb-input",
        value: query,
        disabled: true,
        "aria-label": strings.searchPlaceholder,
        "data-testid": "delivery-address-input"
      }
    ) : /* @__PURE__ */ jsx("p", { className: "sb-vd__addr-msg sb-vd__addr-msg--err", children: strings.unavailable }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-picker-inner", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-search", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "sb-input",
          type: "text",
          value: query,
          disabled: status !== "ready",
          placeholder: strings.searchPlaceholder,
          onChange: onInputChange,
          onFocus: () => suggestions.length > 0 && setOpen(true),
          onBlur: () => setTimeout(() => setOpen(false), 150),
          "aria-label": strings.searchPlaceholder,
          "data-testid": "delivery-address-input"
        }
      ),
      open && suggestions.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "sb-vd__addr-suggest", "data-testid": "delivery-address-suggestions", children: suggestions.map((p, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { type: "button", onMouseDown: (e) => e.preventDefault(), onClick: () => selectPrediction(p), children: [
        /* @__PURE__ */ jsx("span", { className: "sb-vd__addr-suggest-main", children: p.mainText?.text ?? p.text.toString() }),
        p.secondaryText?.text ? /* @__PURE__ */ jsx("span", { className: "sb-vd__addr-suggest-sub", children: p.secondaryText.text }) : null
      ] }) }, i)) }) : null
    ] }),
    status === "loading" && /* @__PURE__ */ jsx("p", { className: "sb-vd__addr-msg", children: strings.loading }),
    status === "ready" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "sb-vd__addr-map-toggle",
          "aria-expanded": mapOpen,
          onClick: () => setMapOpen((v) => !v),
          children: [
            "\u{1F4CD} ",
            mapOpen ? strings.hideMap : strings.showMap
          ]
        }
      ),
      mapOpen ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-map-wrap", children: [
        /* @__PURE__ */ jsx("div", { ref: mapDivRef, className: "sb-vd__addr-map", "data-testid": "delivery-address-map" }),
        /* @__PURE__ */ jsx("p", { className: "sb-vd__addr-map-hint", children: strings.mapHint })
      ] }) : null
    ] }) : null
  ] });
}
function isQuote(c) {
  return c != null && c !== "loading";
}
function money2(n) {
  return Math.round(n).toLocaleString("en-US");
}
function CostLine({ cost, strings }) {
  if (cost == null) return null;
  if (cost === "loading") {
    return /* @__PURE__ */ jsx("p", { className: "sb-vd__addr-cost sb-vd__addr-cost--muted", children: strings.costLoading });
  }
  if (!cost.matched) {
    return /* @__PURE__ */ jsxs("p", { className: "sb-vd__addr-cost sb-vd__addr-cost--muted", children: [
      strings.costPrefix,
      ": ",
      strings.costByRequest
    ] });
  }
  return /* @__PURE__ */ jsxs("p", { className: "sb-vd__addr-cost", children: [
    strings.costPrefix,
    ":",
    " ",
    /* @__PURE__ */ jsxs("b", { children: [
      money2(cost.price),
      " ",
      strings.currency
    ] })
  ] });
}
function ToggleRow({
  label,
  enabled,
  location,
  apiKey,
  strings,
  onToggle,
  onSelect,
  cost,
  children,
  hidePicker
}) {
  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-row", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": enabled,
        className: `sb-vd__addr-switch ${enabled ? "is-on" : ""}`,
        onClick: () => onToggle(!enabled),
        children: [
          /* @__PURE__ */ jsx("span", { className: "sb-vd__addr-switch-track", children: /* @__PURE__ */ jsx("span", { className: "sb-vd__addr-switch-thumb" }) }),
          /* @__PURE__ */ jsx("span", { className: "sb-vd__addr-switch-label", children: label })
        ]
      }
    ),
    enabled ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-picker", children: [
      children,
      !hidePicker ? /* @__PURE__ */ jsx(
        DeliveryAddressPicker,
        {
          apiKey,
          value: location,
          onSelect,
          strings: {
            unavailable: strings.unavailable,
            loading: strings.loading,
            searchPlaceholder: strings.searchPlaceholder,
            showMap: strings.showMap,
            hideMap: strings.hideMap,
            mapHint: strings.mapHint
          }
        }
      ) : null,
      /* @__PURE__ */ jsx(CostLine, { cost, strings })
    ] }) : null
  ] });
}
function DeliveryAddressSection({
  apiKey,
  pickupEnabled,
  dropoffEnabled,
  pickupLocation,
  dropoffLocation,
  pickupCost,
  dropoffCost,
  dropoffSameAsPickup,
  onPickupToggle,
  onDropoffToggle,
  onPickupSelect,
  onDropoffSelect,
  onDropoffSameToggle,
  strings
}) {
  const canMirrorPickup = pickupEnabled && pickupLocation != null;
  const mirroring = canMirrorPickup && dropoffSameAsPickup;
  const showTotal = pickupEnabled && dropoffEnabled && isQuote(pickupCost) && pickupCost.matched && isQuote(dropoffCost) && dropoffCost.matched;
  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-section", children: [
    /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: strings.title }),
    /* @__PURE__ */ jsx(
      ToggleRow,
      {
        label: strings.pickupToggle,
        enabled: pickupEnabled,
        location: pickupLocation,
        apiKey,
        strings,
        onToggle: onPickupToggle,
        onSelect: onPickupSelect,
        cost: pickupEnabled ? pickupCost : null
      }
    ),
    /* @__PURE__ */ jsx(
      ToggleRow,
      {
        label: strings.dropoffToggle,
        enabled: dropoffEnabled,
        location: dropoffLocation,
        apiKey,
        strings,
        onToggle: onDropoffToggle,
        onSelect: onDropoffSelect,
        cost: dropoffEnabled ? dropoffCost : null,
        hidePicker: mirroring,
        children: canMirrorPickup ? /* @__PURE__ */ jsxs("label", { className: "sb-vd__addr-same", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: dropoffSameAsPickup,
              onChange: (e) => onDropoffSameToggle(e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("span", { children: strings.sameAsPickup })
        ] }) : null
      }
    ),
    showTotal ? /* @__PURE__ */ jsxs("p", { className: "sb-vd__addr-total", children: [
      strings.costTotal,
      ":",
      " ",
      /* @__PURE__ */ jsxs("b", { children: [
        money2(pickupCost.price + dropoffCost.price),
        " ",
        strings.currency
      ] })
    ] }) : null
  ] });
}
var SPEC_KEYS = [
  "engine_volume",
  "horse_power",
  "fuel_type",
  "transmission",
  "drive_type",
  "sprint_0_100",
  "max_speed",
  "clearance",
  "weight",
  "tank_volume",
  "fuel_consumption"
];
var TRANSLATED_SPEC_KEYS = /* @__PURE__ */ new Set(["fuel_type", "transmission", "drive_type"]);
var SPEC_VALUE_LABELS = {
  ru: {
    automatic: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442",
    manual: "\u041C\u0435\u0445\u0430\u043D\u0438\u043A\u0430",
    cvt: "\u0412\u0430\u0440\u0438\u0430\u0442\u043E\u0440",
    robot: "\u0420\u043E\u0431\u043E\u0442",
    petrol: "\u0411\u0435\u043D\u0437\u0438\u043D",
    diesel: "\u0414\u0438\u0437\u0435\u043B\u044C",
    electric: "\u042D\u043B\u0435\u043A\u0442\u0440\u043E",
    hybrid: "\u0413\u0438\u0431\u0440\u0438\u0434",
    fwd: "\u041F\u0435\u0440\u0435\u0434\u043D\u0438\u0439",
    rwd: "\u0417\u0430\u0434\u043D\u0438\u0439",
    awd: "\u041F\u043E\u043B\u043D\u044B\u0439"
  },
  en: {
    automatic: "Automatic",
    manual: "Manual",
    cvt: "CVT",
    robot: "Robot",
    petrol: "Petrol",
    diesel: "Diesel",
    electric: "Electric",
    hybrid: "Hybrid",
    fwd: "FWD",
    rwd: "RWD",
    awd: "AWD"
  }
};
var S = {
  ru: {
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    closePhoto: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0442\u043E",
    share: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F",
    copied: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430",
    from: "\u043E\u0442",
    perDay: "/\u0434\u0435\u043D\u044C",
    priceUnit: "THB",
    available: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u0441\u0435\u0439\u0447\u0430\u0441",
    freesUp: "\u041E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u0441\u044F",
    busy: "\u0417\u0430\u043D\u044F\u0442\u0430",
    specs: "\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438",
    allSpecs: "\u0412\u0441\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438",
    equipment: "\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u044F",
    accessories: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438",
    perBooking: "\u0437\u0430 \u0431\u0440\u043E\u043D\u044C",
    accUnavailable: "\u041D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043D\u0430 \u044D\u0442\u0438 \u0434\u0430\u0442\u044B",
    deposit: "\u0414\u0435\u043F\u043E\u0437\u0438\u0442",
    prices: "\u0426\u0435\u043D\u044B",
    day: "\u0434\u0435\u043D\u044C",
    days: "\u0434\u043D\u0435\u0439",
    month: "\u043C\u0435\u0441",
    spansSeasons: "\u0426\u0435\u043D\u044B \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u0435\u0437\u043E\u043D",
    bookFrom: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026",
    error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
    name: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F",
    send: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441",
    tgQuick: "\u0411\u0440\u043E\u043D\u044C \u0432 1 \u043A\u043B\u0438\u043A \u0447\u0435\u0440\u0435\u0437 Telegram",
    tgQuickSub: "\u0411\u0435\u0437 \u0444\u043E\u0440\u043C \u2014 \u0431\u043E\u0442 \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442 \u0432\u0441\u0451 \u0437\u0430 \u0432\u0430\u0441",
    or: "\u0438\u043B\u0438",
    howToBook: "\u041A\u0430\u043A \u0437\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C?",
    back: "\u041D\u0430\u0437\u0430\u0434",
    bookCta: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
    formTitle: "\u0417\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
    manual: "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
    manualSub: "\u0418\u043C\u044F \u0438 \u043A\u043E\u043D\u0442\u0430\u043A\u0442 \u2014 \u0437\u0430\u0439\u043C\u0451\u0442 30 \u0441\u0435\u043A\u0443\u043D\u0434",
    dateGet: "\u0414\u0430\u0442\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F",
    dateReturn: "\u0414\u0430\u0442\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430",
    contactWay: "\u0421\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0438",
    phoneLabel: "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430",
    successTitle: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430!",
    successText: "\u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
    tooMany: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435",
    sendErr: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    phonePh: "+66...",
    tgPh: "@username",
    deliveryTitle: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430",
    deliveryPickup: "\u0414\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043C\u0430\u0448\u0438\u043D\u0443 \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443",
    deliveryDropoff: "\u0417\u0430\u0431\u0435\u0440\u0451\u043C \u043C\u0430\u0448\u0438\u043D\u0443 \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443",
    deliveryUnavailable: "\u041F\u043E\u0438\u0441\u043A \u0430\u0434\u0440\u0435\u0441\u0430 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",
    deliveryShowMap: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0430 \u043A\u0430\u0440\u0442\u0435",
    deliveryHideMap: "\u0421\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u0443",
    deliveryMapHint: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043C\u0435\u0441\u0442\u043E \u0438\u043B\u0438 \u0442\u043E\u0447\u043A\u0443 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435",
    deliverySearchPlaceholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u0438\u043B\u0438 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0435\u0441\u0442\u0430",
    deliverySameAsPickup: "\u0422\u0430\u043A\u043E\u0439 \u0436\u0435 \u0430\u0434\u0440\u0435\u0441, \u043A\u0430\u043A \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438",
    deliveryCostPrefix: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C",
    deliveryCostLoading: "\u0421\u0447\u0438\u0442\u0430\u0435\u043C \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\u2026",
    deliveryCostByRequest: "\u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
    deliveryCostTotal: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u043F\u0440\u0438\u0451\u043C\u043A\u0430",
    labels: {
      fuel_type: "\u0422\u043E\u043F\u043B\u0438\u0432\u043E",
      transmission: "\u041A\u041F\u041F",
      drive_type: "\u041F\u0440\u0438\u0432\u043E\u0434",
      engine_volume: "\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C",
      horse_power: "\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C",
      sprint_0_100: "\u0420\u0430\u0437\u0433\u043E\u043D 0\u2013100",
      max_speed: "\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C",
      clearance: "\u041A\u043B\u0438\u0440\u0435\u043D\u0441",
      weight: "\u041C\u0430\u0441\u0441\u0430",
      tank_volume: "\u0411\u0430\u043A",
      fuel_consumption: "\u0420\u0430\u0441\u0445\u043E\u0434"
    }
  },
  en: {
    close: "Close",
    closePhoto: "Close photo",
    share: "Share",
    copied: "Link copied",
    from: "from",
    perDay: "/day",
    priceUnit: "THB",
    available: "Available now",
    freesUp: "Frees up",
    busy: "Busy",
    specs: "Specs",
    allSpecs: "All specs",
    equipment: "Equipment",
    accessories: "Additional Options",
    perBooking: "per booking",
    accUnavailable: "Not available for these dates",
    deposit: "Deposit",
    prices: "Prices",
    day: "day",
    days: "days",
    month: "month",
    spansSeasons: "Prices shown for the current season",
    bookFrom: "Book from",
    loading: "Loading\u2026",
    error: "Failed to load",
    name: "Your name",
    send: "Send request",
    tgQuick: "1-click booking via Telegram",
    tgQuickSub: "No forms \u2014 the bot fills everything in for you",
    or: "or",
    howToBook: "How to book?",
    back: "Back",
    bookCta: "Book",
    formTitle: "Booking request",
    manual: "Fill in manually",
    manualSub: "Name and contact \u2014 takes 30 seconds",
    dateGet: "Pick-up date",
    dateReturn: "Return date",
    contactWay: "Contact method",
    phoneLabel: "Phone number",
    successTitle: "Request sent!",
    successText: "We will contact you shortly.",
    tooMany: "Too many requests, try later",
    sendErr: "Could not send. Please try again.",
    phonePh: "+66...",
    tgPh: "@username",
    deliveryTitle: "Delivery",
    deliveryPickup: "Deliver the vehicle to my address",
    deliveryDropoff: "We'll pick it up from my address",
    deliveryUnavailable: "Address search is temporarily unavailable",
    deliveryShowMap: "Pick on the map",
    deliveryHideMap: "Hide map",
    deliveryMapHint: "Tap a place or a point on the map",
    deliverySearchPlaceholder: "Enter an address or place name",
    deliverySameAsPickup: "Same address as delivery",
    deliveryCostPrefix: "Price",
    deliveryCostLoading: "Calculating price\u2026",
    deliveryCostByRequest: "on request",
    deliveryCostTotal: "Delivery & collection",
    labels: {
      fuel_type: "Fuel",
      transmission: "Transmission",
      drive_type: "Drive",
      engine_volume: "Engine",
      horse_power: "Power",
      sprint_0_100: "0\u2013100",
      max_speed: "Top speed",
      clearance: "Clearance",
      weight: "Weight",
      tank_volume: "Tank",
      fuel_consumption: "Consumption"
    }
  }
};
var HEADERS = { "ngrok-skip-browser-warning": "true" };
async function fetchDeliveryQuote(apiBase, location) {
  try {
    const res = await fetch(`${apiBase}/api/v1/catalog/delivery-quote/`, {
      method: "POST",
      headers: { "content-type": "application/json", ...HEADERS },
      body: JSON.stringify({ location })
    });
    if (!res.ok) return null;
    const j = await res.json();
    const price = parseFloat(j.price ?? "");
    if (!Number.isFinite(price)) return null;
    return { price, matched: Boolean(j.matched) };
  } catch {
    return null;
  }
}
function VehicleBookingModal({
  vehicle,
  apiBase,
  locale,
  botUsername,
  googleMapsApiKey,
  referralCode,
  telegramUser,
  onClose
}) {
  const t = S[locale];
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("loading");
  const [gi, setGi] = useState(0);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const minStart = !vehicle.is_available && vehicle.free_from && vehicle.free_from > todayISO() ? vehicle.free_from : todayISO();
  const [start, setStart] = useState(minStart);
  const [end, setEnd] = useState(nextDay(minStart));
  const [name, setName] = useState(telegramUser?.first_name || "");
  const [channel, setChannel] = useState(telegramUser ? "telegram" : "whatsapp");
  const [contact, setContact] = useState(telegramUser?.username ? `@${telegramUser.username}` : "");
  const [accessories, setAccessories] = useState({});
  const [accessoryLightbox, setAccessoryLightbox] = useState(null);
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [dropoffEnabled, setDropoffEnabled] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffSameAsPickup, setDropoffSameAsPickup] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState("detail");
  const [err, setErr] = useState("");
  const [tgSubmitting, setTgSubmitting] = useState(false);
  const [tgErr, setTgErr] = useState("");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef(null);
  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("vehicle", vehicle.id);
    if (referralCode) url.searchParams.set("ref", referralCode);
    const shareUrl = url.toString();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: vehicle.display_name, url: shareUrl });
      } catch {
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
      window.prompt(t.share, shareUrl);
    }
  };
  const SHEET_DISMISS_PX = 120;
  const dragStartY = useRef(0);
  const dragging = useRef(false);
  const dragOffsetRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragSmooth, setDragSmooth] = useState(false);
  const onGrabStart = (e) => {
    dragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    dragOffsetRef.current = 0;
    setDragSmooth(false);
  };
  const onGrabMove = (e) => {
    if (!dragging.current) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartY.current);
    dragOffsetRef.current = dy;
    setDragY(dy);
  };
  const onGrabEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setDragSmooth(true);
    if (dragOffsetRef.current > SHEET_DISMISS_PX) {
      setDragY(typeof window !== "undefined" ? window.innerHeight : 800);
      setTimeout(onClose, 240);
    } else {
      setDragY(0);
      setTimeout(() => setDragSmooth(false), 300);
    }
  };
  const trackRef = useRef(null);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setGi((cur) => i >= 0 && i !== cur ? i : cur);
  };
  const scrollToImage = (i, count) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setAccessories({});
    setAccessoryLightbox(null);
    fetch(`${apiBase}/api/v1/catalog/vehicles/${vehicle.id}/`, { headers: HEADERS }).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then((d2) => {
      if (!cancelled) {
        setDetail(d2);
        setState("ready");
      }
    }).catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicle.id]);
  useEffect(() => {
    if (start && (!end || end <= start)) setEnd(nextDay(start));
  }, [start, end]);
  const datesValid = Boolean(start && end && start >= minStart && end > start);
  const selectedAccessories = Object.entries(accessories).filter(([, qty]) => qty > 0).map(([accessory_id, quantity]) => ({ accessory_id, quantity }));
  const effectivePickupLocation = pickupEnabled ? pickupLocation : null;
  const effectiveDropoffLocation = dropoffEnabled ? dropoffSameAsPickup && pickupEnabled && pickupLocation ? pickupLocation : dropoffLocation : null;
  const [pickupCost, setPickupCost] = useState(null);
  const [dropoffCost, setDropoffCost] = useState(null);
  useEffect(() => {
    if (!effectivePickupLocation) {
      setPickupCost(null);
      return;
    }
    let cancelled = false;
    setPickupCost("loading");
    fetchDeliveryQuote(apiBase, effectivePickupLocation).then((c) => {
      if (!cancelled) setPickupCost(c);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, effectivePickupLocation?.lat, effectivePickupLocation?.lng]);
  useEffect(() => {
    if (!effectiveDropoffLocation) {
      setDropoffCost(null);
      return;
    }
    let cancelled = false;
    setDropoffCost("loading");
    fetchDeliveryQuote(apiBase, effectiveDropoffLocation).then((c) => {
      if (!cancelled) setDropoffCost(c);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, effectiveDropoffLocation?.lat, effectiveDropoffLocation?.lng]);
  const submit = async (e) => {
    e.preventDefault();
    if (submitting || !datesValid || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    setErr("");
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-requests/`, {
        method: "POST",
        headers: { "content-type": "application/json", ...HEADERS },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
          customer_name: name.trim(),
          contact_channel: channel,
          contact_identifier: contact.trim(),
          ...referralCode ? { referral_code: referralCode } : {},
          ...telegramUser?.user_id ? {
            telegram_user_data: {
              user_id: telegramUser.user_id,
              username: telegramUser.username,
              first_name: telegramUser.first_name
            }
          } : {},
          ...selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {},
          ...effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {},
          ...effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}
        })
      });
      if (res.ok) {
        setStage("success");
      } else {
        setErr(res.status === 429 ? t.tooMany : t.sendErr);
      }
    } catch {
      setErr(t.sendErr);
    } finally {
      setSubmitting(false);
    }
  };
  const handleTelegramBooking = async () => {
    if (tgSubmitting || !datesValid) return;
    setTgSubmitting(true);
    setTgErr("");
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-intents/`, {
        method: "POST",
        headers: { "content-type": "application/json", ...HEADERS },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
          ...referralCode ? { referral_code: referralCode } : {},
          ...selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {},
          ...effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {},
          ...effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}
        })
      });
      if (!res.ok) {
        setTgErr(res.status === 429 ? t.tooMany : t.sendErr);
        return;
      }
      const { token } = await res.json();
      if (!token) {
        setTgErr(t.sendErr);
        return;
      }
      const href = safeHref(`https://t.me/${botUsername}?start=bk_${encodeURIComponent(token)}`);
      if (!href) {
        setTgErr(t.sendErr);
        return;
      }
      window.location.href = href;
    } catch {
      setTgErr(t.sendErr);
    } finally {
      setTgSubmitting(false);
    }
  };
  const d = detail;
  const galleryUrls = (d?.gallery_images ?? []).map((g) => safeImageUrl(g.image_url)).filter((u) => Boolean(u));
  const fallbackImg = safeImageUrl(vehicle.photo_url ?? "") || "";
  const gallery = galleryUrls.length ? galleryUrls : fallbackImg ? [fallbackImg] : [];
  const mainImg = gallery[gi] || fallbackImg || "";
  const price = d?.min_price_per_day ?? vehicle.min_price_per_day;
  const renderAccessories = () => {
    if (!d || (d.accessories ?? []).length === 0) return null;
    return /* @__PURE__ */ jsxs("div", { className: "sb-vd__accessories", children: [
      /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: t.accessories }),
      /* @__PURE__ */ jsx("div", { className: "sb-acc__row", children: d.accessories.flatMap(
        (group) => group.items.map((item) => {
          const qty = accessories[item.id] || 0;
          const unavailable = item.available_stock !== null && item.available_stock <= 0;
          const atMax = !unavailable && item.available_stock !== null && qty >= item.available_stock;
          const itemName = locale === "ru" ? item.name_ru : item.name_en;
          const categoryName = locale === "ru" ? group.name_ru : group.name_en;
          return /* @__PURE__ */ jsxs("div", { className: `sb-acc__item ${unavailable ? "is-unavailable" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { className: "sb-acc__item-category", children: categoryName }),
            item.photo_url ? (
              // Tapping the photo OR the expand badge opens the same
              // fullscreen preview — the badge is purely a visual
              // "you can tap this" affordance, no separate handler.
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "sb-acc__item-photo sb-acc__item-photo--clickable",
                  onClick: () => setAccessoryLightbox({
                    // Prefer the large display variant for a crisp
                    // fullscreen; fall back to the thumb.
                    photoUrl: safeImageUrl(item.photo_full_url ?? item.photo_url ?? void 0) ?? "",
                    description: item.description,
                    name: itemName
                  }),
                  "aria-label": itemName,
                  children: [
                    /* @__PURE__ */ jsx("img", { src: safeImageUrl(item.photo_url ?? void 0), alt: itemName }),
                    /* @__PURE__ */ jsx("span", { className: "sb-acc__item-expand", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ jsx("path", { d: "m21 21-6-6m6 6v-4.8m0 4.8h-4.8" }),
                      /* @__PURE__ */ jsx("path", { d: "M3 16.2V21m0 0h4.8M3 21l6-6" }),
                      /* @__PURE__ */ jsx("path", { d: "M21 7.8V3m0 0h-4.8M21 3l-6 6" }),
                      /* @__PURE__ */ jsx("path", { d: "M3 7.8V3m0 0h4.8M3 3l6 6" })
                    ] }) })
                  ]
                }
              )
            ) : /* @__PURE__ */ jsx("div", { className: "sb-acc__item-photo" }),
            /* @__PURE__ */ jsxs("div", { className: "sb-acc__item-info", children: [
              /* @__PURE__ */ jsx("span", { className: "sb-acc__item-name", children: itemName }),
              item.price != null ? /* @__PURE__ */ jsxs("span", { className: "sb-acc__item-price", children: [
                Math.round(item.price).toLocaleString("en-US"),
                " ",
                t.priceUnit,
                " ",
                item.price_unit === "per_day" ? t.perDay : t.perBooking
              ] }) : null,
              unavailable ? /* @__PURE__ */ jsx("span", { className: "sb-acc__item-unavailable", children: t.accUnavailable }) : null
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sb-acc__stepper", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "-",
                  disabled: qty === 0,
                  onClick: () => setAccessories((prev) => {
                    const next = { ...prev };
                    if (qty - 1 <= 0) delete next[item.id];
                    else next[item.id] = qty - 1;
                    return next;
                  }),
                  children: "\u2212"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "sb-acc__stepper-value", children: qty }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "+",
                  disabled: unavailable || atMax,
                  onClick: () => setAccessories((prev) => ({ ...prev, [item.id]: qty + 1 })),
                  children: "+"
                }
              )
            ] })
          ] }, item.id);
        })
      ) })
    ] });
  };
  return createPortal(
    // Wrap in .sb-root so the design tokens (--sb-*) cascade into the portal,
    // which lives outside the page's .sb-root.
    /* @__PURE__ */ jsxs("div", { className: "sb-root", children: [
      /* @__PURE__ */ jsx("div", { className: "sb-modal", role: "dialog", "aria-modal": "true", onClick: onClose, children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "sb-modal__dialog",
          ref: dialogRef,
          onClick: (e) => e.stopPropagation(),
          style: dragY > 0 || dragSmooth ? { transform: `translateY(${dragY}px)`, transition: dragSmooth ? "transform 0.3s ease-out" : "none" } : void 0,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "sb-modal__grabber",
                onTouchStart: onGrabStart,
                onTouchMove: onGrabMove,
                onTouchEnd: onGrabEnd,
                children: /* @__PURE__ */ jsx("span", { className: "sb-modal__grabber-bar", "aria-hidden": true })
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", className: "sb-modal__close", "aria-label": t.close, onClick: onClose, children: "\xD7" }),
            state === "loading" ? /* @__PURE__ */ jsx("p", { className: "sb-modal__state", children: t.loading }) : null,
            state === "error" ? /* @__PURE__ */ jsx("p", { className: "sb-modal__state", children: t.error }) : null,
            state === "ready" && d ? stage === "success" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__success", children: [
              /* @__PURE__ */ jsx("div", { className: "sb-modal__check", "aria-hidden": true, children: "\u2713" }),
              /* @__PURE__ */ jsx("h3", { children: t.successTitle }),
              /* @__PURE__ */ jsx("p", { children: t.successText }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "sb-btn", onClick: onClose, children: "OK" })
            ] }) : stage === "detail" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__body", children: [
              gallery.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__media", children: [
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__gallery", children: [
                  /* @__PURE__ */ jsx("div", { className: "sb-vd__frame", ref: trackRef, onScroll: onTrackScroll, children: gallery.map((u, i) => /* @__PURE__ */ jsx(
                    "img",
                    {
                      className: "sb-vd__photo",
                      src: u,
                      alt: d.display_name,
                      loading: i === 0 ? void 0 : "lazy",
                      draggable: false
                    },
                    i
                  )) }),
                  gallery.length > 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "sb-vd__nav sb-vd__nav--prev",
                        "aria-label": "\u2039",
                        onClick: () => scrollToImage(gi - 1, gallery.length),
                        children: "\u2039"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "sb-vd__nav sb-vd__nav--next",
                        "aria-label": "\u203A",
                        onClick: () => scrollToImage(gi + 1, gallery.length),
                        children: "\u203A"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "sb-vd__counter", children: [
                      gi + 1,
                      "/",
                      gallery.length
                    ] })
                  ] }) : null
                ] }),
                gallery.length > 1 ? /* @__PURE__ */ jsx("div", { className: "sb-vd__thumbs", children: gallery.map((u, i) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: `sb-vd__thumb ${i === gi ? "is-active" : ""}`,
                    onClick: () => scrollToImage(i, gallery.length),
                    "aria-label": `${i + 1}`,
                    children: /* @__PURE__ */ jsx("img", { src: u, alt: "", loading: "lazy" })
                  },
                  i
                )) }) : null
              ] }) : null,
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__info", children: [
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__header", children: [
                  /* @__PURE__ */ jsx("h3", { className: "sb-vd__name", children: d.display_name }),
                  price != null ? /* @__PURE__ */ jsxs("p", { className: "sb-vd__price", children: [
                    /* @__PURE__ */ jsxs("small", { children: [
                      t.from,
                      " "
                    ] }),
                    Math.round(price).toLocaleString("en-US"),
                    /* @__PURE__ */ jsxs("small", { children: [
                      " ",
                      t.priceUnit,
                      t.perDay
                    ] })
                  ] }) : null
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__meta-row", children: [
                  d.year ? /* @__PURE__ */ jsx("span", { className: "sb-vd__year", children: d.year }) : null,
                  d.category ? /* @__PURE__ */ jsx("span", { className: "sb-vd__badge", style: { backgroundColor: d.category.color }, children: categoryLabel(d.category, locale) }) : null,
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: `sb-vd__share ${copied ? "is-copied" : ""}`,
                      onClick: handleShare,
                      "aria-label": t.share,
                      children: [
                        /* @__PURE__ */ jsxs(
                          "svg",
                          {
                            className: "sb-vd__share-ico",
                            viewBox: "0 0 24 24",
                            width: "14",
                            height: "14",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            "aria-hidden": true,
                            children: [
                              /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "3" }),
                              /* @__PURE__ */ jsx("circle", { cx: "6", cy: "12", r: "3" }),
                              /* @__PURE__ */ jsx("circle", { cx: "18", cy: "19", r: "3" }),
                              /* @__PURE__ */ jsx("line", { x1: "8.6", y1: "13.5", x2: "15.4", y2: "17.5" }),
                              /* @__PURE__ */ jsx("line", { x1: "15.4", y1: "6.5", x2: "8.6", y2: "10.5" })
                            ]
                          }
                        ),
                        copied ? t.copied : t.share
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: `sb-vd__avail ${d.is_available ? "is-free" : "is-busy"}`, children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__avail-dot", "aria-hidden": true }),
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__avail-text", children: d.is_available ? t.available : d.free_from ? `${t.freesUp}: ${d.free_from}` : t.busy }),
                  !d.is_available && d.free_from && d.free_from !== start ? /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "sb-vd__avail-btn",
                      onClick: () => {
                        const from = d.free_from;
                        setStart(from);
                        if (end <= from) setEnd(nextDay(from));
                      },
                      children: [
                        t.bookFrom,
                        " ",
                        d.free_from
                      ]
                    }
                  ) : null
                ] }),
                (d.advantages ?? []).length > 0 ? /* @__PURE__ */ jsx("div", { className: "sb-vd__chips", children: d.advantages.map((a, i) => /* @__PURE__ */ jsx("span", { className: "sb-chip", children: a }, i)) }) : null,
                (d.pricing_table ?? []).length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__prices", children: [
                  /* @__PURE__ */ jsxs("div", { className: "sb-vd__prices-head", children: [
                    /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: t.prices }),
                    d.pricing_season_name ? /* @__PURE__ */ jsxs("span", { className: "sb-vd__season", children: [
                      "\xB7 ",
                      d.pricing_season_name
                    ] }) : null
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "sb-vd__prices-grid", children: d.pricing_table.map((row, i) => /* @__PURE__ */ jsxs("div", { className: "sb-vd__price-row", children: [
                    /* @__PURE__ */ jsx("span", { className: "sb-vd__price-period", children: row.is_monthly ? `${row.period_label} ${t.days} (${t.month})` : row.min_days === row.max_days ? `${row.period_label} ${row.min_days === 1 ? t.day : t.days}` : `${row.period_label} ${t.days}` }),
                    /* @__PURE__ */ jsx("span", { className: "sb-vd__price-value", children: row.is_monthly && row.monthly_price != null ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      money(row.monthly_price),
                      /* @__PURE__ */ jsxs("small", { children: [
                        " ",
                        "(",
                        Math.round(row.price_per_day).toLocaleString("en-US"),
                        t.perDay,
                        ")"
                      ] })
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      Math.round(row.price_per_day).toLocaleString("en-US"),
                      /* @__PURE__ */ jsxs("small", { children: [
                        " ",
                        t.priceUnit,
                        t.perDay
                      ] })
                    ] }) })
                  ] }, i)) }),
                  d.pricing_spans_seasons ? /* @__PURE__ */ jsx("p", { className: "sb-vd__season-note", children: t.spansSeasons }) : null
                ] }) : null,
                (d.deposits ?? []).length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__deposits", children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: t.deposit }),
                  /* @__PURE__ */ jsx("div", { className: "sb-vd__deposit-pills", children: d.deposits.map((dep, i) => /* @__PURE__ */ jsxs("span", { className: "sb-vd__deposit-pill", children: [
                    money(dep.amount),
                    " ",
                    dep.currency_code
                  ] }, i)) })
                ] }) : null,
                (d.options ?? []).length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__equipment-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: t.equipment }),
                  /* @__PURE__ */ jsx("div", { className: "sb-vd__chips", children: d.options.map((o, i) => /* @__PURE__ */ jsx("span", { className: "sb-chip sb-chip--ghost", children: o }, i)) })
                ] }) : null,
                SPEC_KEYS.some((k) => d[k]) ? (() => {
                  const present = SPEC_KEYS.filter((k) => d[k]);
                  const visible = specsExpanded ? present : present.slice(0, 4);
                  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__specs-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: t.specs }),
                    /* @__PURE__ */ jsxs("div", { className: "sb-vd__specs-card", children: [
                      /* @__PURE__ */ jsx("div", { className: "sb-vd__specs", children: visible.map((k) => {
                        const raw = String(d[k]);
                        const val = TRANSLATED_SPEC_KEYS.has(k) ? SPEC_VALUE_LABELS[locale][raw.toLowerCase()] ?? raw : raw;
                        return /* @__PURE__ */ jsxs("div", { className: "sb-vd__spec", children: [
                          /* @__PURE__ */ jsx("span", { children: t.labels[k] }),
                          /* @__PURE__ */ jsx("b", { children: val })
                        ] }, k);
                      }) }),
                      present.length > 4 ? /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          className: "sb-vd__specs-toggle",
                          onClick: () => setSpecsExpanded((v) => !v),
                          children: [
                            t.allSpecs,
                            " ",
                            specsExpanded ? "\u25B2" : "\u25BC"
                          ]
                        }
                      ) : null
                    ] })
                  ] });
                })() : null
              ] }),
              /* @__PURE__ */ jsx("div", { className: "sb-vd__cta", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-vd__cta-btn",
                  onClick: () => setStage("choice"),
                  children: t.bookCta
                }
              ) })
            ] }) : stage === "choice" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__body sb-modal__body--book", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-vd__back", onClick: () => setStage("detail"), children: [
                "\u2039 ",
                t.back
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "sb-bk__title", children: t.howToBook }),
              /* @__PURE__ */ jsxs("div", { className: "sb-bk__vehicle", children: [
                mainImg ? /* @__PURE__ */ jsx("img", { className: "sb-bk__photo", src: mainImg, alt: "" }) : null,
                /* @__PURE__ */ jsxs("div", { className: "sb-bk__meta", children: [
                  /* @__PURE__ */ jsx("p", { className: "sb-bk__name", children: d.display_name }),
                  price != null ? /* @__PURE__ */ jsxs("p", { className: "sb-bk__price", children: [
                    /* @__PURE__ */ jsxs("small", { children: [
                      t.from,
                      " "
                    ] }),
                    Math.round(price).toLocaleString("en-US"),
                    /* @__PURE__ */ jsxs("small", { children: [
                      " ",
                      t.priceUnit,
                      t.perDay
                    ] })
                  ] }) : null
                ] })
              ] }),
              renderAccessories(),
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__dates", children: [
                /* @__PURE__ */ jsxs("label", { children: [
                  t.dateGet,
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "date",
                      className: "sb-input",
                      value: start,
                      min: minStart,
                      onChange: (e) => setStart(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { children: [
                  t.dateReturn,
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "date",
                      className: "sb-input",
                      value: end,
                      min: nextDay(start),
                      onChange: (e) => setEnd(e.target.value)
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                DeliveryAddressSection,
                {
                  apiKey: googleMapsApiKey,
                  pickupEnabled,
                  dropoffEnabled,
                  pickupLocation,
                  dropoffLocation,
                  pickupCost,
                  dropoffCost,
                  dropoffSameAsPickup,
                  onPickupToggle: (enabled) => {
                    setPickupEnabled(enabled);
                    if (!enabled) setPickupLocation(null);
                  },
                  onDropoffToggle: (enabled) => {
                    setDropoffEnabled(enabled);
                    if (!enabled) setDropoffLocation(null);
                  },
                  onPickupSelect: setPickupLocation,
                  onDropoffSelect: (loc) => {
                    setDropoffLocation(loc);
                    setDropoffSameAsPickup(false);
                  },
                  onDropoffSameToggle: setDropoffSameAsPickup,
                  strings: {
                    title: t.deliveryTitle,
                    pickupToggle: t.deliveryPickup,
                    dropoffToggle: t.deliveryDropoff,
                    unavailable: t.deliveryUnavailable,
                    loading: t.loading,
                    searchPlaceholder: t.deliverySearchPlaceholder,
                    showMap: t.deliveryShowMap,
                    hideMap: t.deliveryHideMap,
                    mapHint: t.deliveryMapHint,
                    sameAsPickup: t.deliverySameAsPickup,
                    costPrefix: t.deliveryCostPrefix,
                    costLoading: t.deliveryCostLoading,
                    costByRequest: t.deliveryCostByRequest,
                    costTotal: t.deliveryCostTotal,
                    currency: t.priceUnit
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__book-actions", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    className: "sb-vd__tg-card",
                    disabled: !datesValid || tgSubmitting,
                    onClick: handleTelegramBooking,
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-icon", "aria-hidden": true, children: "\u2708" }),
                      /* @__PURE__ */ jsxs("span", { className: "sb-vd__tg-text", children: [
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-title", children: t.tgQuick }),
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-sub", children: tgSubmitting ? t.loading : t.tgQuickSub })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-arrow", "aria-hidden": true, children: "\u203A" })
                    ]
                  }
                ),
                tgErr ? /* @__PURE__ */ jsx("p", { className: "sb-form__status sb-form__status--err", children: tgErr }) : null,
                /* @__PURE__ */ jsx("div", { className: "sb-vd__or", children: t.or }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    className: "sb-vd__option-card",
                    disabled: !datesValid,
                    onClick: () => setStage("form"),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "sb-vd__option-icon", "aria-hidden": true, children: "\u270E" }),
                      /* @__PURE__ */ jsxs("span", { className: "sb-vd__tg-text", children: [
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-title", children: t.manual }),
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-sub", children: t.manualSub })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-arrow", "aria-hidden": true, children: "\u203A" })
                    ]
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "sb-modal__body sb-modal__body--book", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-vd__back", onClick: () => setStage("choice"), children: [
                "\u2039 ",
                t.back
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "sb-bk__title", children: t.formTitle }),
              /* @__PURE__ */ jsxs("div", { className: "sb-bk__vehicle", children: [
                mainImg ? /* @__PURE__ */ jsx("img", { className: "sb-bk__photo", src: mainImg, alt: "" }) : null,
                /* @__PURE__ */ jsxs("div", { className: "sb-bk__meta", children: [
                  /* @__PURE__ */ jsx("p", { className: "sb-bk__name", children: d.display_name }),
                  price != null ? /* @__PURE__ */ jsxs("p", { className: "sb-bk__price", children: [
                    /* @__PURE__ */ jsxs("small", { children: [
                      t.from,
                      " "
                    ] }),
                    Math.round(price).toLocaleString("en-US"),
                    /* @__PURE__ */ jsxs("small", { children: [
                      " ",
                      t.priceUnit,
                      t.perDay
                    ] })
                  ] }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxs("form", { className: "sb-vd__book", onSubmit: submit, children: [
                /* @__PURE__ */ jsxs("label", { className: "sb-vd__field", children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__field-label", children: t.name }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "sb-input",
                      type: "text",
                      required: true,
                      value: name,
                      onChange: (e) => setName(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__field", children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__field-label", children: t.contactWay }),
                  /* @__PURE__ */ jsxs("div", { className: "sb-vd__channel", role: "group", "aria-label": t.contactWay, children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: channel === "whatsapp" ? "is-active" : "",
                        onClick: () => setChannel("whatsapp"),
                        children: "WhatsApp"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: channel === "telegram" ? "is-active" : "",
                        onClick: () => setChannel("telegram"),
                        children: "Telegram"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "sb-vd__field", children: [
                  /* @__PURE__ */ jsx("span", { className: "sb-vd__field-label", children: t.phoneLabel }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "sb-input",
                      type: "text",
                      placeholder: channel === "whatsapp" ? t.phonePh : t.tgPh,
                      required: true,
                      value: contact,
                      onChange: (e) => setContact(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "sb-vd__dates-summary", children: [
                  t.dateGet,
                  ": ",
                  /* @__PURE__ */ jsx("b", { children: formatShortDate(start, locale) }),
                  " \u2014 ",
                  t.dateReturn,
                  ": ",
                  /* @__PURE__ */ jsx("b", { children: formatShortDate(end, locale) })
                ] }),
                effectivePickupLocation ? /* @__PURE__ */ jsxs("p", { className: "sb-vd__dates-summary", children: [
                  t.deliveryPickup,
                  ": ",
                  /* @__PURE__ */ jsx("b", { children: effectivePickupLocation.address })
                ] }) : null,
                effectiveDropoffLocation ? /* @__PURE__ */ jsxs("p", { className: "sb-vd__dates-summary", children: [
                  t.deliveryDropoff,
                  ": ",
                  /* @__PURE__ */ jsx("b", { children: effectiveDropoffLocation.address })
                ] }) : null,
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "sb-btn sb-btn--block",
                    type: "submit",
                    disabled: submitting || !datesValid,
                    children: t.send
                  }
                ),
                err ? /* @__PURE__ */ jsx("p", { className: "sb-form__status sb-form__status--err", children: err }) : null
              ] })
            ] }) : null
          ]
        }
      ) }),
      accessoryLightbox ? /* @__PURE__ */ jsxs(
        "div",
        {
          className: "sb-acc-lightbox",
          role: "dialog",
          "aria-modal": "true",
          onClick: () => setAccessoryLightbox(null),
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "sb-acc-lightbox__close",
                "aria-label": t.closePhoto,
                onClick: () => setAccessoryLightbox(null),
                children: "\xD7"
              }
            ),
            /* @__PURE__ */ jsxs("figure", { className: "sb-acc-lightbox__figure", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  className: "sb-acc-lightbox__photo",
                  src: accessoryLightbox.photoUrl,
                  alt: accessoryLightbox.name
                }
              ),
              accessoryLightbox.description ? /* @__PURE__ */ jsx("figcaption", { className: "sb-acc-lightbox__caption", children: accessoryLightbox.description }) : null
            ] })
          ]
        }
      ) : null
    ] }),
    document.body
  );
}
function defaultFilterState() {
  return { vehicleType: void 0, category: void 0, search: void 0, sort: "default" };
}
function FilterBar({ filters, categories, onChange, strings: t, locale }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const today = todayISO();
  const handleFromChange = (value) => {
    const patch = { availableFrom: value || void 0 };
    if (filters.availableTo && value && filters.availableTo <= value) {
      patch.availableTo = nextDay(value);
    }
    onChange(patch);
  };
  const hasActiveFilters = Boolean(
    filters.search || filters.vehicleType || filters.category || filters.availableFrom || filters.availableTo || filters.sort && filters.sort !== "default"
  );
  const activeCategory = categories.find((c) => c.id === filters.category);
  const cycleSort = () => {
    const order = ["default", "price_asc", "price_desc"];
    const next = order[(order.indexOf(filters.sort) + 1) % order.length];
    onChange({ sort: next });
  };
  const sortLabel = filters.sort === "price_asc" ? t.sortPriceAsc : filters.sort === "price_desc" ? t.sortPriceDesc : t.sortDefault;
  return /* @__PURE__ */ jsxs("div", { className: "sb-filterbar", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__search", children: [
      /* @__PURE__ */ jsxs("svg", { className: "sb-filterbar__search-ico", viewBox: "0 0 24 24", width: "16", height: "16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
        /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "7" }),
        /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "sb-input sb-filterbar__search-input",
          value: filters.search || "",
          onChange: (e) => onChange({ search: e.target.value || void 0 }),
          placeholder: t.search,
          "aria-label": t.search
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__row", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-filterbar__pill ${!filters.vehicleType && !filters.category ? "is-active" : ""}`,
          onClick: () => onChange({ vehicleType: void 0, category: void 0 }),
          children: t.all
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-filterbar__pill ${filters.vehicleType === "car" && !filters.category ? "is-active" : ""}`,
          onClick: () => onChange({ vehicleType: "car", category: void 0 }),
          children: t.cars
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-filterbar__pill ${filters.vehicleType === "motorcycle" && !filters.category ? "is-active" : ""}`,
          onClick: () => onChange({ vehicleType: "motorcycle", category: void 0 }),
          children: t.motorcycles
        }
      ),
      categories.length > 0 ? /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `sb-filterbar__pill ${filters.category ? "is-active" : ""}`,
          style: activeCategory ? { backgroundColor: activeCategory.color, borderColor: "transparent" } : void 0,
          onClick: () => setCategoryOpen((v) => !v),
          children: [
            /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
              /* @__PURE__ */ jsx("line", { x1: "4", y1: "6", x2: "20", y2: "6" }),
              /* @__PURE__ */ jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }),
              /* @__PURE__ */ jsx("line", { x1: "4", y1: "18", x2: "20", y2: "18" }),
              /* @__PURE__ */ jsx("circle", { cx: "8", cy: "6", r: "1.5", fill: "currentColor", stroke: "none" }),
              /* @__PURE__ */ jsx("circle", { cx: "16", cy: "12", r: "1.5", fill: "currentColor", stroke: "none" }),
              /* @__PURE__ */ jsx("circle", { cx: "10", cy: "18", r: "1.5", fill: "currentColor", stroke: "none" })
            ] }),
            activeCategory ? categoryLabel(activeCategory, locale) : t.category
          ]
        }
      ) : null,
      hasActiveFilters ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "sb-filterbar__clear",
          onClick: () => {
            onChange(defaultFilterState());
            setCategoryOpen(false);
          },
          "aria-label": t.clearFilters,
          children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
            /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
            /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
          ] })
        }
      ) : null
    ] }),
    categoryOpen ? /* @__PURE__ */ jsx("div", { className: "sb-filterbar__categories", children: categories.map((cat) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `sb-filterbar__pill ${filters.category === cat.id ? "is-active" : ""}`,
        style: filters.category === cat.id ? { backgroundColor: cat.color, borderColor: "transparent" } : { backgroundColor: `${cat.color}1f`, borderColor: `${cat.color}33` },
        onClick: () => {
          onChange({ category: filters.category === cat.id ? void 0 : cat.id, vehicleType: void 0 });
          setCategoryOpen(false);
        },
        children: categoryLabel(cat, locale)
      },
      cat.id
    )) }) : null,
    /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__row", children: [
      /* @__PURE__ */ jsxs("svg", { className: "sb-filterbar__cal-ico", viewBox: "0 0 24 24", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
        /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
        /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
        /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
        /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          className: "sb-input sb-filterbar__date",
          "aria-label": t.dateFrom,
          value: filters.availableFrom || "",
          min: today,
          onChange: (e) => handleFromChange(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "sb-filterbar__date-sep", children: "\u2014" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          className: "sb-input sb-filterbar__date",
          "aria-label": t.dateTo,
          value: filters.availableTo || "",
          min: filters.availableFrom ? nextDay(filters.availableFrom) : nextDay(today),
          onChange: (e) => onChange({ availableTo: e.target.value || void 0 })
        }
      ),
      /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-filterbar__sort", onClick: cycleSort, children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "9", y2: "6" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "7", y2: "12" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "5", y2: "18" }),
          /* @__PURE__ */ jsx("path", { d: "M17 4v16m0 0-4-4m4 4 4-4" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: filters.sort !== "default" ? "sb-filterbar__sort-active" : "", children: sortLabel })
      ] })
    ] })
  ] });
}
function setVehicleParam(id) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("vehicle", id);
  else url.searchParams.delete("vehicle");
  window.history.replaceState(null, "", url.toString());
}
function categoryLabel(category, locale) {
  return locale === "en" && category.name_en ? category.name_en : category.name;
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
    error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433",
    // Filter bar (showFilters=true only) — parity with frontend_catalog i18n.
    cars: "\u0410\u0432\u0442\u043E",
    motorcycles: "\u041C\u043E\u0442\u043E",
    category: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",
    search: "\u041F\u043E\u0438\u0441\u043A...",
    sortDefault: "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430",
    sortPriceAsc: "\u0414\u0435\u0448\u0435\u0432\u043B\u0435",
    sortPriceDesc: "\u0414\u043E\u0440\u043E\u0436\u0435",
    dateFrom: "\u0414\u0430\u0442\u0430 \u0441",
    dateTo: "\u0414\u0430\u0442\u0430 \u043F\u043E",
    clearFilters: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B"
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
    error: "Failed to load catalog",
    cars: "Cars",
    motorcycles: "Motorcycles",
    category: "Category",
    search: "Search...",
    sortDefault: "Sort",
    sortPriceAsc: "Cheapest",
    sortPriceDesc: "Priciest",
    dateFrom: "From date",
    dateTo: "To date",
    clearFilters: "Clear filters"
  }
};
function buildFilteredVehiclesUrl(apiBase, f) {
  const qs = new URLSearchParams();
  if (f.vehicleType) qs.set("vehicle_type", f.vehicleType);
  if (f.category) qs.set("category", f.category);
  if (f.search) qs.set("search", f.search);
  if (f.availableFrom) qs.set("available_from", f.availableFrom);
  if (f.availableTo) qs.set("available_to", f.availableTo);
  const s = qs.toString();
  return `${apiBase}/api/v1/catalog/vehicles/${s ? `?${s}` : ""}`;
}
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
  anchorId,
  vehicleType = "car",
  apiBase = "",
  telegramBot = "shiba_cars_test_bot",
  // Not a Puck field (see the prop's own docstring): the default reads the
  // HOST's own env at build time. It is deliberately NOT baked into Puck's
  // static `defaultProps` (config.tsx) — that would freeze the literal key
  // VALUE into every page's stored JSON forever, defeating key rotation.
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  defaultCategory,
  locale: localeProp,
  showFilters = false,
  referralCode,
  telegramUser,
  puck
}) {
  const locale = localeProp ?? (puck?.metadata?.locale === "en" ? "en" : "ru");
  const t = STRINGS[locale];
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [state, setState] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(defaultFilterState);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const handleFiltersChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;
    const changedKeys = Object.keys(filters).filter(
      (key) => filters[key] !== prev[key]
    );
    const searchOnly = changedKeys.length === 1 && changedKeys[0] === "search";
    if (searchOnly) {
      const timer = setTimeout(() => setDebouncedFilters(filters), 300);
      return () => clearTimeout(timer);
    }
    setDebouncedFilters(filters);
  }, [filters]);
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setActiveCat(null);
    const headers = { "ngrok-skip-browser-warning": "true" };
    const vehiclesUrl = showFilters ? buildFilteredVehiclesUrl(apiBase, debouncedFilters) : `${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`;
    Promise.all([
      fetch(`${apiBase}/api/v1/catalog/categories/`, { headers }).then(
        (r) => r.ok ? r.json() : []
      ),
      fetch(vehiclesUrl, { headers }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
    ]).then(([cats, list]) => {
      if (cancelled) return;
      const catList = Array.isArray(cats) ? cats : [];
      const vehList = Array.isArray(list) ? list : [];
      setCategories(catList);
      setVehicles(vehList);
      if (!showFilters) {
        const want = (defaultCategory ?? "").trim().toLowerCase();
        const usedIds = new Set(vehList.map((v) => v.category?.id).filter(Boolean));
        const def = want ? catList.find((c) => usedIds.has(c.id) && c.name.trim().toLowerCase() === want) : void 0;
        setActiveCat(def ? def.id : null);
      }
      setState("ready");
    }).catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicleType, defaultCategory, showFilters, debouncedFilters]);
  const didDeepLink = useRef(false);
  useEffect(() => {
    if (didDeepLink.current || state !== "ready") return;
    didDeepLink.current = true;
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("vehicle");
    if (!id) return;
    const match = vehicles.find((v) => v.id === id);
    if (!match) return;
    setSelected(match);
    if (anchorId) {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state, vehicles, anchorId]);
  const lastSyncedId = useRef(null);
  useEffect(() => {
    const id = selected?.id ?? null;
    if (id) {
      setVehicleParam(id);
      lastSyncedId.current = id;
    } else if (lastSyncedId.current) {
      setVehicleParam(null);
      lastSyncedId.current = null;
    }
  }, [selected]);
  const usedCats = new Set(
    vehicles.map((v) => v.category?.id).filter((id) => Boolean(id))
  );
  const tabs = useMemo(() => {
    const used = categories.filter((c) => usedCats.has(c.id));
    const want = (defaultCategory ?? "").trim().toLowerCase();
    if (!want) return used;
    const idx = used.findIndex((c) => c.name.trim().toLowerCase() === want);
    if (idx <= 0) return used;
    const copy = [...used];
    const [d] = copy.splice(idx, 1);
    return [d, ...copy];
  }, [categories, vehicles, defaultCategory]);
  const groups = useMemo(() => {
    if (showFilters) return groupVehicles(vehicles);
    const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
    return groupVehicles(list);
  }, [vehicles, activeCat, showFilters]);
  const displayGroups = useMemo(() => {
    if (!showFilters || filters.sort === "default") return groups;
    const dir = filters.sort === "price_asc" ? 1 : -1;
    return [...groups].sort((a, b) => {
      const pa = a.vehicle.min_price_per_day ?? Infinity;
      const pb = b.vehicle.min_price_per_day ?? Infinity;
      return (pa - pb) * dir;
    });
  }, [groups, showFilters, filters.sort]);
  return /* @__PURE__ */ jsxs(Section, { className: "sb-vcatalog", id: anchorId || void 0, children: [
    heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    showFilters ? /* @__PURE__ */ jsx(
      FilterBar,
      {
        filters,
        categories,
        onChange: handleFiltersChange,
        strings: t,
        locale
      }
    ) : state === "ready" && tabs.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vcatalog__tabs", children: [
      tabs.map((c) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-vcatalog__tab ${activeCat === c.id ? "sb-vcatalog__tab--active" : ""}`,
          onClick: () => setActiveCat(c.id),
          children: categoryLabel(c, locale)
        },
        c.id
      )),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-vcatalog__tab ${activeCat === null ? "sb-vcatalog__tab--active" : ""}`,
          onClick: () => setActiveCat(null),
          children: t.all
        }
      )
    ] }) : null,
    state === "loading" ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.loading }) : null,
    state === "error" ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.error }) : null,
    state === "ready" && (displayGroups.length === 0 ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.empty }) : /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__grid", children: displayGroups.map((g) => {
      const v = g.vehicle;
      const countLabel = g.total > 1 ? g.availableCount > 0 ? `${g.availableCount} ${t.available}` : `${g.total} ${t.total}` : null;
      return /* @__PURE__ */ jsx("button", { type: "button", className: "sb-vcard", onClick: () => setSelected(v), children: /* @__PURE__ */ jsxs("div", { className: "sb-vcard__media", children: [
        v.photo_url ? /* @__PURE__ */ jsx("img", { src: v.photo_url, alt: v.display_name, loading: "lazy" }) : null,
        v.category && (showFilters || activeCat === null) ? (
          // Tab mode: badge only makes sense on «Все» — on a specific
          // category tab every card is that category, so it's just
          // noise. Filter mode has no such tab (parity with the
          // standalone catalog's VehicleCard, which always shows it).
          /* @__PURE__ */ jsx("span", { className: "sb-vcard__badge", style: { backgroundColor: v.category.color }, children: categoryLabel(v.category, locale) })
        ) : null,
        countLabel ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__count", children: countLabel }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-vcard__overlay", children: [
          !v.is_available ? /* @__PURE__ */ jsxs("span", { className: `sb-vcard__status ${v.free_from ? "sb-vcard__status--free" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { className: "sb-vcard__status-dot", "aria-hidden": true }),
            v.free_from ? `${t.freeFrom} ${formatDate(v.free_from, locale)}` : t.busy
          ] }) : null,
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
      ] }) }, v.id);
    }) })),
    selected ? /* @__PURE__ */ jsx(
      VehicleBookingModal,
      {
        vehicle: selected,
        apiBase,
        locale,
        botUsername: telegramBot.trim() || "shiba_cars_test_bot",
        googleMapsApiKey,
        referralCode,
        telegramUser,
        onClose: () => setSelected(null)
      }
    ) : null
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
    // Puck does not render a label for custom fields, so draw it ourselves —
    // otherwise the two image fields (OG image / favicon) look identical and
    // unlabelled in the editor.
    render: ({ value, onChange }) => /* @__PURE__ */ jsxs("div", { className: "sbf-field", children: [
      /* @__PURE__ */ jsx("span", { className: "sbf-field__label", children: label }),
      /* @__PURE__ */ jsx(ImageInput, { value: value ?? "", onChange: (next) => onChange(next) })
    ] })
  };
}
var __catTabsCache = {};
async function fetchCategoryTabs(apiBase, vehicleType) {
  const key = `${apiBase}|${vehicleType}`;
  if (__catTabsCache[key]) return __catTabsCache[key];
  try {
    const res = await fetch(`${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    if (!res.ok) return [];
    const vehicles = await res.json();
    const names = Array.from(
      new Set(vehicles.map((v) => v.category?.name).filter((n) => Boolean(n)))
    );
    __catTabsCache[key] = names;
    return names;
  } catch {
    return [];
  }
}
var internalConfig = {
  root: {
    fields: {
      title: { type: "text", label: "SEO title" },
      description: { type: "textarea", label: "SEO description" },
      ogImage: imageField("OG-\u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 (\u0434\u043B\u044F \u0441\u043E\u0446\u0441\u0435\u0442\u0435\u0439)"),
      favicon: imageField("Favicon (\u0438\u043A\u043E\u043D\u043A\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u2014 .png / .ico / .svg)")
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
        anchorId: { type: "text", label: "\u042F\u043A\u043E\u0440\u044C \u0434\u043B\u044F \u043C\u0435\u043D\u044E (\u043D\u0430\u043F\u0440. conditions)" },
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
        anchorId: "conditions",
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
        logoText: { type: "text", label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 \u0442\u0435\u043A\u0441\u0442" },
        logoImage: imageField("\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u2014 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"),
        note: { type: "text", label: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435 \u043F\u043E\u0434 \u043B\u043E\u0433\u043E (\u043D\u0430\u043F\u0440. SHIBA TRAVEL CO. LTD)" },
        columns: {
          type: "array",
          label: "\u041A\u043E\u043B\u043E\u043D\u043A\u0438",
          arrayFields: {
            title: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u043E\u043B\u043E\u043D\u043A\u0438" },
            titleHref: { type: "text", label: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430 (\u043E\u043F\u0446., \u043D\u0430\u043F\u0440. #car)" },
            links: {
              type: "array",
              label: "\u0421\u0441\u044B\u043B\u043A\u0438",
              arrayFields: {
                label: { type: "text", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" },
                href: { type: "text", label: "\u0421\u0441\u044B\u043B\u043A\u0430" }
              },
              defaultItemProps: { label: "", href: "" },
              getItemSummary: (item) => item.label || "\u0421\u0441\u044B\u043B\u043A\u0430"
            }
          },
          defaultItemProps: { title: "", titleHref: "", links: [] },
          getItemSummary: (item) => item.title || "\u041A\u043E\u043B\u043E\u043D\u043A\u0430"
        },
        contactsTitle: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432" },
        phone: { type: "text", label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" },
        email: { type: "text", label: "Email" },
        address: { type: "textarea", label: "\u0410\u0434\u0440\u0435\u0441" },
        whatsapp: { type: "text", label: "WhatsApp \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        telegram: { type: "text", label: "Telegram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        instagram: { type: "text", label: "Instagram \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" }
      },
      defaultProps: {
        logoText: "SHIBA CARS",
        logoImage: "",
        note: "SHIBA TRAVEL CO. LTD",
        columns: [
          {
            title: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438",
            titleHref: "#car",
            links: [
              { label: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", href: "#car" },
              { label: "\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043A\u0430\u0440\u044B", href: "#car" },
              { label: "\u0412\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A\u0438", href: "#car" },
              { label: "\u041A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440\u044B", href: "#car" },
              { label: "\u041A\u043E\u043C\u0444\u043E\u0440\u0442", href: "#car" }
            ]
          },
          {
            title: "\u0411\u0430\u0439\u043A\u0438",
            titleHref: "#bike",
            links: [
              { label: "\u041C\u043E\u0442\u043E\u0446\u0438\u043A\u043B\u044B", href: "#bike" },
              { label: "\u0411\u0438\u0433 \u0431\u0430\u0439\u043A\u0438", href: "#bike" },
              { label: "\u041C\u0438\u043D\u0438 \u0431\u0430\u0439\u043A\u0438", href: "#bike" }
            ]
          },
          { title: "\u041E\u0442\u0437\u044B\u0432\u044B", titleHref: "#reviews", links: [] },
          { title: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F", titleHref: "#conditions", links: [] }
        ],
        contactsTitle: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
        phone: "+66959657805",
        email: "shibacars@gmail.com",
        address: "24/31 Wichit, Mueang District, Phuket 83000, Thailand",
        whatsapp: "https://wa.me/66959657805",
        telegram: "https://t.me/ShibaCars_Phuket",
        instagram: "https://www.instagram.com/shibacars_phuket"
      },
      render: Footer
    },
    LeadForm: {
      label: "\u0424\u043E\u0440\u043C\u0430 \u0437\u0430\u044F\u0432\u043A\u0438",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442 (\u043E\u043F\u0446.)" },
        contactLabel: { type: "text", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C \u043D\u0430\u0434 \u0432\u044B\u0431\u043E\u0440\u043E\u043C \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440\u0430" },
        buttonLabel: { type: "text", label: "\u0422\u0435\u043A\u0441\u0442 \u043A\u043D\u043E\u043F\u043A\u0438" },
        image: imageField("\u0424\u043E\u0442\u043E (\u0441\u043F\u0440\u0430\u0432\u0430 \u043E\u0442 \u0444\u043E\u0440\u043C\u044B)"),
        successMessage: { type: "text", label: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438" },
        endpoint: { type: "text", label: "Endpoint (URL \u043F\u0440\u0438\u0451\u043C\u0430 \u0437\u0430\u044F\u0432\u043E\u043A)" }
      },
      defaultProps: {
        heading: "\u041F\u043E\u0434\u0430\u0447\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0438 2-\u0445 \u0447\u0430\u0441\u043E\u0432",
        text: "",
        contactLabel: "\u041A\u0430\u043A \u0441 \u0432\u0430\u043C\u0438 \u0441\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F?",
        buttonLabel: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        image: "",
        successMessage: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
        endpoint: ""
      },
      render: LeadForm
    },
    VehicleCatalog: {
      label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0422\u0421",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A" },
        anchorId: { type: "text", label: "\u042F\u043A\u043E\u0440\u044C \u0434\u043B\u044F \u043C\u0435\u043D\u044E (\u043D\u0430\u043F\u0440. car / bike)" },
        vehicleType: {
          type: "radio",
          label: "\u0422\u0438\u043F",
          options: [
            { label: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438", value: "car" },
            { label: "\u0411\u0430\u0439\u043A\u0438", value: "motorcycle" }
          ]
        },
        telegramBot: { type: "text", label: "Telegram-\u0431\u043E\u0442 (\u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u0430 \u0432 \u043F\u043E\u043F\u0430\u043F\u0435)" },
        // Fallback when the category list can't be fetched in the editor;
        // resolveFields() upgrades it to a select of real tabs below.
        defaultCategory: {
          type: "text",
          label: "\u0412\u043A\u043B\u0430\u0434\u043A\u0430 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E (\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438)"
        }
      },
      // Make «Вкладка по умолчанию» a SELECT of the categories that exist for the
      // chosen vehicle type (re-resolves when the type switches car↔bike).
      resolveFields: async (data, { fields }) => {
        const props = data.props ?? {};
        const names = await fetchCategoryTabs(props.apiBase ?? "", props.vehicleType ?? "car");
        if (names.length === 0) return fields;
        return {
          ...fields,
          defaultCategory: {
            type: "select",
            label: "\u0412\u043A\u043B\u0430\u0434\u043A\u0430 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
            options: [
              { label: "\u2014 \u0412\u0441\u0435 (\u0431\u0435\u0437 \u043F\u0440\u0435\u0441\u0435\u043B\u0435\u043A\u0442\u0430) \u2014", value: "" },
              ...names.map((n) => ({ label: n, value: n }))
            ]
          }
        };
      },
      defaultProps: {
        heading: "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438",
        anchorId: "",
        vehicleType: "car",
        telegramBot: "shiba_cars_test_bot",
        defaultCategory: ""
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

export { AboutPromo, FeatureCards, Footer, Hero, LeadForm, MapContacts, ReviewsCarousel, RichText, SiteHeader, StatCounters, TermsAccordion, VehicleCatalog, categoryLabel, puckConfig };
