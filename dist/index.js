import { createContext, useRef, useState, useEffect, useId, useMemo, useContext, useCallback, Fragment as Fragment$1, useLayoutEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import { siWhatsapp } from 'simple-icons';
import { DayPicker, labelDayButton } from 'react-day-picker';
import { ru, enGB } from 'react-day-picker/locale';

// src/blocks/Hero.tsx

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
var HERO_VIDEO_MEDIA = "(max-width: 767px) and (orientation: portrait)";
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
  mobileVideoHevc,
  mobileVideo,
  mobileVideoPoster,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref
}) {
  const bg = safeImageUrl(backgroundImage);
  const hevc = safeImageUrl(mobileVideoHevc);
  const h264 = safeImageUrl(mobileVideo);
  const poster = safeImageUrl(mobileVideoPoster);
  const hasVideo = Boolean(hevc || h264);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(HERO_VIDEO_MEDIA);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const allowed = () => {
      if (!mq.matches) return false;
      if (rm.matches) return false;
      const conn = navigator.connection;
      return !conn?.saveData;
    };
    const addSources = () => {
      if (video.querySelector("source")) return;
      const add = (src, type) => {
        if (!src) return;
        const el = document.createElement("source");
        el.src = src;
        el.type = type;
        video.appendChild(el);
      };
      add(hevc, 'video/mp4; codecs="hvc1"');
      add(h264, "video/mp4");
      video.load();
    };
    const start = () => {
      if (!allowed()) return;
      addSources();
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {
      });
    };
    const onChange = () => {
      if (mq.matches) start();
      else video.pause();
    };
    const onReducedChange = () => {
      if (rm.matches) video.pause();
      else onChange();
    };
    const onPlaying = () => setPlaying(true);
    const onError = () => setPlaying(false);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError, true);
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onChange);
    else mq.addListener?.(onChange);
    if (typeof rm.addEventListener === "function") rm.addEventListener("change", onReducedChange);
    else rm.addListener?.(onReducedChange);
    start();
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError, true);
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", onChange);
      else mq.removeListener?.(onChange);
      if (typeof rm.removeEventListener === "function") rm.removeEventListener("change", onReducedChange);
      else rm.removeListener?.(onReducedChange);
      video.pause();
      video.querySelectorAll("source").forEach((el) => el.remove());
      video.removeAttribute("src");
      video.load();
      setPlaying(false);
    };
  }, [hevc, h264]);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  const href2 = safeHref(secondaryHref);
  const hasSecondary = Boolean(secondaryLabel && href2);
  const hasPoster = hasVideo && Boolean(poster);
  const style = {};
  if (bg) style.backgroundImage = `url("${encodeURI(bg)}")`;
  if (hasPoster && poster) style["--sb-hero-poster"] = `url("${encodeURI(poster)}")`;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: ["sb-hero", hasVideo ? "sb-hero--has-video" : "", hasPoster ? "sb-hero--has-poster" : ""].filter(Boolean).join(" "),
      style: bg || hasPoster ? style : void 0,
      children: [
        hasVideo ? (
          // No src/<source> in server markup: the client adds them only on a phone,
          // so desktop never downloads the file.
          /* @__PURE__ */ jsx(
            "video",
            {
              ref: videoRef,
              className: playing ? "sb-hero__video sb-hero__video--playing" : "sb-hero__video",
              muted: true,
              playsInline: true,
              loop: true,
              autoPlay: true,
              preload: "none",
              poster: poster ? encodeURI(poster) : void 0,
              "aria-hidden": "true",
              tabIndex: -1
            }
          )
        ) : null,
        bg || hasVideo ? /* @__PURE__ */ jsx("div", { className: "sb-hero__overlay", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-hero__inner", children: [
          /* @__PURE__ */ jsx("h1", { className: "sb-h1", children: renderHeading(heading, accentWord) }),
          subheading ? /* @__PURE__ */ jsx("p", { className: "sb-lead", children: subheading }) : null,
          hasCta || hasSecondary ? /* @__PURE__ */ jsxs("div", { className: "sb-hero__cta", children: [
            hasCta ? /* @__PURE__ */ jsx("a", { className: "sb-btn", href, children: ctaLabel }) : null,
            hasSecondary ? /* @__PURE__ */ jsx("a", { className: "sb-btn sb-hero__secondary", href: href2, children: secondaryLabel }) : null
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
var LABELS = {
  ru: { video: "\u0412\u0438\u0434\u0435\u043E", watch: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0438\u0434\u0435\u043E" },
  en: { video: "Video", watch: "Watch video" }
};
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
function VideoEmbed({ url, title, locale = "ru" }) {
  const t = LABELS[locale];
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  if (id) {
    return /* @__PURE__ */ jsx("div", { className: "sb-video", children: playing ? /* @__PURE__ */ jsx(
      "iframe",
      {
        className: "sb-video__iframe",
        src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
        title: title ?? t.video,
        allow: "autoplay; encrypted-media; picture-in-picture",
        allowFullScreen: true
      }
    ) : /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "sb-video__poster",
        onClick: () => setPlaying(true),
        "aria-label": t.watch,
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
    t.watch
  ] });
}
function AboutPromo({
  heading,
  text,
  image,
  videoUrl,
  imagePosition = "right",
  puck
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
      hasVideo ? /* @__PURE__ */ jsx(VideoEmbed, { url: videoUrl, title: heading, locale: puck?.metadata?.locale === "en" ? "en" : "ru" }) : null,
      img ? /* @__PURE__ */ jsx("img", { className: "sb-about__img", src: img, alt: heading, loading: "lazy" }) : null
    ] }),
    body
  ] }) });
}
function FeatureCards({
  heading,
  items,
  videoUrl,
  videoIndex,
  puck
}) {
  const list = items ?? [];
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const vIdx = typeof videoIndex === "number" && videoIndex >= 0 ? videoIndex : list.length;
  const cells = [];
  const pushVideo = () => cells.push(
    /* @__PURE__ */ jsx("div", { className: "sb-feature sb-feature--video", children: /* @__PURE__ */ jsx(VideoEmbed, { url: videoUrl, title: heading, locale: puck?.metadata?.locale === "en" ? "en" : "ru" }) }, "video")
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
var LABELS2 = {
  ru: { prev: "\u041D\u0430\u0437\u0430\u0434", next: "\u0412\u043F\u0435\u0440\u0451\u0434" },
  en: { prev: "Previous", next: "Next" }
};
function Carousel({
  title,
  children,
  locale = "ru"
}) {
  const t = LABELS2[locale];
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
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollByDir(-1), "aria-label": t.prev, children: "\u2039" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => scrollByDir(1), "aria-label": t.next, children: "\u203A" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sb-carousel__track", ref, children })
  ] });
}
var STRINGS = {
  ru: { more: "\u0427\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E", close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", review: "\u041E\u0442\u0437\u044B\u0432", videoReview: "\u0412\u0438\u0434\u0435\u043E-\u043E\u0442\u0437\u044B\u0432", outOf5: (n) => `${n} \u0438\u0437 5` },
  en: { more: "Read full review", close: "Close", review: "Review", videoReview: "Video review", outOf5: (n) => `${n} out of 5` }
};
function Stars({ rating, locale }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return /* @__PURE__ */ jsxs("span", { className: "sb-rcard__stars", "aria-label": STRINGS[locale].outOf5(full), children: [
    "\u2605\u2605\u2605\u2605\u2605".slice(0, full),
    /* @__PURE__ */ jsx("span", { className: "sb-rcard__stars-empty", children: "\u2605\u2605\u2605\u2605\u2605".slice(0, 5 - full) })
  ] });
}
function TextCard({ review, locale }) {
  const t = STRINGS[locale];
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
        review.rating ? /* @__PURE__ */ jsx(Stars, { rating: review.rating, locale }) : null
      ] })
    ] }),
    review.text ? /* @__PURE__ */ jsx("p", { className: "sb-rcard__text", children: review.text }) : null,
    screenshot ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "sb-rcard__more", onClick: () => setOpen(true), children: t.more }),
      open && typeof document !== "undefined" ? createPortal(
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "sb-lightbox",
            role: "dialog",
            "aria-modal": "true",
            onClick: () => setOpen(false),
            children: [
              /* @__PURE__ */ jsx("button", { type: "button", className: "sb-lightbox__close", "aria-label": t.close, children: "\xD7" }),
              /* @__PURE__ */ jsx(
                "img",
                {
                  className: "sb-lightbox__img",
                  src: screenshot,
                  alt: name ? `${t.review} \u2014 ${name}` : t.review,
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
function MediaCard({ item, locale }) {
  const photo = safeImageUrl(item.photo ?? "");
  return /* @__PURE__ */ jsxs("figure", { className: "sb-rmedia", children: [
    item.videoUrl ? /* @__PURE__ */ jsx(VideoEmbed, { url: item.videoUrl, title: item.caption || STRINGS[locale].videoReview, locale }) : photo ? /* @__PURE__ */ jsx("img", { className: "sb-rmedia__photo", src: photo, alt: item.caption ?? "", loading: "lazy" }) : null,
    item.caption ? /* @__PURE__ */ jsx("figcaption", { className: "sb-rmedia__caption", children: item.caption }) : null
  ] });
}
function ReviewsCarousel({
  heading,
  anchorId,
  textReviews,
  mediaReviews,
  locale: localeProp,
  puck
}) {
  const locale = localeProp ?? (puck?.metadata?.locale === "en" ? "en" : "ru");
  const texts = (textReviews ?? []).filter((r) => r.name || r.text);
  const media = (mediaReviews ?? []).filter((m) => m.videoUrl || m.photo);
  return /* @__PURE__ */ jsxs(Section, { id: anchorId || "reviews", children: [
    texts.length > 0 ? /* @__PURE__ */ jsx(Carousel, { locale, title: heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2 sb-h2--inline", children: heading }) : null, children: texts.map((r, i) => /* @__PURE__ */ jsx("div", { className: "sb-carousel__cell sb-carousel__cell--text", children: /* @__PURE__ */ jsx(TextCard, { review: r, locale }) }, i)) }) : heading ? /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: heading }) : null,
    media.length > 0 ? /* @__PURE__ */ jsx(Carousel, { locale, children: media.map((m, i) => /* @__PURE__ */ jsx("div", { className: "sb-carousel__cell sb-carousel__cell--media", children: /* @__PURE__ */ jsx(MediaCard, { item: m, locale }) }, i)) }) : null
  ] });
}
var base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
var whatsappPath = siWhatsapp.path;
var telegramPlanePath = "M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z";
function iconClassName(className) {
  return ["sb-ico", className].filter(Boolean).join(" ");
}
function InstagramMark({ className }) {
  const gradientId = useId();
  return /* @__PURE__ */ jsxs("svg", { className: `${className} sb-ico--instagram`, viewBox: "0 0 32 32", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: gradientId, cx: "30%", cy: "107%", r: "150%", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#fdf497" }),
      /* @__PURE__ */ jsx("stop", { offset: "18%", stopColor: "#fd5949" }),
      /* @__PURE__ */ jsx("stop", { offset: "48%", stopColor: "#d6249f" }),
      /* @__PURE__ */ jsx("stop", { offset: "78%", stopColor: "#285aeb" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#833ab4" })
    ] }) }),
    /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "16", fill: `url(#${gradientId})` }),
    /* @__PURE__ */ jsx("rect", { x: "7", y: "7", width: "18", height: "18", rx: "5.5", fill: "none", stroke: "#fff", strokeWidth: "2.25" }),
    /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "4.1", fill: "none", stroke: "#fff", strokeWidth: "2.25" }),
    /* @__PURE__ */ jsx("circle", { cx: "21.7", cy: "10.4", r: "1.45", fill: "#fff" })
  ] });
}
function ContactIcon({ kind, className }) {
  const iconClass = iconClassName(className);
  if (kind === "instagram") {
    return /* @__PURE__ */ jsx(InstagramMark, { className: iconClass });
  }
  if (kind === "telegram") {
    return /* @__PURE__ */ jsx("svg", { className: iconClass, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: telegramPlanePath, transform: "translate(-9 -9) scale(1.75)" }) });
  }
  if (kind === "whatsapp") {
    return /* @__PURE__ */ jsx("svg", { className: iconClass, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: whatsappPath }) });
  }
  return /* @__PURE__ */ jsx("svg", { ...base, className: iconClass, "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" }) });
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
var KNOWN = ["ru", "en"];
var ORDER = ["ru", "en"];
function localeHref(target) {
  if (typeof window === "undefined") return `/${target}`;
  const { pathname, search, hash } = window.location;
  const segs = pathname.split("/");
  if (segs[1] && KNOWN.includes(segs[1])) {
    segs[1] = target;
    return segs.join("/") + search + hash;
  }
  return `/${target}`;
}
function FlagRU() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 9 6", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("rect", { width: "9", height: "6", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { width: "9", height: "4", y: "2", fill: "#0039A6" }),
    /* @__PURE__ */ jsx("rect", { width: "9", height: "2", y: "4", fill: "#D52B1E" })
  ] });
}
function FlagEN() {
  const uid = useId().replace(/:/g, "");
  const clipAll = `uk-s-${uid}`;
  const clipDiag = `uk-t-${uid}`;
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 60 30", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("clipPath", { id: clipAll, children: /* @__PURE__ */ jsx("path", { d: "M0,0 v30 h60 v-30 z" }) }),
    /* @__PURE__ */ jsx("clipPath", { id: clipDiag, children: /* @__PURE__ */ jsx("path", { d: "M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" }) }),
    /* @__PURE__ */ jsxs("g", { clipPath: `url(#${clipAll})`, children: [
      /* @__PURE__ */ jsx("path", { d: "M0,0 v30 h60 v-30 z", fill: "#012169" }),
      /* @__PURE__ */ jsx("path", { d: "M0,0 L60,30 M60,0 L0,30", stroke: "#fff", strokeWidth: "6" }),
      /* @__PURE__ */ jsx("path", { d: "M0,0 L60,30 M60,0 L0,30", clipPath: `url(#${clipDiag})`, stroke: "#C8102E", strokeWidth: "4" }),
      /* @__PURE__ */ jsx("path", { d: "M30,0 v30 M0,15 h60", stroke: "#fff", strokeWidth: "10" }),
      /* @__PURE__ */ jsx("path", { d: "M30,0 v30 M0,15 h60", stroke: "#C8102E", strokeWidth: "6" })
    ] })
  ] });
}
var FLAGS = {
  ru: { node: /* @__PURE__ */ jsx(FlagRU, {}), label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  en: { node: /* @__PURE__ */ jsx(FlagEN, {}), label: "English" }
};
function LanguageSwitcher({ current, className = "", onSelect }) {
  const [hrefs, setHrefs] = useState({ ru: "/ru", en: "/en" });
  useEffect(() => {
    const sync = () => setHrefs({ ru: localeHref("ru"), en: localeHref("en") });
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return /* @__PURE__ */ jsx("div", { className: `sb-lang ${className}`.trim(), role: "group", "aria-label": "Language / \u042F\u0437\u044B\u043A", children: ORDER.map((loc) => {
    const active = loc === current;
    if (onSelect) {
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-lang__flag${active ? " is-active" : ""}`,
          lang: loc,
          "aria-label": FLAGS[loc].label,
          "aria-pressed": active,
          title: FLAGS[loc].label,
          onClick: () => {
            if (!active) onSelect(loc);
          },
          children: FLAGS[loc].node
        },
        loc
      );
    }
    return /* @__PURE__ */ jsx(
      "a",
      {
        className: `sb-lang__flag${active ? " is-active" : ""}`,
        href: hrefs[loc],
        hrefLang: loc,
        "aria-label": FLAGS[loc].label,
        "aria-current": active ? "true" : void 0,
        title: FLAGS[loc].label,
        children: FLAGS[loc].node
      },
      loc
    );
  }) });
}
function withLinkBase(href, linkBase) {
  const base2 = (linkBase ?? "").trim();
  return base2 && href.startsWith("#") ? `${base2}${href}` : href;
}
var STRINGS2 = {
  ru: { menu: "\u041C\u0435\u043D\u044E", close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", call: "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C" },
  en: { menu: "Menu", close: "Close", call: "Call" }
};
function BurgerIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
  ] });
}
function CloseIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
    /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" })
  ] });
}
function SiteHeader({
  logoText,
  logoImage,
  links,
  phone,
  whatsapp,
  telegram,
  instagram,
  locale: localeProp,
  linkBase,
  puck
}) {
  const locale = localeProp ?? (puck?.metadata?.locale === "en" ? "en" : "ru");
  const t = STRINGS2[locale];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll("a[href], button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);
  const logoImg = safeImageUrl(logoImage);
  const logoNode = logoImg ? /* @__PURE__ */ jsx("img", { src: logoImg, alt: logoText || "logo" }) : /* @__PURE__ */ jsx(BrandLogo, { text: logoText || "SHIBA CARS" });
  const ig = safeHref(instagram);
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);
  const phoneHref = phone ? safeHref(phone.startsWith("tel:") ? phone : `tel:${phone.replace(/\s+/g, "")}`) : void 0;
  const iconLink = (kind, href, extraClass = "") => /* @__PURE__ */ jsx(
    "a",
    {
      className: `sb-icon-link sb-icon-link--${kind} ${extraClass}`.trim(),
      href,
      "aria-label": kind,
      target: kind === "phone" ? void 0 : "_blank",
      rel: kind === "phone" ? void 0 : "noopener noreferrer",
      children: /* @__PURE__ */ jsx(ContactIcon, { kind })
    }
  );
  const navLinks = (links ?? []).map((link) => {
    const href = safeHref(link.href);
    return { label: link.label, href: href ? withLinkBase(href, linkBase) : href };
  }).filter((l) => Boolean(l.href));
  return /* @__PURE__ */ jsxs("header", { className: `sb-header${scrolled ? " is-scrolled" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-header__inner", children: [
      /* @__PURE__ */ jsx("a", { className: "sb-header__brand", href: linkBase?.trim() || "/", children: logoNode }),
      /* @__PURE__ */ jsx("nav", { className: "sb-header__nav", children: navLinks.map((link, index) => /* @__PURE__ */ jsx("a", { href: link.href, children: link.label }, index)) }),
      /* @__PURE__ */ jsxs("div", { className: "sb-header__right", children: [
        /* @__PURE__ */ jsx(LanguageSwitcher, { current: locale, className: "sb-lang--header sb-only-desktop" }),
        /* @__PURE__ */ jsxs("div", { className: "sb-header__contacts", children: [
          ig ? iconLink("instagram", ig, "sb-only-desktop") : null,
          wa ? iconLink("whatsapp", wa) : null,
          tg ? iconLink("telegram", tg) : null,
          phoneHref ? /* @__PURE__ */ jsx("a", { className: "sb-header__phone sb-only-desktop", href: phoneHref, children: phone }) : null,
          phoneHref ? iconLink("phone", phoneHref, "sb-only-mobile") : null
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "sb-header__burger sb-only-mobile",
            "aria-label": t.menu,
            "aria-expanded": open,
            onClick: () => setOpen(true),
            children: /* @__PURE__ */ jsx(BurgerIcon, {})
          }
        )
      ] })
    ] }),
    open ? createPortal(
      /* @__PURE__ */ jsx("div", { className: "sb-root", children: /* @__PURE__ */ jsxs(
        "div",
        {
          ref: drawerRef,
          className: "sb-drawer",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t.menu,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "sb-drawer__head", children: [
              /* @__PURE__ */ jsx("span", { className: "sb-drawer__brand", children: logoNode }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  ref: closeRef,
                  className: "sb-drawer__close",
                  "aria-label": t.close,
                  onClick: () => setOpen(false),
                  children: /* @__PURE__ */ jsx(CloseIcon, {})
                }
              )
            ] }),
            /* @__PURE__ */ jsx("nav", { className: "sb-drawer__nav", children: navLinks.map((link, index) => /* @__PURE__ */ jsx("a", { href: link.href, onClick: () => setOpen(false), children: link.label }, index)) }),
            /* @__PURE__ */ jsx(LanguageSwitcher, { current: locale, className: "sb-lang--drawer" }),
            /* @__PURE__ */ jsxs("div", { className: "sb-drawer__contacts", children: [
              phoneHref ? /* @__PURE__ */ jsx("a", { className: "sb-drawer__phone", href: phoneHref, children: phone }) : null,
              /* @__PURE__ */ jsxs("div", { className: "sb-drawer__socials", children: [
                ig ? iconLink("instagram", ig) : null,
                wa ? iconLink("whatsapp", wa) : null,
                tg ? iconLink("telegram", tg) : null
              ] })
            ] })
          ]
        }
      ) }),
      document.body
    ) : null
  ] });
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
  instagram,
  linkBase
}) {
  const anchor = (href) => href ? withLinkBase(href, linkBase) : href;
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
      const titleHref = anchor(safeHref(col.titleHref));
      const links = (col.links ?? []).map((l) => ({ label: l.label, href: anchor(safeHref(l.href)) })).filter((l) => Boolean(l.href));
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
  const [method, setMethod] = useState("telegram");
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
              /* @__PURE__ */ jsx("option", { value: "telegram", children: "Telegram" }),
              /* @__PURE__ */ jsx("option", { value: "whatsapp", children: "WhatsApp" }),
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
var COMPANY_TIME_ZONE = "Asia/Bangkok";
function todayISO(now = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COMPANY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
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
function openNativeDatePicker(el) {
  try {
    el.showPicker?.();
  } catch {
  }
}
function formatDDMMYYYY(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
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
function formatShortDateWithYear(isoDate, lang) {
  const short = formatShortDate(isoDate, lang);
  if (!short) return "";
  const year = isoDate.slice(0, 4);
  return year === todayISO().slice(0, 4) ? short : `${short} ${year}`;
}
function pluralDays(n, lang) {
  if (lang === "en") return `${n} ${n === 1 ? "day" : "days"}`;
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  const word = a === 1 && b !== 11 ? "\u0434\u0435\u043D\u044C" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "\u0434\u043D\u044F" : "\u0434\u043D\u0435\u0439";
  return `${n} ${word}`;
}
function utcDate(isoDate) {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}
var dayMonthFormatters = {};
function dayMonthParts(date, lang) {
  const fmt2 = dayMonthFormatters[lang] ?? (dayMonthFormatters[lang] = new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  }));
  const parts = fmt2.formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: part("day"), month: part("month") };
}
function formatDayMonth(isoDate, lang) {
  const date = utcDate(isoDate);
  if (!date) return "";
  const { day, month } = dayMonthParts(date, lang);
  return `${day} ${month}`;
}
function formatDayMonthRange(fromISO, toISO, lang) {
  const from = utcDate(fromISO);
  const to = utcDate(toISO);
  if (!from || !to) return "";
  if (fromISO === toISO) return formatDayMonth(fromISO, lang);
  const sameMonth = from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth();
  if (sameMonth) {
    const a = dayMonthParts(from, lang);
    const b = dayMonthParts(to, lang);
    return `${a.day}\u2013${b.day} ${b.month}`;
  }
  return `${formatDayMonth(fromISO, lang)} \u2013 ${formatDayMonth(toISO, lang)}`;
}
function daysBetween(fromISO, toISO) {
  const from = utcDate(fromISO);
  const to = utcDate(toISO);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / 864e5);
}

// src/blocks/catalog/availability.ts
function unitBusyOn(unit, day) {
  return unit.busy.some((b) => b.start <= day && day < b.end);
}
function isDayBusy(units, day) {
  return units.length > 0 && units.every((u) => unitBusyOn(u, day));
}
function unitCovering(units, start, end) {
  const unit = units.find((u) => !u.busy.some((b) => b.start < end && b.end > start));
  return unit ? unit.vehicle_id : null;
}
function maxReturnDay(units, start) {
  let latest = null;
  for (const unit of units) {
    if (unitBusyOn(unit, start)) continue;
    let next = null;
    for (const b of unit.busy) {
      if (b.start > start && (next === null || b.start < next)) next = b.start;
    }
    if (next === null) return null;
    if (latest === null || next > latest) latest = next;
  }
  return latest;
}
function busyDaysIn(units, start, end) {
  const ranges = [];
  if (!start || !end) return ranges;
  let from = null;
  let prev = "";
  for (let day = start; day && day < end; day = addDays(day, 1)) {
    if (isDayBusy(units, day)) {
      if (from === null) from = day;
    } else if (from !== null) {
      ranges.push([from, prev]);
      from = null;
    }
    prev = day;
  }
  if (from !== null) ranges.push([from, prev]);
  return ranges;
}
function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
function toISODate(value) {
  return String(value.getFullYear()) + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
}
var WIDE_QUERY = "(min-width: 641px)";
function readMonths() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 1;
  return window.matchMedia(WIDE_QUERY).matches ? 2 : 1;
}
function useCalendarMonths() {
  const [months, setMonths] = useState(readMonths);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(WIDE_QUERY);
    const apply = () => setMonths(query.matches ? 2 : 1);
    apply();
    query.addEventListener?.("change", apply);
    return () => query.removeEventListener?.("change", apply);
  }, []);
  return months;
}
function AvailabilityCalendar({ units, today, start, end, onChange, locale, months }) {
  const autoMonths = useCalendarMonths();
  const monthCount = months ?? autoMonths;
  const todayDate = parseISODate(today);
  const picking = Boolean(start && !end);
  const complete = Boolean(start && end);
  const returnLimit = picking ? maxReturnDay(units, start) : null;
  const conflict = units.length > 0 && (complete ? unitCovering(units, start, end) === null : picking && isDayBusy(units, start));
  const busyLabel = (date) => formatShortDate(toISODate(date), locale) + " \u2014 " + (locale === "ru" ? "\u0437\u0430\u043D\u044F\u0442\u043E" : "booked");
  const handleDayClick = (date) => {
    const day = toISODate(date);
    if (day < today) return;
    if (!start || end || day <= start) onChange(day, "");
    else onChange(start, day);
  };
  return /* @__PURE__ */ jsx("div", { className: `sb-avcal${monthCount === 2 ? " sb-avcal--two" : ""}${conflict ? " is-conflict" : ""}`, children: /* @__PURE__ */ jsx(
    DayPicker,
    {
      locale: locale === "ru" ? ru : enGB,
      numberOfMonths: monthCount,
      defaultMonth: start ? parseISODate(start) : todayDate,
      startMonth: todayDate,
      today: todayDate,
      disabled: { before: todayDate },
      fixedWeeks: true,
      navLayout: "around",
      onDayClick: handleDayClick,
      components: {
        DayButton: ({ day, modifiers, ...buttonProps }) => /* @__PURE__ */ jsx("button", { ...buttonProps, title: modifiers.busy ? busyLabel(day.date) : void 0 })
      },
      labels: {
        labelDayButton: (date, modifiers, options, dateLib) => {
          return modifiers.busy ? busyLabel(date) : labelDayButton(date, modifiers, options, dateLib);
        }
      },
      modifiers: {
        // День возврата машину не занимает — у конца срока зачёркивание снято.
        busy: (date) => {
          const day = toISODate(date);
          return day >= today && !(complete && day === end) && isDayBusy(units, day);
        },
        rangeStart: (date) => Boolean(start) && toISODate(date) === start,
        rangeEnd: (date) => Boolean(end) && toISODate(date) === end,
        rangeMiddle: (date) => {
          if (!complete) return false;
          const day = toISODate(date);
          return day > start && day < end;
        },
        unreachable: (date) => returnLimit !== null && toISODate(date) > returnLimit
      },
      modifiersClassNames: {
        busy: "is-busy",
        rangeStart: "is-start",
        rangeEnd: "is-end",
        rangeMiddle: "is-middle",
        unreachable: "is-unreachable"
      },
      classNames: {
        root: "sb-avcal__calendar",
        months: "sb-avcal__months",
        month: "sb-avcal__month",
        month_caption: "sb-avcal__caption",
        caption_label: "sb-avcal__caption-label",
        button_previous: "sb-avcal__nav sb-avcal__nav--prev",
        button_next: "sb-avcal__nav sb-avcal__nav--next",
        chevron: "sb-avcal__chevron",
        weekdays: "sb-avcal__weekdays",
        weekday: "sb-avcal__weekday",
        month_grid: "sb-avcal__grid",
        week: "sb-avcal__week",
        day: "sb-avcal__day",
        day_button: "sb-avcal__day-button",
        disabled: "is-disabled",
        today: "is-today",
        outside: "is-outside"
      }
    }
  ) });
}

// src/blocks/catalog/price.ts
var NBSP = "\xA0";
function groupNbsp(formatted) {
  return formatted.replace(/,/g, NBSP);
}
function formatDayPrice(value) {
  const rounded = Math.round(value * 100) / 100;
  const digits = Number.isInteger(rounded) ? 0 : 2;
  return groupNbsp(
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })
  );
}
function formatMoney(value) {
  if (value == null || value === "") return "";
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? groupNbsp(n.toLocaleString("en-US", { maximumFractionDigits: 2 })) : "";
}
function formatBahtCeil(value) {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return "";
  return Math.ceil(n - 1e-9).toLocaleString("en-US").replace(/,/g, "\xA0");
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
  const reqSeqRef = useRef(0);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
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
      newSessionToken();
    } catch {
      if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
    }
  };
  const pickFromMap = (lat, lng) => {
    syncMarker(lat, lng, true);
    newSessionToken();
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
      const picked = {
        address: place.formattedAddress || place.displayName || "",
        lat,
        lng,
        place_id: place.id,
        name: place.displayName
      };
      onSelectRef.current(picked);
      setQuery(displayValue(picked));
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
      reqSeqRef.current++;
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const seq = ++reqSeqRef.current;
      try {
        const { suggestions: raw } = await api.fetchAutocompleteSuggestions({
          input: q,
          ...sessionTokenRef.current ? { sessionToken: sessionTokenRef.current } : {}
        });
        if (seq !== reqSeqRef.current) return;
        const preds = (raw ?? []).map((s) => s.placePrediction).filter((p) => p != null);
        setSuggestions(preds);
        setOpen(preds.length > 0);
      } catch {
        if (seq === reqSeqRef.current) {
          setSuggestions([]);
          setOpen(false);
        }
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
          onBlur: () => {
            reqSeqRef.current++;
            setTimeout(() => setOpen(false), 150);
          },
          "aria-label": strings.searchPlaceholder,
          "data-testid": "delivery-address-input",
          "data-sb-addr-search": ""
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
var ATTENTION_MS = 1200;
function isQuote(c) {
  return c != null && c !== "loading";
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
      formatMoney(cost.price),
      " ",
      strings.currency
    ] })
  ] });
}
function ToggleRow({
  rowRef,
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
  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-row", ref: rowRef, children: [
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
  strings,
  askAddressRef
}) {
  const pickupRowRef = useRef(null);
  const dropoffRowRef = useRef(null);
  useEffect(() => {
    if (!askAddressRef) return;
    let timer = null;
    let flashed = null;
    let waiting = null;
    const focusAndFlash = (input) => {
      input.focus({ preventScroll: true });
      if (timer) clearTimeout(timer);
      flashed?.classList.remove("is-attention");
      void input.offsetWidth;
      input.classList.add("is-attention");
      flashed = input;
      timer = setTimeout(() => {
        input.classList.remove("is-attention");
        timer = null;
      }, ATTENTION_MS);
    };
    askAddressRef.current = (kind) => {
      const row = (kind === "pickup" ? pickupRowRef : dropoffRowRef).current;
      if (!row) return;
      if (typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "center", behavior: "smooth" });
      const input = row.querySelector("[data-sb-addr-search]");
      if (!input) return;
      waiting?.disconnect();
      waiting = null;
      if (!input.disabled || typeof MutationObserver === "undefined") {
        focusAndFlash(input);
        return;
      }
      const observer = new MutationObserver(() => {
        if (input.disabled) return;
        observer.disconnect();
        if (waiting === observer) waiting = null;
        focusAndFlash(input);
      });
      observer.observe(input, { attributes: true, attributeFilter: ["disabled"] });
      waiting = observer;
    };
    return () => {
      if (timer) clearTimeout(timer);
      waiting?.disconnect();
      askAddressRef.current = null;
    };
  }, [askAddressRef]);
  const canMirrorPickup = pickupEnabled && pickupLocation != null;
  const mirroring = canMirrorPickup && dropoffSameAsPickup;
  const showTotal = pickupEnabled && dropoffEnabled && isQuote(pickupCost) && pickupCost.matched && isQuote(dropoffCost) && dropoffCost.matched;
  return /* @__PURE__ */ jsxs("div", { className: "sb-vd__addr-section", children: [
    /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: strings.title }),
    /* @__PURE__ */ jsx(
      ToggleRow,
      {
        rowRef: pickupRowRef,
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
        rowRef: dropoffRowRef,
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
        formatMoney(pickupCost.price + dropoffCost.price),
        " ",
        strings.currency
      ] })
    ] }) : null
  ] });
}

// src/blocks/catalog/specs.ts
var LABELS3 = {
  ru: {
    engine: "\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C",
    battery: "\u0411\u0430\u0442\u0430\u0440\u0435\u044F",
    power: "\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C",
    fuel: "\u0422\u043E\u043F\u043B\u0438\u0432\u043E",
    transmission: "\u041A\u041F\u041F",
    drive: "\u041F\u0440\u0438\u0432\u043E\u0434",
    body: "\u041A\u0443\u0437\u043E\u0432",
    seats: "\u041C\u0435\u0441\u0442",
    range: "\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430",
    sprint: "\u0420\u0430\u0437\u0433\u043E\u043D 0\u2013100",
    max_speed: "\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C",
    clearance: "\u041A\u043B\u0438\u0440\u0435\u043D\u0441",
    weight: "\u041C\u0430\u0441\u0441\u0430",
    tank: "\u0411\u0430\u043A",
    fuel_consumption: "\u0420\u0430\u0441\u0445\u043E\u0434",
    power_consumption: "\u0420\u0430\u0441\u0445\u043E\u0434 \u044D\u043D\u0435\u0440\u0433\u0438\u0438"
  },
  en: {
    engine: "Engine",
    battery: "Battery",
    power: "Power",
    fuel: "Fuel",
    transmission: "Transmission",
    drive: "Drive",
    body: "Body",
    seats: "Seats",
    range: "Range",
    sprint: "0\u2013100",
    max_speed: "Top speed",
    clearance: "Clearance",
    weight: "Weight",
    tank: "Tank",
    fuel_consumption: "Consumption",
    power_consumption: "Energy use"
  }
};
var UNITS = {
  ru: {
    l: "\u043B",
    cc: "\u0441\u043C\xB3",
    kwh: "\u043A\u0412\u0442\xB7\u0447",
    hp: "\u043B.\u0441.",
    kmh: "\u043A\u043C/\u0447",
    s: "\u0441",
    mm: "\u043C\u043C",
    kg: "\u043A\u0433",
    km: "\u043A\u043C",
    l100: "\u043B/100 \u043A\u043C",
    kwh100: "\u043A\u0412\u0442\xB7\u0447/100 \u043A\u043C"
  },
  en: {
    l: "L",
    cc: "cc",
    kwh: "kWh",
    hp: "hp",
    kmh: "km/h",
    s: "s",
    mm: "mm",
    kg: "kg",
    km: "km",
    l100: "L/100 km",
    kwh100: "kWh/100 km"
  }
};
var ENUM_LABELS = {
  ru: {
    automatic: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442",
    manual: "\u041C\u0435\u0445\u0430\u043D\u0438\u043A\u0430",
    cvt: "\u0412\u0430\u0440\u0438\u0430\u0442\u043E\u0440",
    robot: "\u0420\u043E\u0431\u043E\u0442",
    petrol: "\u0411\u0435\u043D\u0437\u0438\u043D",
    diesel: "\u0414\u0438\u0437\u0435\u043B\u044C",
    electric: "\u042D\u043B\u0435\u043A\u0442\u0440\u043E",
    hybrid: "\u0413\u0438\u0431\u0440\u0438\u0434",
    plug_in_hybrid: "\u0413\u0438\u0431\u0440\u0438\u0434 \u0441 \u0437\u0430\u0440\u044F\u0434\u043A\u043E\u0439",
    fwd: "\u041F\u0435\u0440\u0435\u0434\u043D\u0438\u0439",
    rwd: "\u0417\u0430\u0434\u043D\u0438\u0439",
    awd: "\u041F\u043E\u043B\u043D\u044B\u0439",
    turbo: "\u0442\u0443\u0440\u0431\u043E",
    bi_turbo: "\u0431\u0438-\u0442\u0443\u0440\u0431\u043E",
    supercharger: "\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440",
    sedan: "\u0421\u0435\u0434\u0430\u043D",
    hatchback: "\u0425\u044D\u0442\u0447\u0431\u0435\u043A",
    liftback: "\u041B\u0438\u0444\u0442\u0431\u0435\u043A",
    wagon: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B",
    coupe: "\u041A\u0443\u043F\u0435",
    cabriolet: "\u041A\u0430\u0431\u0440\u0438\u043E\u043B\u0435\u0442",
    roadster: "\u0420\u043E\u0434\u0441\u0442\u0435\u0440",
    crossover: "\u041A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440",
    suv: "\u0412\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A",
    minivan: "\u041C\u0438\u043D\u0438\u0432\u044D\u043D",
    minibus: "\u041C\u0438\u043A\u0440\u043E\u0430\u0432\u0442\u043E\u0431\u0443\u0441",
    pickup: "\u041F\u0438\u043A\u0430\u043F",
    scooter: "\u0421\u043A\u0443\u0442\u0435\u0440",
    maxi_scooter: "\u041C\u0430\u043A\u0441\u0438\u0441\u043A\u0443\u0442\u0435\u0440",
    naked: "\u041D\u0435\u0439\u043A\u0435\u0434",
    sportbike: "\u0421\u043F\u043E\u0440\u0442\u0431\u0430\u0439\u043A",
    sport_tourer: "\u0421\u043F\u043E\u0440\u0442-\u0442\u0443\u0440\u0438\u0441\u0442",
    tourer: "\u0422\u0443\u0440\u0438\u0441\u0442",
    cruiser: "\u041A\u0440\u0443\u0438\u0437\u0435\u0440",
    chopper: "\u0427\u043E\u043F\u043F\u0435\u0440",
    classic: "\u041A\u043B\u0430\u0441\u0441\u0438\u043A",
    scrambler: "\u0421\u043A\u0440\u044D\u043C\u0431\u043B\u0435\u0440",
    enduro: "\u042D\u043D\u0434\u0443\u0440\u043E",
    adventure: "\u0422\u0443\u0440\u044D\u043D\u0434\u0443\u0440\u043E",
    supermoto: "\u041C\u043E\u0442\u0430\u0440\u0434"
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
    plug_in_hybrid: "Plug-in hybrid",
    fwd: "FWD",
    rwd: "RWD",
    awd: "AWD",
    turbo: "turbo",
    bi_turbo: "bi-turbo",
    supercharger: "supercharged",
    sedan: "Sedan",
    hatchback: "Hatchback",
    liftback: "Liftback",
    wagon: "Wagon",
    coupe: "Coupe",
    cabriolet: "Convertible",
    roadster: "Roadster",
    crossover: "Crossover",
    suv: "SUV",
    minivan: "Minivan",
    minibus: "Minibus",
    pickup: "Pickup",
    scooter: "Scooter",
    maxi_scooter: "Maxi-scooter",
    naked: "Naked",
    sportbike: "Sportbike",
    sport_tourer: "Sport tourer",
    tourer: "Tourer",
    cruiser: "Cruiser",
    chopper: "Chopper",
    classic: "Classic",
    scrambler: "Scrambler",
    enduro: "Enduro",
    adventure: "Adventure",
    supermoto: "Supermoto"
  }
};
function toNumber(v) {
  if (v === null || v === void 0 || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function fmt(n, locale, fractionDigits) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 1
  }).format(n);
}
function enumLabel(value, locale) {
  if (!value) return null;
  return ENUM_LABELS[locale][value.toLowerCase()] ?? value;
}
function buildSpecRows(d, locale) {
  const L = LABELS3[locale];
  const U = UNITS[locale];
  const rows = [];
  const push = (key, value) => {
    if (value) rows.push({ key, label: L[key], value });
  };
  const withUnit = (v, unit, digits) => {
    const n = toNumber(v);
    return n === null ? null : `${fmt(n, locale, digits)}\xA0${U[unit]}`;
  };
  const battery = withUnit(d.battery_kwh, "kwh");
  let engine;
  if (d.vehicle_type === "motorcycle") {
    engine = withUnit(d.engine_volume_cc, "cc");
  } else {
    engine = withUnit(d.engine_volume_l, "l", 1);
    const boost = d.forced_induction && d.forced_induction !== "none" ? enumLabel(d.forced_induction, locale) : null;
    if (engine && boost) engine = `${engine}, ${boost}`;
  }
  if (engine) push("engine", engine);
  else push("battery", battery);
  push("power", withUnit(d.horse_power_hp, "hp"));
  push("fuel", enumLabel(d.fuel_type, locale));
  push("transmission", enumLabel(d.transmission, locale));
  push("drive", enumLabel(d.drive_type, locale));
  push("body", enumLabel(d.body_type, locale));
  const seats = toNumber(d.seats);
  push("seats", seats === null ? null : fmt(seats, locale));
  if (engine) push("battery", battery);
  push("range", withUnit(d.range_km, "km"));
  push("sprint", withUnit(d.sprint_0_100_s, "s"));
  push("max_speed", withUnit(d.max_speed_kmh, "kmh"));
  push("clearance", withUnit(d.clearance_mm, "mm"));
  push("weight", withUnit(d.weight_kg, "kg"));
  push("tank", withUnit(d.tank_volume_l, "l"));
  push("fuel_consumption", withUnit(d.fuel_consumption_l_100km, "l100"));
  push("power_consumption", withUnit(d.power_consumption_kwh_100km, "kwh100"));
  return rows;
}

// src/blocks/catalog/share.ts
function buildVehicleShareUrl(vehicleId, referralCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("vehicle", vehicleId);
  if (referralCode) url.searchParams.set("ref", referralCode);
  return url.toString();
}
async function shareVehicle({
  vehicleId,
  title,
  referralCode,
  promptLabel
}) {
  const shareUrl = buildVehicleShareUrl(vehicleId, referralCode);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, url: shareUrl });
      return "shared";
    } catch {
      return "dismissed";
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return "copied";
  } catch {
    window.prompt(promptLabel, shareUrl);
    return "prompted";
  }
}
var COPIED_TOAST_MS = 2e3;
var COPIED_TOAST_ANIM_MS = 220;
function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
}
function useCopiedToast() {
  const [phase, setPhase] = useState("hidden");
  const mounted = useRef(true);
  const timers = useRef([]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);
  const show = useCallback(() => {
    if (!mounted.current) return;
    timers.current.forEach(clearTimeout);
    setPhase("shown");
    const anim = prefersReducedMotion() ? 0 : COPIED_TOAST_ANIM_MS;
    timers.current = [
      setTimeout(() => setPhase("leaving"), COPIED_TOAST_MS),
      setTimeout(() => setPhase("hidden"), COPIED_TOAST_MS + anim)
    ];
  }, []);
  return { phase, shown: phase === "shown", show };
}
var STATUS_MOD = {
  available: " sb-vcard__status--available",
  free: " sb-vcard__status--free",
  busy: ""
};
function tilesSizeClass(sums) {
  const longest = Math.max(0, ...sums.map((s) => s.length));
  if (longest >= 9) return " sb-vcard__tiles--xl";
  if (longest >= 8) return " sb-vcard__tiles--l";
  return "";
}
function CardPriceOverlay({
  statusText,
  statusTone,
  prices,
  minPricePerDay,
  strings: t,
  dimmed = false,
  statusSlot
}) {
  const minDay = prices ? formatBahtCeil(prices.per_day_min) : "";
  const maxDay = prices ? formatBahtCeil(prices.per_day_max) : "";
  const discount = prices ? Math.round(prices.month_discount_pct) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "sb-vcard__over", children: [
    /* @__PURE__ */ jsxs("div", { className: `sb-vcard__st${dimmed ? " is-copied" : ""}`, children: [
      /* @__PURE__ */ jsxs("span", { className: `sb-vcard__status${STATUS_MOD[statusTone]}`, children: [
        /* @__PURE__ */ jsx("span", { className: "sb-vcard__status-dot", "aria-hidden": true }),
        statusText
      ] }),
      /* @__PURE__ */ jsx("span", { className: "sb-vcard__range", children: prices ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("small", { children: t.perDay }),
        /* @__PURE__ */ jsxs("b", { children: [
          minDay === maxDay ? /* @__PURE__ */ jsx("span", { children: minDay }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { children: minDay }),
            " \u2013 ",
            maxDay
          ] }),
          "\xA0\u0E3F"
        ] })
      ] }) : minPricePerDay !== null ? /* @__PURE__ */ jsxs("b", { className: "sb-vcard__from", children: [
        /* @__PURE__ */ jsxs("small", { children: [
          t.from,
          " "
        ] }),
        /* @__PURE__ */ jsx("span", { children: formatBahtCeil(minPricePerDay) }),
        /* @__PURE__ */ jsxs("small", { children: [
          " ",
          t.perDayUnit
        ] })
      ] }) : /* @__PURE__ */ jsx("b", { className: "sb-vcard__from", children: /* @__PURE__ */ jsx("small", { children: t.onRequest }) }) }),
      statusSlot
    ] }),
    prices && prices.quotes.length > 0 ? /* @__PURE__ */ jsx("div", { className: `sb-vcard__tiles${tilesSizeClass(prices.quotes.map((q) => `${formatBahtCeil(q.total)}\xA0\u0E3F`))}`, children: prices.quotes.map((q) => {
      const best = q.days === 30;
      return /* @__PURE__ */ jsxs("div", { className: `sb-vcard__tile${best ? " sb-vcard__tile--best" : ""}`, children: [
        best && discount > 0 ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__flag", children: `\u2212${discount}%` }) : null,
        /* @__PURE__ */ jsx("span", { className: "sb-vcard__tile-days", children: t.days(q.days) }),
        /* @__PURE__ */ jsx("span", { className: "sb-vcard__tile-sum", children: `${formatBahtCeil(q.total)}\xA0\u0E3F` })
      ] }, q.days);
    }) }) : null
  ] });
}
function CardTitle({
  name,
  year,
  categoryName,
  stepTitle = false
}) {
  return /* @__PURE__ */ jsxs("div", { className: "sb-vcard__title", children: [
    /* @__PURE__ */ jsx(
      "h3",
      {
        className: "sb-vcard__name",
        tabIndex: stepTitle ? -1 : void 0,
        "data-step-title": stepTitle ? "" : void 0,
        children: name
      }
    ),
    year || categoryName ? /* @__PURE__ */ jsxs("p", { className: "sb-vcard__sub", children: [
      year ? /* @__PURE__ */ jsx("span", { children: year }) : null,
      year && categoryName ? /* @__PURE__ */ jsx("i", { "aria-hidden": true }) : null,
      categoryName ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__cat", children: categoryName }) : null
    ] }) : null
  ] });
}
function ShareIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "3" }),
    /* @__PURE__ */ jsx("circle", { cx: "6", cy: "12", r: "3" }),
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "19", r: "3" }),
    /* @__PURE__ */ jsx("line", { x1: "8.6", y1: "13.5", x2: "15.4", y2: "17.5" }),
    /* @__PURE__ */ jsx("line", { x1: "15.4", y1: "6.5", x2: "8.6", y2: "10.5" })
  ] });
}
function CheckIcon() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) });
}
function CalendarIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })
  ] });
}
var S = {
  ru: {
    title: "\u0426\u0435\u043D\u044B \u043F\u043E \u0441\u0435\u0437\u043E\u043D\u0430\u043C",
    unit: "\u0437\u0430 \u0441\u0443\u0442\u043A\u0438, \u0E3F",
    season: "\u0421\u0435\u0437\u043E\u043D",
    legend: ["\u0421\u0442\u043E\u043B\u0431\u0435\u0446 \u2014 \u0441\u0440\u043E\u043A ", "\u0432\u0441\u0435\u0439", " \u0430\u0440\u0435\u043D\u0434\u044B \u0432 \u0434\u043D\u044F\u0445, \u0441\u0442\u0440\u043E\u043A\u0430 \u2014 \u0441\u0435\u0437\u043E\u043D. \u0415\u0441\u043B\u0438 \u0430\u0440\u0435\u043D\u0434\u0430 \u0437\u0430\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u0435\u0442 \u0434\u0432\u0430 \u0441\u0435\u0437\u043E\u043D\u0430, \u0434\u043D\u0438 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0441\u0435\u0437\u043E\u043D\u0430 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u043F\u043E \u0435\u0433\u043E \u0446\u0435\u043D\u0435."],
    months: ["\u042F\u043D\u0432\u0430\u0440\u044C", "\u0424\u0435\u0432\u0440\u0430\u043B\u044C", "\u041C\u0430\u0440\u0442", "\u0410\u043F\u0440\u0435\u043B\u044C", "\u041C\u0430\u0439", "\u0418\u044E\u043D\u044C", "\u0418\u044E\u043B\u044C", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C", "\u041E\u043A\u0442\u044F\u0431\u0440\u044C", "\u041D\u043E\u044F\u0431\u0440\u044C", "\u0414\u0435\u043A\u0430\u0431\u0440\u044C"],
    monthsShort: ["\u044F\u043D\u0432", "\u0444\u0435\u0432", "\u043C\u0430\u0440", "\u0430\u043F\u0440", "\u043C\u0430\u0439", "\u0438\u044E\u043D", "\u0438\u044E\u043B", "\u0430\u0432\u0433", "\u0441\u0435\u043D", "\u043E\u043A\u0442", "\u043D\u043E\u044F", "\u0434\u0435\u043A"]
  },
  en: {
    title: "Prices by season",
    unit: "per day, \u0E3F",
    season: "Season",
    legend: ["Column \u2014 length of the ", "whole", " rental in days, row \u2014 season. If a rental spans two seasons, the days of each season are charged at its price."],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  }
};
function periodLabel(p, locale) {
  if (p.max_days === null) return `${p.min_days}+`;
  if (p.min_days === p.max_days) return pluralDays(p.min_days, locale);
  return `${p.min_days}\u2013${p.max_days}`;
}
function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}
function lastDayOfMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
function seasonLabel(start, end, locale) {
  const t = S[locale];
  const a = parseISO(start);
  const b = parseISO(end);
  if (!a || !b) return { name: `${start} \u2013 ${end}`, years: "" };
  const years = a.y === b.y ? String(a.y) : `${a.y}\u2013${b.y}`;
  const wholeMonths = a.d === 1 && b.d === lastDayOfMonth(b.y, b.m);
  const sameMonth = a.y === b.y && a.m === b.m;
  if (wholeMonths) {
    return {
      name: sameMonth ? t.months[a.m - 1] : `${t.monthsShort[a.m - 1]} \u2013 ${t.monthsShort[b.m - 1]}`,
      years
    };
  }
  const name = sameMonth ? `${a.d}\u2013${b.d} ${t.monthsShort[b.m - 1]}` : `${a.d} ${t.monthsShort[a.m - 1]} \u2013 ${b.d} ${t.monthsShort[b.m - 1]}`;
  return { name, years };
}
function isCurrentSeason(season, day) {
  return !!day && season.start_date <= day && day <= season.end_date;
}
function PriceGrid({ periods, seasons, referenceDate, locale, showLabel = true }) {
  const t = S[locale];
  const titleId = useId();
  if (periods.length === 0 || seasons.length === 0) return null;
  const last = periods.length - 1;
  return /* @__PURE__ */ jsxs("div", { className: "sb-pgrid", children: [
    showLabel ? /* @__PURE__ */ jsxs("p", { className: "sb-vd__lab", id: titleId, children: [
      t.title,
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "\xB7 ",
        t.unit
      ] })
    ] }) : null,
    /* @__PURE__ */ jsx("div", { className: "sb-pgrid__wrap", children: /* @__PURE__ */ jsxs(
      "table",
      {
        className: "sb-pgrid__table",
        "aria-labelledby": showLabel ? titleId : void 0,
        "aria-label": showLabel ? void 0 : `${t.title} \xB7 ${t.unit}`,
        children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { scope: "col", children: t.season }),
            periods.map((p, i) => /* @__PURE__ */ jsx("th", { scope: "col", children: periodLabel(p, locale) }, i))
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: seasons.map((s) => {
            const label = seasonLabel(s.start_date, s.end_date, locale);
            return /* @__PURE__ */ jsxs(
              "tr",
              {
                className: isCurrentSeason(s, referenceDate) ? "is-now" : void 0,
                children: [
                  /* @__PURE__ */ jsxs("th", { scope: "row", children: [
                    label.name,
                    label.years ? /* @__PURE__ */ jsx("small", { children: label.years }) : null
                  ] }),
                  periods.map((_, i) => {
                    const raw = s.prices[i];
                    const value = raw === null || raw === void 0 || raw === "" ? "" : formatBahtCeil(raw);
                    return /* @__PURE__ */ jsx("td", { className: i === last ? "is-best" : void 0, children: value || "\u2014" }, i);
                  })
                ]
              },
              `${s.start_date}-${s.end_date}`
            );
          }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("p", { className: "sb-pgrid__legend", children: [
      t.legend[0],
      /* @__PURE__ */ jsx("b", { children: t.legend[1] }),
      t.legend[2]
    ] })
  ] });
}
function isMoney(v) {
  return typeof v === "string" && Number.isFinite(parseFloat(v));
}
function parsePriceQuote(j) {
  if (!j || typeof j !== "object") return null;
  const o = j;
  const rental = o.rental;
  if (!rental || typeof rental !== "object" || !isMoney(rental.total) || !Array.isArray(rental.lines)) return null;
  if (!isMoney(o.total)) return null;
  const lines = [];
  for (const l of rental.lines) {
    const r = l;
    if (!r || typeof r.days !== "number" || !isMoney(r.rate_per_day) || !isMoney(r.amount)) return null;
    lines.push({ days: r.days, rate_per_day: r.rate_per_day, amount: r.amount });
  }
  if (lines.length === 0) return null;
  const accessories = [];
  for (const a of Array.isArray(o.accessories) ? o.accessories : []) {
    const r = a;
    if (!r || typeof r.accessory_id !== "string" || typeof r.quantity !== "number" || !isMoney(r.amount)) return null;
    accessories.push({ accessory_id: r.accessory_id, quantity: r.quantity, amount: r.amount });
  }
  return {
    total_days: typeof o.total_days === "number" ? o.total_days : 0,
    rental: { total: rental.total, lines },
    accessories,
    total: o.total
  };
}
function toSatang(value) {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Math.round(n * 100);
}
function legView(leg) {
  if (!leg.enabled) return null;
  if (!leg.hasLocation) return { kind: "ask" };
  const c = leg.cost;
  if (c != null && c !== "loading" && c.matched) return { kind: "priced", satang: toSatang(c.price) };
  return null;
}
function priceSummaryTotalSatang(quote, pickup, dropoff) {
  let total = toSatang(quote.total);
  for (const view of [legView(pickup), legView(dropoff)]) {
    if (view?.kind === "priced") total += view.satang;
  }
  return total;
}
function formatSummaryAmount(satang, currency) {
  return `${formatMoney(satang / 100)}${NBSP}${currency}`;
}
function isPriceSummaryVisible(quote, accessoryNames) {
  if (!quote) return false;
  return quote.accessories.every((acc) => Boolean(accessoryNames[acc.accessory_id]));
}
function PriceSummary({
  quote,
  accessoryNames,
  pickup,
  dropoff,
  locale,
  strings,
  onAskAddress,
  stale = false,
  askDisabled = false
}) {
  if (!isPriceSummaryVisible(quote, accessoryNames)) return null;
  const pickupView = legView(pickup);
  const dropoffView = legView(dropoff);
  const totalSatang = priceSummaryTotalSatang(quote, pickup, dropoff);
  const amount = (satang) => formatSummaryAmount(satang, strings.currency);
  const legRow = (kind, label, view) => {
    if (!view) return null;
    return /* @__PURE__ */ jsxs("div", { className: "sb-vd__sum-row", "data-sum": kind, children: [
      /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-label", children: label }),
      view.kind === "ask" ? /* @__PURE__ */ jsx("button", { type: "button", className: "sb-vd__sum-ask", disabled: askDisabled, onClick: () => onAskAddress(kind), children: strings.ask }) : /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-value", children: amount(view.satang) })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: `sb-vd__sum${stale ? " is-stale" : ""}`, "aria-busy": stale || void 0, children: [
    /* @__PURE__ */ jsx("span", { className: "sb-vd__section-label", children: strings.title }),
    /* @__PURE__ */ jsxs("div", { className: "sb-vd__sum-card", children: [
      quote.rental.lines.map((line, i) => /* @__PURE__ */ jsxs("div", { className: "sb-vd__sum-row", "data-sum": "rental", children: [
        /* @__PURE__ */ jsxs("span", { className: "sb-vd__sum-label", children: [
          strings.rental,
          " \xB7 ",
          pluralDays(line.days, locale),
          " \xD7 ",
          formatDayPrice(parseFloat(line.rate_per_day)),
          NBSP,
          strings.currency
        ] }),
        /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-value", children: amount(toSatang(line.amount)) })
      ] }, `r${i}`)),
      quote.accessories.map((acc) => {
        const satang = toSatang(acc.amount);
        return /* @__PURE__ */ jsxs("div", { className: "sb-vd__sum-row", "data-sum": "accessory", children: [
          /* @__PURE__ */ jsxs("span", { className: "sb-vd__sum-label", children: [
            accessoryNames[acc.accessory_id],
            " \xD7 ",
            acc.quantity
          ] }),
          /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-value", children: satang === 0 ? strings.free : amount(satang) })
        ] }, acc.accessory_id);
      }),
      legRow("pickup", strings.delivery, pickupView),
      legRow("dropoff", strings.collection, dropoffView),
      /* @__PURE__ */ jsxs("div", { className: "sb-vd__sum-row sb-vd__sum-row--total", "data-sum": "total", children: [
        /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-label", children: strings.total }),
        /* @__PURE__ */ jsx("span", { className: "sb-vd__sum-value", children: amount(totalSatang) })
      ] })
    ] })
  ] });
}
function StepHeader({
  photoUrl,
  name,
  year,
  categoryName,
  backLabel,
  closeLabel,
  onBack,
  onClose
}) {
  return /* @__PURE__ */ jsxs("div", { className: "sb-stephead", children: [
    photoUrl ? /* @__PURE__ */ jsx("img", { className: "sb-stephead__photo", src: photoUrl, alt: "", draggable: false }) : null,
    /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-stephead__back", onClick: onBack, children: [
      /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "\u2039" }),
      " ",
      backLabel
    ] }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "sb-modal__close sb-stephead__close", "aria-label": closeLabel, onClick: onClose, children: "\xD7" }),
    /* @__PURE__ */ jsx("div", { className: "sb-stephead__title", children: /* @__PURE__ */ jsx(CardTitle, { name, year, categoryName }) })
  ] });
}
var S2 = {
  ru: {
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    closePhoto: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0442\u043E",
    share: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F",
    copied: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430",
    perDay: "/\u0434\u0435\u043D\u044C",
    priceUnit: "\u0E3F",
    available: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u0441\u0435\u0439\u0447\u0430\u0441",
    freesUp: "\u041E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u0441\u044F",
    busy: "\u0417\u0430\u043D\u044F\u0442\u0430",
    // Окно машины: вкладки (владелец 2026-11-04).
    tabsLabel: "\u041E\u0431 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435",
    tabAbout: "\u041E\u0431 \u0430\u0432\u0442\u043E",
    tabPrices: "\u0412\u0441\u0435 \u0446\u0435\u043D\u044B",
    tabSpecs: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B",
    photoPrev: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0435 \u0444\u043E\u0442\u043E",
    photoNext: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u0444\u043E\u0442\u043E",
    equipment: "\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u044F",
    accessories: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438",
    perBooking: "\u0437\u0430 \u0431\u0440\u043E\u043D\u044C",
    accUnavailable: "\u041D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043D\u0430 \u044D\u0442\u0438 \u0434\u0430\u0442\u044B",
    deposit: "\u0414\u0435\u043F\u043E\u0437\u0438\u0442",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026",
    error: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
    name: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F",
    send: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441",
    sending: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C\u2026",
    // Кнопки брони (владелец 2026-11-04): коротко, одинаково на телефоне и компьютере.
    tgQuick: "\u0411\u0440\u043E\u043D\u044C \u0432 1 \u043A\u043B\u0438\u043A",
    tgQuickSub: "\u0447\u0435\u0440\u0435\u0437 Telegram, \u0431\u0435\u0437 \u0444\u043E\u0440\u043C",
    or: "\u0438\u043B\u0438",
    howToBook: "\u041A\u0430\u043A \u0437\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C?",
    back: "\u041D\u0430\u0437\u0430\u0434",
    bookCta: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
    formTitle: "\u0417\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
    // ⚠ Ручной ввод — ТОЛЬКО WhatsApp (2026-09-14): Telegram-логин, набранный
    // руками, писался в `external_id` дословно (не chat_id) и ломал
    // распознавание того же человека при следующем реальном обращении — тот
    // же клиент заводился повторно, каждый раз с новым реф-агентом. Telegram
    // остаётся доступен, но только через гарантированно-настоящий chat_id из
    // кнопки «в 1 клик» выше.
    manual: "\u0411\u0440\u043E\u043D\u044C \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
    manualSub: "\u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0444\u043E\u0440\u043C\u0443",
    dateGet: "\u0414\u0430\u0442\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F",
    dateReturn: "\u0414\u0430\u0442\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430",
    phoneLabel: "\u041D\u043E\u043C\u0435\u0440 WhatsApp",
    yourData: "\u0412\u0430\u0448\u0438 \u0434\u0430\u043D\u043D\u044B\u0435",
    successTitle: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430!",
    successText: "\u041C\u044B \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.",
    tooMany: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435",
    sendErr: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    phonePh: "+66...",
    phoneInvalid: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0441 \u043A\u043E\u0434\u043E\u043C \u0441\u0442\u0440\u0430\u043D\u044B, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 +66812345678",
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
    // Блок «Стоимость» перед кнопками брони (владелец 2026-11-04).
    sumTitle: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C",
    sumRental: "\u0410\u0440\u0435\u043D\u0434\u0430",
    sumFree: "\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",
    sumDelivery: "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443",
    sumCollection: "\u0417\u0430\u0431\u0435\u0440\u0451\u043C \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443",
    sumAsk: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441",
    sumTotal: "\u0418\u0442\u043E\u0433\u043E",
    // Календарь занятости на шаге «Как забронировать?» (владелец 2026-10-09).
    datePlaceholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435",
    datesTitle: "\u0414\u0430\u0442\u044B \u0430\u0440\u0435\u043D\u0434\u044B",
    datesEdit: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
    legendFree: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E",
    legendBusy: "\u0437\u0430\u043D\u044F\u0442\u043E",
    legendYours: "\u0432\u0430\u0448\u0438 \u0434\u0430\u0442\u044B",
    calPickStart: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0435\u043D\u044C \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F.",
    calPickup: "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435",
    calPickReturn: "\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442",
    calFreeUntil: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u0434\u043E",
    calStartBusy: "\u043C\u043E\u0434\u0435\u043B\u044C \u0437\u0430\u043D\u044F\u0442\u0430. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0435\u043D\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430.",
    calFree: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u043D\u0430 \u044D\u0442\u0438 \u0434\u0430\u0442\u044B",
    calSelected: "\u0412\u044B\u0431\u0440\u0430\u043D\u043E",
    calBusyDays: "\u041C\u043E\u0434\u0435\u043B\u044C \u0437\u0430\u043D\u044F\u0442\u0430:",
    calNoUnit: "\u041D\u0430 \u0432\u0435\u0441\u044C \u0441\u0440\u043E\u043A \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u044B \u043D\u0435\u0442",
    // Занятый срок: заявка та же, меняются только слова.
    askHint: "\u041D\u0430 \u044D\u0442\u0438 \u0434\u0430\u0442\u044B \u043F\u043E\u0434\u0431\u0435\u0440\u0451\u043C \u0437\u0430\u043C\u0435\u043D\u0443",
    tgAsk: "\u041F\u043E\u0434\u043E\u0431\u0440\u0430\u0442\u044C \u0447\u0435\u0440\u0435\u0437 Telegram",
    tgAskSub: "\u041D\u0430\u043F\u0438\u0448\u0435\u043C, \u0447\u0442\u043E \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E \u043D\u0430 \u0432\u0430\u0448\u0438 \u0434\u0430\u0442\u044B",
    manualAsk: "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C WhatsApp",
    manualAskSub: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u043F\u043E\u0434\u0431\u0435\u0440\u0451\u0442 \u043C\u0430\u0448\u0438\u043D\u0443 \u0438 \u043E\u0442\u0432\u0435\u0442\u0438\u0442",
    successBusyTitle: "\u0417\u0430\u043F\u0440\u043E\u0441 \u043F\u043E\u043B\u0443\u0447\u0435\u043D!",
    successBusyText: (vehicleName, dates) => `${vehicleName} \u043D\u0430 ${dates} \u0437\u0430\u043D\u044F\u0442\u0430. \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u043F\u043E\u0434\u0431\u0435\u0440\u0451\u0442 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0438 \u0441\u0432\u044F\u0436\u0435\u0442\u0441\u044F \u0441 \u0432\u0430\u043C\u0438.`
  },
  en: {
    close: "Close",
    closePhoto: "Close photo",
    share: "Share",
    copied: "Link copied",
    perDay: "/day",
    priceUnit: "\u0E3F",
    available: "Available now",
    freesUp: "Frees up",
    busy: "Busy",
    tabsLabel: "About the vehicle",
    tabAbout: "About",
    tabPrices: "All prices",
    tabSpecs: "Specs",
    photoPrev: "Previous photo",
    photoNext: "Next photo",
    equipment: "Equipment",
    accessories: "Additional Options",
    perBooking: "per booking",
    accUnavailable: "Not available for these dates",
    deposit: "Deposit",
    loading: "Loading\u2026",
    error: "Failed to load",
    name: "Your name",
    send: "Send request",
    sending: "Sending\u2026",
    tgQuick: "1-click booking",
    tgQuickSub: "via Telegram, no forms",
    or: "or",
    howToBook: "How to book?",
    back: "Back",
    bookCta: "Book",
    formTitle: "Booking request",
    manual: "Book manually",
    manualSub: "fill in the form",
    dateGet: "Pick-up date",
    dateReturn: "Return date",
    phoneLabel: "WhatsApp number",
    yourData: "Your details",
    successTitle: "Request sent!",
    successText: "We will contact you shortly.",
    tooMany: "Too many requests, try later",
    sendErr: "Could not send. Please try again.",
    phonePh: "+66...",
    phoneInvalid: "Enter your number with the country code, e.g. +66812345678",
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
    sumTitle: "Price",
    sumRental: "Rental",
    sumFree: "free",
    sumDelivery: "Delivery",
    sumCollection: "Collection",
    sumAsk: "Enter address",
    sumTotal: "Total",
    datePlaceholder: "Select",
    datesTitle: "Rental dates",
    datesEdit: "Change",
    legendFree: "available",
    legendBusy: "booked",
    legendYours: "your dates",
    calPickStart: "Choose the pick-up day.",
    calPickup: "Pick-up",
    calPickReturn: "Now choose the return day",
    calFreeUntil: "available until",
    calStartBusy: "\u2014 the model is booked. Choose the return day.",
    calFree: "available for these dates",
    calSelected: "Selected",
    calBusyDays: "The model is booked:",
    calNoUnit: "No vehicle is free for the whole period",
    askHint: "We'll find a replacement for these dates",
    tgAsk: "Find one via Telegram",
    tgAskSub: "We'll message you what is free for your dates",
    manualAsk: "Leave your WhatsApp",
    manualAskSub: "A manager will find a vehicle and reply",
    successBusyTitle: "Request received!",
    successBusyText: (vehicleName, dates) => `${vehicleName} is booked for ${dates}. A manager will find options and contact you.`
  }
};
function InfoIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16v-4M12 8h.01" })
  ] });
}
function SlidersIcon() {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" }) });
}
var HEADERS = { "ngrok-skip-browser-warning": "true" };
function classifyIntentPollResponse(res, body) {
  if (res.status === 404) return "gone";
  if (!res.ok) return "retry";
  if (body?.status === "used") return "used";
  if (body?.status === "expired") return "expired";
  return "retry";
}
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
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
async function fetchAvailability(apiBase, ids) {
  try {
    const res = await fetch(
      `${apiBase}/api/v1/catalog/availability/?vehicle_ids=${ids.map(encodeURIComponent).join(",")}`,
      { headers: HEADERS }
    );
    if (!res.ok) return { units: [], today: null };
    const j = await res.json();
    if (!j || !Array.isArray(j.units)) return { units: [], today: null };
    const byId = /* @__PURE__ */ new Map();
    for (const raw of j.units) {
      if (!raw || typeof raw.vehicle_id !== "string" || !Array.isArray(raw.busy)) continue;
      byId.set(raw.vehicle_id, {
        vehicle_id: raw.vehicle_id,
        busy: raw.busy.filter(
          (b) => Boolean(b) && typeof b.start === "string" && typeof b.end === "string" && b.start < b.end
        )
      });
    }
    return {
      units: ids.map((id) => byId.get(id)).filter((u) => Boolean(u)),
      today: typeof j.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.today) ? j.today : null
    };
  } catch {
    return { units: [], today: null };
  }
}
async function fetchPriceQuote(apiBase, body, signal) {
  try {
    const res = await fetch(`${apiBase}/api/v1/catalog/price-quote/`, {
      method: "POST",
      headers: { "content-type": "application/json", ...HEADERS },
      body: JSON.stringify(body),
      signal
    });
    if (res.status !== 200) return null;
    return parsePriceQuote(await res.json());
  } catch {
    return null;
  }
}
var PRICE_QUOTE_DEBOUNCE_MS = 300;
var MAX_AVAILABILITY_IDS = 20;
function withPeriod(text) {
  return text.endsWith(".") ? text : `${text}.`;
}
var WHATSAPP_PHONE_RE = /^\+[\d\s\-()]{6,19}$/;
function isValidWhatsAppPhone(value) {
  const trimmed = value.trim();
  if (!WHATSAPP_PHONE_RE.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
function VehicleBookingModal({
  vehicle,
  apiBase,
  locale,
  botUsername,
  googleMapsApiKey,
  referralCode,
  telegramUser,
  onTelegramLink,
  initialFrom,
  initialTo,
  unitIds,
  initialStep = "detail",
  onClose
}) {
  const t = S2[locale];
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("loading");
  const [gi, setGi] = useState(0);
  const [tab, setTab] = useState("about");
  const tabsId = useId();
  const tabRefs = useRef({});
  const [serverToday, setServerToday] = useState(null);
  const today = serverToday ?? todayISO();
  const [seeded] = useState(
    () => Boolean(initialFrom && initialTo && initialFrom >= todayISO() && initialTo > initialFrom)
  );
  const [start, setStart] = useState(seeded ? initialFrom : "");
  const [end, setEnd] = useState(seeded ? initialTo : "");
  const availabilityIds = [vehicle.id, ...(unitIds ?? []).filter((id) => id && id !== vehicle.id)].slice(
    0,
    MAX_AVAILABILITY_IDS
  );
  const availabilityKey = availabilityIds.join(",");
  const [units, setUnits] = useState([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [datesExpanded, setDatesExpanded] = useState(!seeded);
  const [success, setSuccess] = useState(null);
  const pollSnapshotRef = useRef(null);
  const [name, setName] = useState(telegramUser?.first_name || "");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
  const [accessories, setAccessories] = useState({});
  const [accessoryLightbox, setAccessoryLightbox] = useState(null);
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [dropoffEnabled, setDropoffEnabled] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffSameAsPickup, setDropoffSameAsPickup] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [stage, setStage] = useState(
    initialStep === "booking" ? "choice" : "detail"
  );
  const [err, setErr] = useState("");
  const [tgSubmitting, setTgSubmitting] = useState(false);
  const tgSubmittingRef = useRef(false);
  const [tgErr, setTgErr] = useState("");
  const [pollToken, setPollToken] = useState(null);
  const copiedToast = useCopiedToast();
  const dialogRef = useRef(null);
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const overlay = dialog.parentElement;
    if (overlay) overlay.scrollTop = 0;
    const body = dialog.querySelector(".sb-modal__body");
    if (body) body.scrollTop = 0;
  }, [stage]);
  const focusedStageRef = useRef(stage);
  useEffect(() => {
    if (focusedStageRef.current === stage) return;
    focusedStageRef.current = stage;
    dialogRef.current?.querySelector("[data-step-title]")?.focus({ preventScroll: true });
  }, [stage]);
  const handleShare = async () => {
    const outcome = await shareVehicle({
      vehicleId: vehicle.id,
      title: vehicle.display_name,
      referralCode,
      promptLabel: t.share
    });
    if (outcome === "copied") copiedToast.show();
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
  useIsomorphicLayoutEffect(() => {
    if (stage !== "detail" || state !== "ready") return;
    const el = trackRef.current;
    if (!el) return;
    if (el.clientWidth) el.scrollLeft = gi * el.clientWidth;
    else if (gi !== 0) setGi(0);
  }, [stage, state]);
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setAccessories({});
    setAccessoryLightbox(null);
    const windowQuery = seeded ? `?available_from=${encodeURIComponent(initialFrom)}&available_to=${encodeURIComponent(initialTo)}` : "";
    fetch(`${apiBase}/api/v1/catalog/vehicles/${vehicle.id}/${windowQuery}`, { headers: HEADERS }).then((r) => {
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
    let cancelled = false;
    setUnits([]);
    setAvailLoading(true);
    fetchAvailability(apiBase, availabilityKey.split(",")).then((r) => {
      if (cancelled) return;
      setUnits(r.units);
      setServerToday(r.today);
      setAvailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, availabilityKey]);
  const datesValid = Boolean(start && end && start >= today && end > start);
  const coveringUnitId = datesValid ? unitCovering(units, start, end) : null;
  const conflict = datesValid && units.length > 0 && coveringUnitId === null;
  const bookingVehicleId = coveringUnitId ?? vehicle.id;
  const datesCollapsed = !datesExpanded && datesValid && !conflict;
  useEffect(() => {
    if (conflict) setDatesExpanded(true);
  }, [conflict]);
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
  const [priceQuote, setPriceQuote] = useState(null);
  const priceQuoteActive = datesValid && !conflict && !availLoading;
  const accessoriesKey = selectedAccessories.map((a) => `${a.accessory_id}:${a.quantity}`).join(",");
  const priceQuoteKey = `${bookingVehicleId}|${start}|${end}|${accessoriesKey}`;
  useEffect(() => {
    if (!priceQuoteActive) {
      setPriceQuote(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetchPriceQuote(
        apiBase,
        { vehicle_id: bookingVehicleId, start_date: start, end_date: end, accessories: selectedAccessories },
        ctrl.signal
      ).then((q) => {
        if (!ctrl.signal.aborted) setPriceQuote(q ? { key: priceQuoteKey, quote: q } : null);
      });
    }, PRICE_QUOTE_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [apiBase, priceQuoteActive, bookingVehicleId, start, end, accessoriesKey]);
  const askAddressRef = useRef(null);
  const accessoryNames = {};
  for (const group of detail?.accessories ?? []) {
    for (const item of group.items) accessoryNames[item.id] = locale === "ru" ? item.name_ru : item.name_en;
  }
  const pendingAskRef = useRef(null);
  useEffect(() => {
    if (stage !== "choice" || !pendingAskRef.current) return;
    const kind = pendingAskRef.current;
    pendingAskRef.current = null;
    askAddressRef.current?.(kind);
  }, [stage]);
  const askAddress = (kind) => {
    if (submittingRef.current) return;
    if (stage === "choice") {
      askAddressRef.current?.(kind);
      return;
    }
    pendingAskRef.current = kind;
    setStage("choice");
  };
  const pickupLeg = { enabled: pickupEnabled, hasLocation: effectivePickupLocation != null, cost: pickupCost };
  const dropoffLeg = { enabled: dropoffEnabled, hasLocation: effectiveDropoffLocation != null, cost: dropoffCost };
  const currentQuote = priceQuoteActive ? priceQuote : null;
  const renderPriceSummary = () => currentQuote ? /* @__PURE__ */ jsx(
    PriceSummary,
    {
      quote: currentQuote.quote,
      stale: currentQuote.key !== priceQuoteKey,
      accessoryNames,
      pickup: pickupLeg,
      dropoff: dropoffLeg,
      locale,
      strings: {
        title: t.sumTitle,
        rental: t.sumRental,
        free: t.sumFree,
        delivery: t.sumDelivery,
        collection: t.sumCollection,
        ask: t.sumAsk,
        total: t.sumTotal,
        currency: t.priceUnit
      },
      onAskAddress: askAddress,
      askDisabled: submitting
    }
  ) : null;
  const periodLine = datesValid ? `${formatDayMonth(start, locale)} \u2192 ${formatDayMonth(end, locale)} \xB7 ${pluralDays(daysBetween(start, end), locale)}` : "";
  const takeSuccessSnapshot = (withTotal) => ({
    total: withTotal && !conflict && currentQuote && currentQuote.key === priceQuoteKey && isPriceSummaryVisible(currentQuote.quote, accessoryNames) ? formatSummaryAmount(priceSummaryTotalSatang(currentQuote.quote, pickupLeg, dropoffLeg), t.priceUnit) : null,
    periodLine,
    busyRange: datesValid ? `${formatShortDate(start, locale)} \u2013 ${formatShortDate(end, locale)}` : "",
    busy: conflict
  });
  const submit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || submitting || !datesValid || !name.trim() || !contact.trim()) return;
    if (!isValidWhatsAppPhone(contact)) {
      setContactError(t.phoneInvalid);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setErr("");
    const snapshot = takeSuccessSnapshot(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-requests/`, {
        method: "POST",
        headers: { "content-type": "application/json", ...HEADERS },
        body: JSON.stringify({
          vehicle_id: bookingVehicleId,
          start_date: start,
          end_date: end,
          customer_name: name.trim(),
          // Manual form is WhatsApp-only (2026-09-14) — Telegram here goes
          // ONLY through the 1-click flow above (handleTelegramBooking),
          // which always carries a real chat_id. No `telegram_user_data`:
          // it would be ignored server-side for this channel anyway, and
          // omitting it keeps this payload honest about what it actually is.
          contact_channel: "whatsapp",
          contact_identifier: contact.trim(),
          ...referralCode ? { referral_code: referralCode } : {},
          ...selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {},
          ...effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {},
          ...effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}
        })
      });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const busy = typeof body?.dates_busy === "boolean" ? body.dates_busy : snapshot.busy;
        setSuccess({ ...snapshot, busy, total: busy ? null : snapshot.total });
        setStage("success");
      } else {
        setErr(res.status === 429 ? t.tooMany : t.sendErr);
      }
    } catch {
      setErr(t.sendErr);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (!pollToken) return;
    let stopped = false;
    let inFlight = false;
    const check = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(
          `${apiBase}/api/v1/catalog/booking-intents/${encodeURIComponent(pollToken)}/status/`,
          { headers: HEADERS }
        );
        if (stopped) return;
        const body = res.ok ? await res.json() : null;
        if (stopped) return;
        const verdict = classifyIntentPollResponse(res, body);
        if (verdict === "used") {
          stopped = true;
          setPollToken(null);
          setSuccess(pollSnapshotRef.current);
          setStage("success");
        } else if (verdict === "expired" || verdict === "gone") {
          stopped = true;
          setPollToken(null);
        }
      } catch {
      } finally {
        inFlight = false;
      }
    };
    const interval = setInterval(check, 4e3);
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") check();
    };
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    const timeout = setTimeout(() => {
      stopped = true;
      setPollToken(null);
    }, 5 * 60 * 1e3);
    check();
    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pollToken, apiBase]);
  const handleTelegramBooking = async () => {
    if (tgSubmittingRef.current || tgSubmitting || !datesValid) return;
    tgSubmittingRef.current = true;
    setTgSubmitting(true);
    setTgErr("");
    const snapshot = takeSuccessSnapshot(false);
    let popup = null;
    try {
      popup = onTelegramLink || typeof window === "undefined" ? null : window.open("", "_blank");
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-intents/`, {
        method: "POST",
        headers: { "content-type": "application/json", ...HEADERS },
        body: JSON.stringify({
          vehicle_id: bookingVehicleId,
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
        popup?.close();
        return;
      }
      const { token } = await res.json();
      if (!token) {
        setTgErr(t.sendErr);
        popup?.close();
        return;
      }
      const href = safeHref(`https://t.me/${botUsername}?start=bk_${encodeURIComponent(token)}`);
      if (!href) {
        setTgErr(t.sendErr);
        popup?.close();
        return;
      }
      pollSnapshotRef.current = snapshot;
      setPollToken(token);
      if (onTelegramLink) {
        onTelegramLink(href);
      } else if (popup) {
        popup.location.href = href;
      } else {
        window.location.href = href;
      }
    } catch {
      setTgErr(t.sendErr);
      popup?.close();
    } finally {
      tgSubmittingRef.current = false;
      setTgSubmitting(false);
    }
  };
  const d = detail;
  const specRows = d ? buildSpecRows({ ...d, vehicle_type: d.vehicle_type ?? vehicle.vehicle_type }, locale) : [];
  const galleryUrls = (d?.gallery_images ?? []).map((g) => safeImageUrl(g.image_url)).filter((u) => Boolean(u));
  const fallbackImg = safeImageUrl(vehicle.photo_url ?? "") || "";
  const gallery = galleryUrls.length ? galleryUrls : fallbackImg ? [fallbackImg] : [];
  const mainImg = gallery[gi] || fallbackImg || "";
  const price = d?.min_price_per_day ?? vehicle.min_price_per_day;
  const priceGrid = (() => {
    if (!d) return null;
    if ((d.pricing_periods ?? []).length > 0 && (d.pricing_seasons ?? []).length > 0) {
      return { periods: d.pricing_periods, seasons: d.pricing_seasons, referenceDate: seeded ? initialFrom : today };
    }
    const table = d.pricing_table ?? [];
    if (table.length === 0) return null;
    const [y, m] = today.split("-").map(Number);
    const monthStart = `${today.slice(0, 7)}-01`;
    const monthEnd = `${today.slice(0, 7)}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
    return {
      periods: table.map((row) => ({ min_days: row.min_days, max_days: row.max_days })),
      seasons: [{ start_date: monthStart, end_date: monthEnd, prices: table.map((row) => row.price_per_day) }],
      // Today's ladder — its row is today's month.
      referenceDate: today
    };
  })();
  const hasAbout = !!d && ((d.advantages ?? []).length > 0 || (d.options ?? []).length > 0 || (d.deposits ?? []).length > 0);
  const tabs = [
    ...hasAbout ? [{ key: "about", label: t.tabAbout, icon: /* @__PURE__ */ jsx(InfoIcon, {}) }] : [],
    ...priceGrid ? [{ key: "prices", label: t.tabPrices, icon: /* @__PURE__ */ jsx(CalendarIcon, {}) }] : [],
    ...specRows.length > 0 ? [{ key: "specs", label: t.tabSpecs, icon: /* @__PURE__ */ jsx(SlidersIcon, {}) }] : []
  ];
  const activeTab = tabs.some((x) => x.key === tab) ? tab : tabs[0]?.key ?? null;
  const tabId = (key) => `${tabsId}-tab-${key}`;
  const panelId = (key) => `${tabsId}-panel-${key}`;
  const onTabKeyDown = (e) => {
    const i = tabs.findIndex((x) => x.key === activeTab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const key = tabs[next].key;
    setTab(key);
    tabRefs.current[key]?.focus();
  };
  const isBusy = !!d && !d.is_available;
  const freeFrom = isBusy ? d.free_from : null;
  const coverStatus = !d ? null : d.is_available ? { text: t.available, tone: "available" } : freeFrom ? { text: `${t.freesUp} ${formatShortDateWithYear(freeFrom, locale)}`, tone: "free" } : { text: t.busy, tone: "busy" };
  const onBook = () => {
    if (freeFrom && (!start || start < freeFrom)) {
      setStart(freeFrom);
      setEnd("");
      setDatesExpanded(true);
    }
    setStage("choice");
  };
  const bookedOnOpenRef = useRef(false);
  useEffect(() => {
    if (initialStep !== "booking" || bookedOnOpenRef.current || !d) return;
    bookedOnOpenRef.current = true;
    onBook();
  }, [d]);
  const renderAccessories = () => {
    if (!d || (d.accessories ?? []).length === 0) return null;
    return /* @__PURE__ */ jsxs("div", { className: "sb-vd__accessories", children: [
      /* @__PURE__ */ jsx("p", { className: "sb-vd__lab", children: t.accessories }),
      /* @__PURE__ */ jsx("div", { className: "sb-acc__row", children: d.accessories.flatMap(
        (group) => group.items.map((item) => {
          const qty = accessories[item.id] || 0;
          const unavailable = item.available_stock !== null && item.available_stock <= 0;
          const atMax = !unavailable && item.available_stock !== null && qty >= item.available_stock;
          const itemName = locale === "ru" ? item.name_ru : item.name_en;
          const categoryName = locale === "ru" ? group.name_ru : group.name_en;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `sb-acc__item${unavailable ? " is-unavailable" : ""}${qty > 0 ? " is-selected" : ""}`,
              children: [
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
                        // fullscreen; fall back to the thumb (sanitize each
                        // independently so a bad full URL still falls back).
                        photoUrl: safeImageUrl(item.photo_full_url ?? void 0) ?? safeImageUrl(item.photo_url ?? void 0) ?? "",
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
                  /* @__PURE__ */ jsx("span", { className: "sb-acc__item-category", children: categoryName }),
                  /* @__PURE__ */ jsx("span", { className: "sb-acc__item-name", children: itemName }),
                  item.price != null ? /* @__PURE__ */ jsxs("span", { className: "sb-acc__item-price", children: [
                    formatMoney(Math.round(item.price)),
                    NBSP,
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
              ]
            },
            item.id
          );
        })
      ) })
    ] });
  };
  const renderDatesStatus = () => {
    const days = datesValid ? pluralDays(daysBetween(start, end), locale) : "";
    let text;
    let tone = "";
    if (!start) {
      text = t.calPickStart;
    } else if (!datesValid) {
      const day = formatDayMonth(start, locale);
      if (isDayBusy(units, start)) {
        text = `${day} ${t.calStartBusy}`;
        tone = "is-warn";
      } else {
        const limit = maxReturnDay(units, start);
        text = `${withPeriod(`${t.calPickup} ${day}`)} ` + withPeriod(
          limit ? `${t.calPickReturn} \u2014 ${t.calFreeUntil} ${formatDayMonth(limit, locale)}` : t.calPickReturn
        );
      }
    } else if (conflict) {
      const busy = busyDaysIn(units, start, end).map(([a, b]) => formatDayMonthRange(a, b, locale));
      text = `${t.calSelected} ${formatDayMonthRange(start, end, locale)} \xB7 ${withPeriod(days)} ` + (busy.length > 0 ? `${t.calBusyDays} ${busy.join(", ")}` : t.calNoUnit);
      tone = "is-warn";
    } else {
      const parts = [
        ...datesCollapsed ? [] : [`${formatDayMonth(start, locale)} \u2192 ${formatDayMonth(end, locale)}`],
        days,
        ...units.length > 0 ? [t.calFree] : []
      ];
      text = parts.join(" \xB7 ");
      if (units.length > 0) tone = "is-ok";
    }
    return /* @__PURE__ */ jsx("p", { className: `sb-avcal__status ${tone}`, "aria-live": "polite", children: text });
  };
  const stepWithHeader = state === "ready" && !!d && (stage === "choice" || stage === "form");
  const renderStepHeader = (onBack) => d ? /* @__PURE__ */ jsx(
    StepHeader,
    {
      photoUrl: mainImg,
      name: d.display_name,
      year: d.year,
      categoryName: d.category ? categoryLabel(d.category, locale) : null,
      backLabel: t.back,
      closeLabel: t.close,
      onBack,
      onClose
    }
  ) : null;
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
            stepWithHeader ? null : /* @__PURE__ */ jsx("button", { type: "button", className: "sb-modal__close", "aria-label": t.close, onClick: onClose, children: "\xD7" }),
            state === "loading" ? /* @__PURE__ */ jsx("p", { className: "sb-modal__state", children: t.loading }) : null,
            state === "error" ? /* @__PURE__ */ jsx("p", { className: "sb-modal__state", children: t.error }) : null,
            state === "ready" && d ? stage === "success" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__success", children: [
              /* @__PURE__ */ jsx("div", { className: "sb-modal__check", "aria-hidden": true, children: /* @__PURE__ */ jsx(CheckIcon, {}) }),
              /* @__PURE__ */ jsx("h3", { tabIndex: -1, "data-step-title": "", children: success?.busy ? t.successBusyTitle : t.successTitle }),
              /* @__PURE__ */ jsx("p", { children: success?.busy ? t.successBusyText(d.display_name, success.busyRange) : t.successText }),
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__recap", children: [
                mainImg ? /* @__PURE__ */ jsx("img", { className: "sb-vd__recap-photo", src: mainImg, alt: "" }) : null,
                /* @__PURE__ */ jsxs("span", { className: "sb-vd__recap-main", children: [
                  /* @__PURE__ */ jsx("b", { children: d.display_name }),
                  success?.periodLine ? /* @__PURE__ */ jsx("span", { children: success.periodLine }) : null
                ] }),
                success?.total ? /* @__PURE__ */ jsxs("span", { className: "sb-vd__recap-total", children: [
                  /* @__PURE__ */ jsx("small", { children: t.sumTotal }),
                  /* @__PURE__ */ jsx("b", { children: success.total })
                ] }) : null
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "sb-btn sb-vd__submit", onClick: onClose, children: "OK" })
            ] }) : stage === "detail" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__body sb-vd", children: [
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__hero", children: [
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
                /* @__PURE__ */ jsx("div", { className: "sb-vd__top", children: /* @__PURE__ */ jsx(
                  CardTitle,
                  {
                    name: d.display_name,
                    year: d.year,
                    categoryName: d.category ? categoryLabel(d.category, locale) : null,
                    stepTitle: true
                  }
                ) }),
                gallery.length > 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: "sb-vd__nav sb-vd__nav--prev",
                      "aria-label": t.photoPrev,
                      onClick: () => scrollToImage(gi - 1, gallery.length),
                      children: "\u2039"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: "sb-vd__nav sb-vd__nav--next",
                      "aria-label": t.photoNext,
                      onClick: () => scrollToImage(gi + 1, gallery.length),
                      children: "\u203A"
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "sb-vd__counter", children: [
                    gi + 1,
                    "/",
                    gallery.length
                  ] })
                ] }) : null,
                coverStatus ? /* @__PURE__ */ jsx(
                  CardPriceOverlay,
                  {
                    statusText: coverStatus.text,
                    statusTone: coverStatus.tone,
                    prices: d.card_prices ?? vehicle.card_prices ?? null,
                    minPricePerDay: price ?? null,
                    strings: STRINGS3[locale]
                  }
                ) : null
              ] }),
              activeTab ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__info", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `sb-vd__tabs sb-vd__tabs--n${tabs.length}`,
                    role: "tablist",
                    "aria-label": t.tabsLabel,
                    children: tabs.map((x) => /* @__PURE__ */ jsxs(
                      "button",
                      {
                        ref: (el) => {
                          tabRefs.current[x.key] = el;
                        },
                        type: "button",
                        role: "tab",
                        id: tabId(x.key),
                        "aria-selected": x.key === activeTab,
                        "aria-controls": panelId(x.key),
                        tabIndex: x.key === activeTab ? 0 : -1,
                        className: `sb-vd__tab${x.key === activeTab ? " is-active" : ""}`,
                        onClick: () => setTab(x.key),
                        onKeyDown: onTabKeyDown,
                        children: [
                          x.icon,
                          x.label
                        ]
                      },
                      x.key
                    ))
                  }
                ),
                tabs.map((x) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    role: "tabpanel",
                    id: panelId(x.key),
                    "aria-labelledby": tabId(x.key),
                    tabIndex: 0,
                    hidden: x.key !== activeTab,
                    className: "sb-vd__panel",
                    children: x.key === "about" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      (d.advantages ?? []).length > 0 ? /* @__PURE__ */ jsx("ul", { className: "sb-vd__adv", children: d.advantages.map((a, i) => /* @__PURE__ */ jsxs("li", { children: [
                        /* @__PURE__ */ jsx(CheckIcon, {}),
                        a
                      ] }, i)) }) : null,
                      (d.options ?? []).length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__group", children: [
                        /* @__PURE__ */ jsx("p", { className: "sb-vd__lab", children: t.equipment }),
                        /* @__PURE__ */ jsx("div", { className: "sb-vd__chips", children: d.options.map((o, i) => /* @__PURE__ */ jsx("span", { className: "sb-vd__chip", children: o }, i)) })
                      ] }) : null,
                      (d.deposits ?? []).length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-vd__group", children: [
                        /* @__PURE__ */ jsx("p", { className: "sb-vd__lab", children: t.deposit }),
                        /* @__PURE__ */ jsx("div", { className: "sb-vd__deposit-pills", children: d.deposits.map((dep, i) => /* @__PURE__ */ jsxs("span", { className: "sb-vd__deposit-pill", children: [
                          formatMoney(dep.amount),
                          NBSP,
                          dep.currency_code === "THB" ? t.priceUnit : dep.currency_code
                        ] }, i)) })
                      ] }) : null
                    ] }) : x.key === "prices" && priceGrid ? /* @__PURE__ */ jsx(
                      PriceGrid,
                      {
                        periods: priceGrid.periods,
                        seasons: priceGrid.seasons,
                        referenceDate: priceGrid.referenceDate,
                        locale
                      }
                    ) : x.key === "specs" ? (
                      // Every spec row at once; rows and units: ./specs.ts
                      /* @__PURE__ */ jsx("div", { className: "sb-vd__specs", children: specRows.map((row) => /* @__PURE__ */ jsxs("div", { className: "sb-vd__spec", children: [
                        /* @__PURE__ */ jsx("span", { children: row.label }),
                        /* @__PURE__ */ jsx("b", { children: row.value })
                      ] }, row.key)) })
                    ) : null
                  },
                  x.key
                ))
              ] }) : null,
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__cta", children: [
                /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-vcard__book", onClick: onBook, children: [
                  /* @__PURE__ */ jsx(CalendarIcon, {}),
                  t.bookCta
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: `sb-vcard__share${copiedToast.shown ? " is-done" : ""}`,
                    "aria-label": t.share,
                    onClick: handleShare,
                    children: copiedToast.shown ? /* @__PURE__ */ jsx(CheckIcon, {}) : /* @__PURE__ */ jsx(ShareIcon, {})
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "sb-vd__toast-slot", role: "status", "aria-live": "polite", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `sb-vd__toast${copiedToast.shown ? " is-shown" : ""}`,
                    "aria-hidden": copiedToast.phase === "hidden",
                    children: copiedToast.phase !== "hidden" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(CheckIcon, {}),
                      t.copied
                    ] }) : null
                  }
                ) })
              ] })
            ] }) : stage === "choice" ? /* @__PURE__ */ jsxs("div", { className: "sb-modal__body sb-modal__body--book", children: [
              renderStepHeader(() => setStage("detail")),
              /* @__PURE__ */ jsx("h3", { className: "sb-bk__title", tabIndex: -1, "data-step-title": "", children: t.howToBook }),
              /* @__PURE__ */ jsxs("div", { className: `sb-avcal-block${datesCollapsed ? " is-collapsed" : ""}`, children: [
                datesCollapsed ? /* @__PURE__ */ jsx("div", { className: "sb-filterbar__availability is-ready is-compact sb-avcal__summary", children: /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-compact", children: [
                  /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-summary", children: [
                    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
                      /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
                      /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
                      /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
                      /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "sb-filterbar__availability-title", children: t.datesTitle }),
                    /* @__PURE__ */ jsxs("span", { className: "sb-filterbar__availability-range", children: [
                      formatDDMMYYYY(start),
                      " \u2014 ",
                      formatDDMMYYYY(end)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: "sb-filterbar__availability-edit",
                      onClick: () => setDatesExpanded(true),
                      children: t.datesEdit
                    }
                  )
                ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("div", { className: "sb-vd__dates", children: [
                    /* @__PURE__ */ jsxs("div", { className: `sb-avcal__field${!start ? " is-active" : ""}`, children: [
                      /* @__PURE__ */ jsx("span", { className: "sb-avcal__field-label", children: t.dateGet }),
                      /* @__PURE__ */ jsx("span", { className: `sb-avcal__value${start ? "" : " is-placeholder"}`, children: start ? formatDDMMYYYY(start) : t.datePlaceholder })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: `sb-avcal__field${start && !end ? " is-active" : ""}`, children: [
                      /* @__PURE__ */ jsx("span", { className: "sb-avcal__field-label", children: t.dateReturn }),
                      /* @__PURE__ */ jsx("span", { className: `sb-avcal__value${end ? "" : " is-placeholder"}`, children: end ? formatDDMMYYYY(end) : t.datePlaceholder })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    AvailabilityCalendar,
                    {
                      units,
                      today,
                      start,
                      end,
                      locale,
                      onChange: (nextStart, nextEnd) => {
                        setStart(nextStart);
                        setEnd(nextEnd);
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "sb-avcal__legend", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      /* @__PURE__ */ jsx("i", { className: "sb-avcal__legend-free", "aria-hidden": true, children: "9" }),
                      t.legendFree
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      /* @__PURE__ */ jsx("i", { className: "sb-avcal__legend-busy", "aria-hidden": true, children: "12" }),
                      t.legendBusy
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      /* @__PURE__ */ jsx("i", { className: "sb-avcal__legend-yours", "aria-hidden": true, children: "14" }),
                      t.legendYours
                    ] })
                  ] })
                ] }),
                renderDatesStatus()
              ] }),
              renderAccessories(),
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
                  },
                  askAddressRef
                }
              ),
              renderPriceSummary(),
              /* @__PURE__ */ jsxs("div", { className: "sb-vd__book-actions", children: [
                conflict ? /* @__PURE__ */ jsx("p", { className: "sb-avcal__ask", children: t.askHint }) : null,
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__book-row", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "sb-vd__tg-card",
                      disabled: !datesValid || availLoading || tgSubmitting,
                      onClick: handleTelegramBooking,
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-icon", "aria-hidden": true, children: /* @__PURE__ */ jsx(ContactIcon, { kind: "telegram" }) }),
                        /* @__PURE__ */ jsxs("span", { className: "sb-vd__tg-text", children: [
                          /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-title", children: conflict ? t.tgAsk : t.tgQuick }),
                          /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-sub", children: tgSubmitting ? t.loading : conflict ? t.tgAskSub : t.tgQuickSub })
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-arrow", "aria-hidden": true, children: "\u203A" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "sb-vd__or", children: t.or }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "sb-vd__option-card",
                      disabled: !datesValid || availLoading,
                      onClick: () => setStage("form"),
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__option-icon", "aria-hidden": true, children: /* @__PURE__ */ jsxs(
                          "svg",
                          {
                            viewBox: "0 0 24 24",
                            width: "22",
                            height: "22",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            "aria-hidden": "true",
                            children: [
                              /* @__PURE__ */ jsx("rect", { width: "8", height: "4", x: "8", y: "2", rx: "1" }),
                              /* @__PURE__ */ jsx("path", { d: "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" }),
                              /* @__PURE__ */ jsx("path", { d: "M16 4h2a2 2 0 0 1 2 2v2" }),
                              /* @__PURE__ */ jsx("path", { d: "M8 11h5" }),
                              /* @__PURE__ */ jsx("path", { d: "M8 15h2" }),
                              /* @__PURE__ */ jsx("path", { d: "M21.378 13.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" })
                            ]
                          }
                        ) }),
                        /* @__PURE__ */ jsxs("span", { className: "sb-vd__tg-text", children: [
                          /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-title", children: conflict ? t.manualAsk : t.manual }),
                          /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-sub", children: conflict ? t.manualAskSub : t.manualSub })
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__tg-arrow", "aria-hidden": true, children: "\u203A" })
                      ]
                    }
                  )
                ] }),
                tgErr ? /* @__PURE__ */ jsx("p", { className: "sb-form__status sb-form__status--err", children: tgErr }) : null
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "sb-modal__body sb-modal__body--book", children: [
              renderStepHeader(() => setStage("choice")),
              /* @__PURE__ */ jsxs("form", { className: "sb-vd__form", onSubmit: submit, children: [
                /* @__PURE__ */ jsx("h3", { className: "sb-bk__title", tabIndex: -1, "data-step-title": "", children: t.formTitle }),
                /* @__PURE__ */ jsx("p", { className: "sb-vd__datesline", children: periodLine }),
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
                renderPriceSummary(),
                /* @__PURE__ */ jsxs("div", { className: "sb-vd__you", children: [
                  /* @__PURE__ */ jsx("p", { className: "sb-vd__lab", children: t.yourData }),
                  /* @__PURE__ */ jsxs("div", { className: "sb-vd__you-row", children: [
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
                      /* @__PURE__ */ jsxs("label", { className: "sb-vd__field", children: [
                        /* @__PURE__ */ jsx("span", { className: "sb-vd__field-label", children: t.phoneLabel }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            className: "sb-input",
                            type: "text",
                            placeholder: t.phonePh,
                            required: true,
                            value: contact,
                            onChange: (e) => {
                              setContact(e.target.value);
                              setContactError("");
                            },
                            "aria-invalid": !!contactError,
                            "aria-describedby": contactError ? "sb-vd-contact-error" : void 0
                          }
                        )
                      ] }),
                      contactError ? /* @__PURE__ */ jsx("span", { id: "sb-vd-contact-error", className: "sb-vd__field-error", children: contactError }) : null
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "sb-btn sb-btn--block sb-vd__submit",
                    type: "submit",
                    disabled: submitting || !datesValid,
                    children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("span", { className: "sb-btn__spinner", "aria-hidden": "true" }),
                      t.sending
                    ] }) : t.send
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
function isModifiedClick(e) {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
function formatCardDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC"
    });
  } catch {
    return iso;
  }
}
function VehicleCard({
  vehicle: v,
  total,
  availableCount,
  categoryName,
  hasCompleteDateRange,
  locale,
  strings: t,
  referralCode,
  onOpen,
  href
}) {
  const toast = useCopiedToast();
  const onLinkClick = (e) => {
    if (e.defaultPrevented || isModifiedClick(e)) return;
    e.preventDefault();
    onOpen();
  };
  const handleShare = async () => {
    const outcome = await shareVehicle({
      vehicleId: v.id,
      title: v.display_name,
      referralCode,
      promptLabel: t.share
    });
    if (outcome === "copied") toast.show();
  };
  const countLabel = total > 1 ? availableCount > 0 ? `${availableCount} ${t.available}` : t.units(total, v.vehicle_type) : null;
  const statusText = v.is_available ? hasCompleteDateRange ? t.availableSelected : t.availableToday : v.free_from ? `${t.freeFrom} ${formatCardDate(v.free_from, locale)}` : t.busy;
  const statusTone = v.is_available ? "available" : v.free_from ? "free" : "busy";
  const shown = toast.shown;
  return /* @__PURE__ */ jsx("article", { className: "sb-vcard", children: /* @__PURE__ */ jsxs("div", { className: "sb-vcard__inner", children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-vcard__ph", children: [
      v.photo_url ? /* @__PURE__ */ jsx("img", { src: v.photo_url, alt: v.display_name, loading: "lazy" }) : null,
      href ? /* @__PURE__ */ jsx("a", { className: "sb-vcard__open", href, "aria-label": v.display_name, onClick: onLinkClick }) : /* @__PURE__ */ jsx("button", { type: "button", className: "sb-vcard__open", "aria-label": v.display_name, onClick: onOpen }),
      /* @__PURE__ */ jsxs("div", { className: "sb-vcard__top", children: [
        /* @__PURE__ */ jsx(CardTitle, { name: v.display_name, year: v.year, categoryName }),
        countLabel ? /* @__PURE__ */ jsx("span", { className: "sb-vcard__count", children: countLabel }) : null
      ] }),
      /* @__PURE__ */ jsx(
        CardPriceOverlay,
        {
          statusText,
          statusTone,
          prices: v.card_prices ?? null,
          minPricePerDay: v.min_price_per_day,
          strings: t,
          dimmed: shown,
          statusSlot: /* @__PURE__ */ jsx("div", { className: "sb-vcard__toast-slot", role: "status", "aria-live": "polite", children: /* @__PURE__ */ jsx("span", { className: `sb-vcard__toast${shown ? " is-shown" : ""}`, "aria-hidden": toast.phase === "hidden", children: toast.phase !== "hidden" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CheckIcon, {}),
            t.linkCopied
          ] }) : null }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sb-vcard__body", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-vcard__book", onClick: onOpen, children: [
        /* @__PURE__ */ jsx(CalendarIcon, {}),
        t.book
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `sb-vcard__share${shown ? " is-done" : ""}`,
          "aria-label": t.share,
          onClick: handleShare,
          children: shown ? /* @__PURE__ */ jsx(CheckIcon, {}) : /* @__PURE__ */ jsx(ShareIcon, {})
        }
      )
    ] })
  ] }) });
}
function parseISODate2(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
function toISODate2(value) {
  return String(value.getFullYear()) + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
}
function MobileDatePicker({
  field,
  locale,
  selected,
  minDate,
  dateFromLabel,
  dateToLabel,
  onSelect,
  onClose,
  closeLabel
}) {
  const titleId = useId();
  const closeRef = useRef(null);
  const overlayRef = useRef(null);
  const isOpen = field !== null;
  const fieldLabel = field === "from" ? dateFromLabel : dateToLabel;
  const min = parseISODate2(minDate);
  const selectedDate = selected ? parseISODate2(selected) : void 0;
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const apply = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const measured = window.visualViewport?.height ?? window.innerHeight;
      if (!measured || measured <= 0) return;
      overlay.style.height = "";
      if (measured < overlay.clientHeight) overlay.style.height = Math.round(measured) + "px";
    };
    const applySoon = () => {
      apply();
      window.requestAnimationFrame?.(apply);
    };
    apply();
    const viewport = window.visualViewport;
    window.addEventListener("resize", applySoon);
    window.addEventListener("orientationchange", applySoon);
    viewport?.addEventListener("resize", applySoon);
    return () => {
      window.removeEventListener("resize", applySoon);
      window.removeEventListener("orientationchange", applySoon);
      viewport?.removeEventListener("resize", applySoon);
    };
  }, [isOpen]);
  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "sb-root", children: /* @__PURE__ */ jsx("div", { className: "sb-date-sheet", role: "presentation", onPointerDown: onClose, ref: overlayRef, children: /* @__PURE__ */ jsxs(
      "section",
      {
        className: "sb-date-sheet__dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": titleId,
        onPointerDown: (event) => event.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "sb-date-sheet__head", children: [
            /* @__PURE__ */ jsx("h3", { id: titleId, children: fieldLabel }),
            /* @__PURE__ */ jsx(
              "button",
              {
                ref: closeRef,
                type: "button",
                className: "sb-date-sheet__close",
                "aria-label": closeLabel,
                onClick: onClose,
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            DayPicker,
            {
              mode: "single",
              locale: locale === "ru" ? ru : enGB,
              selected: selectedDate,
              defaultMonth: selectedDate ?? min,
              startMonth: min,
              disabled: { before: min },
              fixedWeeks: true,
              autoFocus: true,
              navLayout: "around",
              classNames: {
                root: "sb-date-sheet__calendar",
                months: "sb-date-sheet__months",
                month: "sb-date-sheet__month",
                month_caption: "sb-date-sheet__caption",
                caption_label: "sb-date-sheet__caption-label",
                button_previous: "sb-date-sheet__nav-button",
                button_next: "sb-date-sheet__nav-button",
                chevron: "sb-date-sheet__chevron",
                weekdays: "sb-date-sheet__weekdays",
                weekday: "sb-date-sheet__weekday",
                month_grid: "sb-date-sheet__grid",
                week: "sb-date-sheet__week",
                day: "sb-date-sheet__day",
                day_button: "sb-date-sheet__day-button",
                selected: "is-selected",
                disabled: "is-disabled",
                today: "is-today",
                outside: "is-outside"
              },
              onSelect: (date) => {
                if (date) onSelect(toISODate2(date));
              }
            }
          )
        ]
      }
    ) }) }),
    document.body
  );
}
function defaultFilterState() {
  return {
    vehicleType: void 0,
    category: void 0,
    search: void 0,
    availableFrom: void 0,
    availableTo: void 0,
    availableOnly: false,
    sort: "default"
  };
}
function FilterBar({ filters, categories, onChange, strings: t, locale }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [mobileDateField, setMobileDateField] = useState(null);
  const availableFromRef = useRef(null);
  const suppressNativePickerRef = useRef(false);
  const today = todayISO();
  const applyDatePatch = (patch) => {
    const nextFrom = Object.prototype.hasOwnProperty.call(patch, "availableFrom") ? patch.availableFrom : filters.availableFrom;
    const nextTo = Object.prototype.hasOwnProperty.call(patch, "availableTo") ? patch.availableTo : filters.availableTo;
    if (!nextFrom || !nextTo) {
      onChange({ ...patch, availableOnly: false });
      return;
    }
    if (nextTo <= nextFrom) return;
    onChange({ ...patch, availableOnly: true });
  };
  const handleFromChange = (value) => {
    const patch = { availableFrom: value || void 0 };
    if (filters.availableTo && value && filters.availableTo <= value) {
      patch.availableTo = nextDay(value);
    }
    applyDatePatch(patch);
  };
  const hasActiveFilters = Boolean(
    filters.search || filters.vehicleType || filters.category || filters.availableFrom || filters.availableTo || filters.availableOnly || filters.sort && filters.sort !== "default"
  );
  const activeCategory = categories.find((c) => c.id === filters.category);
  const hasCompleteDateRange = Boolean(filters.availableFrom && filters.availableTo);
  const openDesktopDatePicker = (input) => {
    if (typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches) {
      openNativeDatePicker(input);
    }
  };
  const requestStartDate = () => {
    if (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches) {
      setMobileDateField("from");
      return;
    }
    const input = availableFromRef.current;
    if (!input) return;
    input.focus();
    openDesktopDatePicker(input);
  };
  const openMobileDatePicker = (event, field) => {
    if (event.pointerType !== "touch") return;
    suppressNativePickerRef.current = true;
    event.preventDefault();
    setMobileDateField(field);
  };
  const handleNativeDateClick = (input) => {
    if (suppressNativePickerRef.current) {
      suppressNativePickerRef.current = false;
      return;
    }
    openDesktopDatePicker(input);
  };
  const handleMobileDateSelect = (value) => {
    if (mobileDateField === "from") {
      handleFromChange(value);
    } else if (mobileDateField === "to") {
      applyDatePatch({ availableTo: value });
    }
    setMobileDateField(null);
  };
  const cycleSort = () => {
    const order = ["default", "price_asc", "price_desc"];
    const next = order[(order.indexOf(filters.sort) + 1) % order.length];
    onChange({ sort: next });
  };
  const sortLabel = filters.sort === "price_asc" ? t.sortPriceAsc : filters.sort === "price_desc" ? t.sortPriceDesc : t.sortDefault;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("section", { className: `sb-filterbar__availability ${hasCompleteDateRange ? editingDates ? "is-ready is-editing" : "is-ready is-compact" : "is-pending"}`, "aria-label": t.availabilityTitle, children: hasCompleteDateRange && !editingDates ? /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-compact", children: [
      /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-summary", children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
          /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
          /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "sb-filterbar__availability-title", children: t.availabilityTitle }),
        /* @__PURE__ */ jsxs("span", { className: "sb-filterbar__availability-range", children: [
          formatDDMMYYYY(filters.availableFrom),
          " \u2014 ",
          formatDDMMYYYY(filters.availableTo)
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "sb-filterbar__availability-edit", onClick: () => setEditingDates(true), children: t.editDates }),
      /* @__PURE__ */ jsxs("label", { className: "sb-filterbar__availability-toggle", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: filters.availableOnly,
            onChange: (e) => onChange({ availableOnly: e.target.checked })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "sb-filterbar__availability-switch", "aria-hidden": true }),
        /* @__PURE__ */ jsx("span", { children: t.availableOnly })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-head", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__availability-title", children: [
          /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
            /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
            /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
            /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
          ] }),
          /* @__PURE__ */ jsx("span", { children: t.availabilityTitle })
        ] }) }),
        hasCompleteDateRange ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "sb-filterbar__availability-action is-complete",
            onClick: () => setEditingDates(false),
            children: t.doneDates
          }
        ) : /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "sb-filterbar__availability-action",
            onClick: requestStartDate,
            children: [
              /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "15", height: "15", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
                /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
                /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
                /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
              ] }),
              t.availabilityActionPending
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__daterange", children: [
        /* @__PURE__ */ jsxs("label", { className: "sb-filterbar__datechip", children: [
          /* @__PURE__ */ jsx("span", { className: `sb-filterbar__datechip-val${filters.availableFrom ? "" : " sb-filterbar__datechip-val--ph"}`, children: filters.availableFrom ? formatDDMMYYYY(filters.availableFrom) : t.dateFrom }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: availableFromRef,
              type: "date",
              className: "sb-filterbar__datechip-input",
              "aria-label": t.dateFrom,
              value: filters.availableFrom || "",
              min: today,
              onPointerDown: (e) => openMobileDatePicker(e, "from"),
              onClick: (e) => handleNativeDateClick(e.currentTarget),
              onChange: (e) => handleFromChange(e.currentTarget.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: "sb-filterbar__date-sep", children: "\u2014" }),
        /* @__PURE__ */ jsxs("label", { className: "sb-filterbar__datechip", children: [
          /* @__PURE__ */ jsx("span", { className: `sb-filterbar__datechip-val${filters.availableTo ? "" : " sb-filterbar__datechip-val--ph"}`, children: filters.availableTo ? formatDDMMYYYY(filters.availableTo) : t.dateTo }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "sb-filterbar__datechip-input",
              "aria-label": t.dateTo,
              value: filters.availableTo || "",
              min: filters.availableFrom ? nextDay(filters.availableFrom) : nextDay(today),
              onPointerDown: (e) => openMobileDatePicker(e, "to"),
              onClick: (e) => handleNativeDateClick(e.currentTarget),
              onChange: (e) => applyDatePatch({ availableTo: e.currentTarget.value || void 0 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "sb-filterbar__availability-copy", children: hasCompleteDateRange ? t.availabilityReady : t.availabilityPrompt })
    ] }) }),
    /* @__PURE__ */ jsx(
      MobileDatePicker,
      {
        field: mobileDateField,
        locale,
        selected: mobileDateField === "from" ? filters.availableFrom : filters.availableTo,
        minDate: mobileDateField === "from" ? today : filters.availableFrom ? nextDay(filters.availableFrom) : nextDay(today),
        dateFromLabel: t.dateFrom,
        dateToLabel: t.dateTo,
        onSelect: handleMobileDateSelect,
        onClose: () => setMobileDateField(null),
        closeLabel: t.closeDatePicker
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "sb-filterbar", children: [
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
      /* @__PURE__ */ jsx("div", { className: "sb-filterbar__row sb-filterbar__row--utilities", children: /* @__PURE__ */ jsxs("div", { className: "sb-filterbar__actions", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-filterbar__sort", onClick: cycleSort, children: [
          /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "9", y2: "6" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "7", y2: "12" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "5", y2: "18" }),
            /* @__PURE__ */ jsx("path", { d: "M17 4v16m0 0-4-4m4 4 4-4" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: filters.sort !== "default" ? "sb-filterbar__sort-active" : "", children: sortLabel })
        ] }),
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
      ] }) })
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
function vehicleModelHref(v, locale) {
  const slug = v.vehicle_model?.slug;
  if (!slug) return void 0;
  return `/${locale}/${v.vehicle_type === "motorcycle" ? "bikes" : "cars"}/${slug}`;
}
var UNIT_WORDS = {
  car: { ru: ["\u043C\u0430\u0448\u0438\u043D\u0430", "\u043C\u0430\u0448\u0438\u043D\u044B", "\u043C\u0430\u0448\u0438\u043D"], en: ["car", "cars"] },
  motorcycle: { ru: ["\u0431\u0430\u0439\u043A", "\u0431\u0430\u0439\u043A\u0430", "\u0431\u0430\u0439\u043A\u043E\u0432"], en: ["bike", "bikes"] }
};
function pluralUnits(n, kind, lang) {
  const words = UNIT_WORDS[kind === "motorcycle" ? "motorcycle" : "car"];
  if (lang === "en") return `${n} ${n === 1 ? words.en[0] : words.en[1]}`;
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  const word = a === 1 && b !== 11 ? words.ru[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? words.ru[1] : words.ru[2];
  return `${n} ${word}`;
}
var STRINGS3 = {
  ru: {
    all: "\u0412\u0441\u0435",
    from: "\u043E\u0442",
    perDayUnit: "\u0E3F/\u0434\u0435\u043D\u044C",
    perDay: "\u0432 \u0441\u0443\u0442\u043A\u0438",
    days: (n) => pluralDays(n, "ru"),
    book: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
    share: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F",
    linkCopied: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430",
    busy: "\u0437\u0430\u043D\u044F\u0442\u043E",
    freeFrom: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E \u0441",
    onRequest: "\u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
    available: "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E",
    units: (n, kind = "car") => pluralUnits(n, kind, "ru"),
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
    dateFrom: "\u041D\u0430\u0447\u0430\u043B\u043E",
    dateTo: "\u041E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u0435",
    availabilityTitle: "\u0414\u0430\u0442\u044B \u0430\u0440\u0435\u043D\u0434\u044B",
    availabilityPrompt: "\u0411\u0435\u0437 \u0434\u0430\u0442 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u043D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
    availabilityReady: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u0430 \u043D\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434",
    availabilityAction: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435",
    availabilityActionPending: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u044B",
    editDates: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
    doneDates: "\u0413\u043E\u0442\u043E\u0432\u043E",
    closeDatePicker: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C",
    availableOnly: "\u0422\u043E\u043B\u044C\u043A\u043E \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435",
    availableToday: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
    availableSelected: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E",
    clearFilters: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B"
  },
  en: {
    all: "All",
    from: "from",
    perDayUnit: "\u0E3F/day",
    perDay: "per day",
    days: (n) => pluralDays(n, "en"),
    book: "Book",
    share: "Share",
    linkCopied: "Link copied",
    busy: "busy",
    freeFrom: "free from",
    onRequest: "on request",
    available: "available",
    units: (n, kind = "car") => pluralUnits(n, kind, "en"),
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
    dateFrom: "Start date",
    dateTo: "End date",
    availabilityTitle: "Rental dates",
    availabilityPrompt: "Without dates, availability is shown for today",
    availabilityReady: "Availability is calculated for your dates",
    availabilityAction: "Show available",
    availabilityActionPending: "Choose dates",
    editDates: "Change",
    doneDates: "Done",
    closeDatePicker: "Close calendar",
    availableOnly: "Available only",
    availableToday: "Available today",
    availableSelected: "Available",
    clearFilters: "Clear filters"
  }
};
function buildFilteredVehiclesUrl(apiBase, f) {
  const qs = new URLSearchParams();
  if (f.vehicleType) qs.set("vehicle_type", f.vehicleType);
  if (f.category) qs.set("category", f.category);
  if (f.search) qs.set("search", f.search);
  if (f.availableFrom && f.availableTo) {
    qs.set("available_from", f.availableFrom);
    qs.set("available_to", f.availableTo);
  }
  const s = qs.toString();
  return `${apiBase}/api/v1/catalog/vehicles/${s ? `?${s}` : ""}`;
}
function vehicleGroupKey(v) {
  return `${v.brand}:${v.model}:${v.year ?? ""}:${v.color ?? ""}`;
}
function pickRepresentative(group) {
  const available = group.filter((v) => v.is_available);
  if (available.length === 0) {
    const withDate = group.filter((v) => v.free_from);
    const candidates = withDate.length > 0 ? withDate : group;
    return candidates.reduce((a, b) => {
      if (a.free_from !== b.free_from) return (a.free_from ?? "9999") <= (b.free_from ?? "9999") ? a : b;
      return (a.min_price_per_day ?? Infinity) <= (b.min_price_per_day ?? Infinity) ? a : b;
    });
  }
  const withPrice = available.filter((v) => v.min_price_per_day !== null);
  return withPrice.length > 0 ? withPrice.reduce((a, b) => (a.min_price_per_day ?? 0) <= (b.min_price_per_day ?? 0) ? a : b) : available[0];
}
function groupVehicles(vehicles, keyFn = vehicleGroupKey) {
  const groups = /* @__PURE__ */ new Map();
  for (const v of vehicles) {
    const key = keyFn(v);
    const existing = groups.get(key);
    if (existing) existing.push(v);
    else groups.set(key, [v]);
  }
  return Array.from(groups.values()).map((group) => {
    const availableCount = group.filter((v) => v.is_available).length;
    const representative = pickRepresentative(group);
    return {
      vehicle: {
        ...representative,
        is_available: availableCount > 0,
        free_from: availableCount > 0 ? null : representative.free_from
      },
      units: group,
      total: group.length,
      availableCount
    };
  });
}
function orderCatalogCards(cards) {
  const price = (c) => c.vehicle.min_price_per_day ?? Infinity;
  return cards.map((c, i) => ({ c, i })).sort((a, b) => {
    const free = Number(b.c.availableCount > 0) - Number(a.c.availableCount > 0);
    if (free !== 0) return free;
    const pa = price(a.c);
    const pb = price(b.c);
    if (pa !== pb) return pa < pb ? -1 : 1;
    return a.i - b.i;
  }).map(({ c }) => c);
}
function defaultActiveCat(catList, vehList, defaultCategory) {
  const want = (defaultCategory ?? "").trim().toLowerCase();
  if (!want) return null;
  const usedIds = new Set(vehList.map((v) => v.category?.id).filter(Boolean));
  const def = catList.find((c) => usedIds.has(c.id) && c.name.trim().toLowerCase() === want);
  return def ? def.id : null;
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
  onTelegramLink,
  puck
}) {
  const locale = localeProp ?? (puck?.metadata?.locale === "en" ? "en" : "ru");
  const t = STRINGS3[locale];
  const preload = !showFilters ? puck?.metadata?.catalogPreload : void 0;
  const preloadedVehicles = preload?.vehicles?.[vehicleType];
  const hasPreload = Array.isArray(preloadedVehicles);
  const [categories, setCategories] = useState(preload?.categories ?? []);
  const [vehicles, setVehicles] = useState(preloadedVehicles ?? []);
  const [activeCat, setActiveCat] = useState(
    () => hasPreload ? defaultActiveCat(preload?.categories ?? [], preloadedVehicles ?? [], defaultCategory) : null
  );
  const [state, setState] = useState(hasPreload ? "ready" : "loading");
  const [selected, setSelected] = useState(null);
  const preloadedRef = useRef(hasPreload);
  const freshDataRef = useRef(false);
  const [filters, setFilters] = useState(defaultFilterState);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const hasCompleteDateRange = Boolean(filters.availableFrom && filters.availableTo);
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
  const vehiclesUrl = showFilters ? buildFilteredVehiclesUrl(apiBase, debouncedFilters) : `${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`;
  useEffect(() => {
    let cancelled = false;
    const refreshingPreload = preloadedRef.current && !freshDataRef.current;
    if (!refreshingPreload) {
      setState("loading");
      setActiveCat(null);
    }
    const headers = { "ngrok-skip-browser-warning": "true" };
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
      freshDataRef.current = true;
      const catList = Array.isArray(cats) ? cats : [];
      const vehList = Array.isArray(list) ? list : [];
      setCategories(catList);
      setVehicles(vehList);
      if (!showFilters) {
        if (refreshingPreload) {
          const usedIds = new Set(vehList.map((v) => v.category?.id).filter(Boolean));
          setActiveCat((cur) => cur && !usedIds.has(cur) ? null : cur);
          setSelected((cur) => cur ? vehList.find((v) => v.id === cur.id) ?? cur : cur);
        } else {
          setActiveCat(defaultActiveCat(catList, vehList, defaultCategory));
        }
      }
      setState("ready");
    }).catch(() => {
      if (cancelled) return;
      if (refreshingPreload) {
        console.warn("VehicleCatalog: background catalog refresh failed; showing preloaded data");
        return;
      }
      setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, defaultCategory, showFilters, vehiclesUrl]);
  const didDeepLink = useRef(false);
  useEffect(() => {
    if (didDeepLink.current || state !== "ready") return;
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("vehicle");
    if (!id) {
      didDeepLink.current = true;
      return;
    }
    const match = vehicles.find((v) => v.id === id);
    if (!match) {
      if (!freshDataRef.current) return;
      didDeepLink.current = true;
      return;
    }
    didDeepLink.current = true;
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
    if (!showFilters) return orderCatalogCards(groups);
    const availableOnly = filters.availableOnly && filters.availableFrom && filters.availableTo;
    const filtered = availableOnly ? groups.filter((group) => group.availableCount > 0) : groups;
    const regularOrder = filters.sort === "default" ? filtered : [...filtered].sort((a, b) => {
      const pa = a.vehicle.min_price_per_day ?? Infinity;
      const pb = b.vehicle.min_price_per_day ?? Infinity;
      const dir = filters.sort === "price_asc" ? 1 : -1;
      return (pa - pb) * dir;
    });
    if (availableOnly) return regularOrder;
    return [...regularOrder].sort((a, b) => Number(b.availableCount > 0) - Number(a.availableCount > 0));
  }, [groups, showFilters, filters.availableOnly, filters.availableFrom, filters.availableTo, filters.sort]);
  const selectedUnitIds = useMemo(() => {
    if (!selected) return void 0;
    const key = vehicleGroupKey(selected);
    const rest = vehicles.filter((v) => vehicleGroupKey(v) === key && v.id !== selected.id).map((v, i) => ({ v, i })).sort((a, b) => (a.v.min_price_per_day ?? Infinity) - (b.v.min_price_per_day ?? Infinity) || a.i - b.i).map(({ v }) => v.id);
    return [selected.id, ...rest];
  }, [selected, vehicles]);
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
    state === "ready" && (displayGroups.length === 0 ? /* @__PURE__ */ jsx("p", { className: "sb-vcatalog__state", children: t.empty }) : /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__grid", children: displayGroups.map((g) => /* @__PURE__ */ jsx(
      VehicleCard,
      {
        vehicle: g.vehicle,
        total: g.total,
        availableCount: g.availableCount,
        categoryName: g.vehicle.category && (showFilters || activeCat === null) ? categoryLabel(g.vehicle.category, locale) : null,
        hasCompleteDateRange,
        locale,
        strings: t,
        referralCode,
        onOpen: () => setSelected(g.vehicle),
        href: showFilters ? void 0 : vehicleModelHref(g.vehicle, locale)
      },
      g.vehicle.id
    )) })),
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
        onTelegramLink,
        initialFrom: filters.availableFrom,
        initialTo: filters.availableTo,
        unitIds: selectedUnitIds,
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
      if (!res.ok) {
        const detail = await res.json().then((body2) => body2?.detail).catch(() => void 0);
        throw new Error(detail || "");
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B");
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
      // .svg убран из подписи 2026-07-30 вместе с самим форматом: загрузка
      // картинок сайта принимает JPEG/PNG/WebP/HEIC/ICO (решение владельца —
      // SVG это исполняемая разметка). Уже стоящие svg-файлы работают дальше.
      favicon: imageField("Favicon (\u0438\u043A\u043E\u043D\u043A\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u2014 .png / .ico)")
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
        mobileVideoHevc: { type: "text", label: "\u0412\u0438\u0434\u0435\u043E \u0434\u043B\u044F \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u2014 HEVC (\u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0435)" },
        mobileVideo: { type: "text", label: "\u0412\u0438\u0434\u0435\u043E \u0434\u043B\u044F \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u2014 H.264 (\u0437\u0430\u043F\u0430\u0441\u043D\u043E\u0435)" },
        mobileVideoPoster: imageField("\u0417\u0430\u0441\u0442\u0430\u0432\u043A\u0430 \u0432\u0438\u0434\u0435\u043E (\u043A\u0430\u0434\u0440 \u0438\u0437 \u0432\u0438\u0434\u0435\u043E)"),
        ctaLabel: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0442\u0435\u043A\u0441\u0442" },
        ctaHref: { type: "text", label: "\u041A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430" },
        secondaryLabel: { type: "text", label: "\u0412\u0442\u043E\u0440\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0442\u0435\u043A\u0441\u0442 (\u043F\u0443\u0441\u0442\u043E \u2014 \u043D\u0435\u0442 \u043A\u043D\u043E\u043F\u043A\u0438)" },
        secondaryHref: { type: "text", label: "\u0412\u0442\u043E\u0440\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430 (\u043D\u0430\u043F\u0440. #car \u2014 \u043A \xAB\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F\u043C\xBB)" }
      },
      defaultProps: {
        heading: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439 \u0438 \u0431\u0430\u0439\u043A\u043E\u0432 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        accentWord: "\u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        subheading: "\u0421\u0432\u043E\u0431\u043E\u0434\u0430 \u043F\u0435\u0440\u0435\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0443 \u2014 \u0432\u0430\u0448 \u043A\u043B\u044E\u0447 \u043A \u043D\u0435\u0437\u0430\u0431\u044B\u0432\u0430\u0435\u043C\u044B\u043C \u043F\u0440\u0438\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F\u043C",
        backgroundImage: "",
        mobileVideoHevc: "",
        mobileVideo: "",
        mobileVideoPoster: "",
        ctaLabel: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        ctaHref: "#leadform",
        secondaryLabel: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433",
        secondaryHref: "#car"
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

// src/pages/model.ts
var trimKey = (trim) => (trim ?? "").trim().toLowerCase();
function buildVersions(units) {
  const groups = /* @__PURE__ */ new Map();
  for (const u of units) {
    const key = trimKey(u.trim);
    const list = groups.get(key);
    if (list) list.push(u);
    else groups.set(key, [u]);
  }
  return Array.from(groups.entries()).map(([key, list]) => {
    const unit = pickRepresentative(list);
    return {
      key,
      trim: (unit.trim ?? "").trim(),
      units: list,
      unit,
      availableCount: list.filter((u) => u.is_available).length
    };
  }).sort((a, b) => {
    if (!a.key !== !b.key) return a.key ? 1 : -1;
    return a.trim.localeCompare(b.trim);
  });
}
function defaultVersion(versions) {
  if (versions.length === 0) return null;
  const best = pickRepresentative(versions.map((v) => v.unit));
  return versions.find((v) => v.unit === best) ?? versions[0];
}
function formatLongDate(iso, locale) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  });
}
function trimLabel(trim, baseLabel) {
  return trim.trim() || baseLabel;
}
function seatsOf(u) {
  const n = typeof u.seats === "number" ? u.seats : u.seats ? Number(u.seats) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}
function versionSubtitle(version, versions, seatsCount) {
  const seats = new Set(versions.map((v) => seatsOf(v.unit)));
  const own = seatsOf(version.unit);
  if (seats.size > 1 && own !== null) return seatsCount(own);
  return version.unit.year ? String(version.unit.year) : "";
}
function priceFromMinDays(unit, today, model) {
  const cp = unit.card_prices;
  if (!cp) return null;
  const want = Math.round(parseFloat(cp.per_day_min) * 100);
  const periods = unit.pricing_periods ?? [];
  const seasons = unit.pricing_seasons ?? [];
  const season = seasons.find((s) => isCurrentSeason(s, today)) ?? seasons[0];
  if (season) {
    const matching = season.prices.flatMap(
      (p, i) => p !== null && p !== void 0 && periods[i] && Math.round(Number(p) * 100) === want ? [periods[i].min_days] : []
    );
    if (matching.length > 0) return Math.min(...matching);
  }
  if (model?.price_from_per_day && Math.round(parseFloat(model.price_from_per_day) * 100) === want) {
    return model.price_from_min_days;
  }
  return null;
}
function versionPrice(unit, today, model) {
  const cp = unit.card_prices;
  if (cp) {
    const from = formatBahtCeil(cp.per_day_min);
    const max = formatBahtCeil(cp.per_day_max);
    return { from, maxDay: max !== from ? max : null, minDays: priceFromMinDays(unit, today, model) };
  }
  if (unit.min_price_per_day !== null && unit.min_price_per_day !== void 0) {
    return { from: formatBahtCeil(unit.min_price_per_day), maxDay: null, minDays: null };
  }
  return { from: null, maxDay: null, minDays: null };
}
var ModelPageContext = createContext(null);
function useModelPage() {
  return useContext(ModelPageContext);
}
function ModelPageProvider({ model, locale, booking, today, children }) {
  const versions = useMemo(() => buildVersions(model.units), [model.units]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [open, setOpen] = useState(false);
  const day = today ?? todayISO();
  const selected = useMemo(
    () => versions.find((v) => v.key === selectedKey) ?? defaultVersion(versions),
    [versions, selectedKey]
  );
  const select = useCallback((key) => setSelectedKey(key), []);
  const openBooking = useCallback(() => setOpen(true), []);
  const value = useMemo(
    () => ({ model, locale, today: day, versions, selected, select, openBooking }),
    [model, locale, day, versions, selected, select, openBooking]
  );
  return /* @__PURE__ */ jsxs(ModelPageContext.Provider, { value, children: [
    children,
    open && selected ? /* @__PURE__ */ jsx(
      VehicleBookingModal,
      {
        ...booking,
        vehicle: selected.unit,
        unitIds: selected.units.map((u) => u.id),
        locale,
        initialStep: "booking",
        onClose: () => setOpen(false)
      }
    ) : null
  ] });
}

// src/pages/strings.ts
function fromDaysRu(n) {
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  return `${n} ${a === 1 && b !== 11 ? "\u0434\u043D\u044F" : "\u0434\u043D\u0435\u0439"}`;
}
function pluralRu(n, one, few, many) {
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  const word = a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  return `${n} ${word}`;
}
var PAGE_STRINGS = {
  ru: {
    rentInPhuket: "\u0430\u0440\u0435\u043D\u0434\u0430 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435",
    baseTrim: "\u0411\u0430\u0437\u043E\u0432\u0430\u044F",
    trims: "\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u0438",
    seatsCount: (n) => pluralRu(n, "\u043C\u0435\u0441\u0442\u043E", "\u043C\u0435\u0441\u0442\u0430", "\u043C\u0435\u0441\u0442"),
    from: "\u043E\u0442",
    perDay: "/ \u0441\u0443\u0442\u043A\u0438",
    priceNote: (minDays, maxDay) => [
      minDays && minDays > 1 ? `\u043F\u0440\u0438 \u0430\u0440\u0435\u043D\u0434\u0435 \u043E\u0442 ${fromDaysRu(minDays)}` : null,
      maxDay ? `\u0437\u0430 1 \u0434\u0435\u043D\u044C \u2014 ${maxDay}\xA0\u0E3F` : null
    ].filter(Boolean).join(" \xB7 "),
    onRequest: "\u0426\u0435\u043D\u0430 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
    days: (n) => pluralDays(n, "ru"),
    deposit: "\u0414\u0435\u043F\u043E\u0437\u0438\u0442",
    or: "\u0438\u043B\u0438",
    book: "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
    ask: "\u0417\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441",
    trust: ["\u041F\u043E\u0434\u0430\u0447\u0430 \u0437\u0430 2 \u0447\u0430\u0441\u0430", "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0434\u043E\u0433\u043E\u0432\u043E\u0440", "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C"],
    statusFree: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430 \u0441\u0435\u0439\u0447\u0430\u0441",
    statusFreesOn: (date) => `\u041E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u0441\u044F ${date}`,
    gallery: "\u0424\u043E\u0442\u043E",
    prevPhoto: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0435 \u0444\u043E\u0442\u043E",
    nextPhoto: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u0444\u043E\u0442\u043E",
    photoN: (n) => `\u0424\u043E\u0442\u043E ${n}`,
    breadcrumbs: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0446\u0435\u043F\u043E\u0447\u043A\u0430",
    about: "\u041E \u043C\u043E\u0434\u0435\u043B\u0438",
    keyFacts: "\u0413\u043B\u0430\u0432\u043D\u043E\u0435",
    factRangeEv: "\u043D\u0430 \u043E\u0434\u043D\u043E\u043C \u0437\u0430\u0440\u044F\u0434\u0435",
    factRange: "\u0437\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430",
    factConsumption: "\u0440\u0430\u0441\u0445\u043E\u0434",
    factPower: "\u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C",
    factSprint: "\u0434\u043E 100 \u043A\u043C/\u0447",
    factSeats: "\u043C\u0435\u0441\u0442 \u0432 \u0441\u0430\u043B\u043E\u043D\u0435",
    specs: "\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438",
    groupEngine: "\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C \u0438 \u0437\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430",
    groupDynamics: "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430",
    groupBody: "\u041A\u0443\u0437\u043E\u0432 \u0438 \u0441\u0430\u043B\u043E\u043D",
    seatsRow: "\u041C\u0435\u0441\u0442",
    perDayRow: "\u0412 \u0441\u0443\u0442\u043A\u0438",
    monthRow: "30 \u0434\u043D\u0435\u0439",
    freeRow: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430",
    freeNow: "\u0441\u0435\u0439\u0447\u0430\u0441",
    freeFrom: (date) => `\u0441 ${date}`,
    busy: "\u0437\u0430\u043D\u044F\u0442\u0430",
    choose: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C",
    chosen: "\u0412\u044B\u0431\u0440\u0430\u043D\u0430",
    modelsCount: (n) => pluralRu(n, "\u043C\u043E\u0434\u0435\u043B\u044C", "\u043C\u043E\u0434\u0435\u043B\u0438", "\u043C\u043E\u0434\u0435\u043B\u0435\u0439"),
    statsPrice: (minDays) => `/ \u0441\u0443\u0442\u043A\u0438${minDays && minDays > 1 ? ` \u043F\u0440\u0438 \u0430\u0440\u0435\u043D\u0434\u0435 \u043E\u0442 ${fromDaysRu(minDays)}` : ""}`,
    statsFree: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430" : "\u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B"} \u0441\u0435\u0433\u043E\u0434\u043D\u044F`,
    categories: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438"
  },
  en: {
    rentInPhuket: "rental in Phuket",
    baseTrim: "Standard",
    trims: "Trims",
    seatsCount: (n) => `${n} ${n === 1 ? "seat" : "seats"}`,
    from: "from",
    perDay: "/ day",
    priceNote: (minDays, maxDay) => [
      minDays && minDays > 1 ? `for rentals of ${minDays}+ days` : null,
      maxDay ? `1 day \u2014 ${maxDay}\xA0\u0E3F` : null
    ].filter(Boolean).join(" \xB7 "),
    onRequest: "Price on request",
    days: (n) => pluralDays(n, "en"),
    deposit: "Deposit",
    or: "or",
    book: "Book",
    ask: "Ask a question",
    trust: ["Delivery in 2 hours", "Official rental contract", "Support in Russian and English"],
    statusFree: "Available now",
    statusFreesOn: (date) => `Free from ${date}`,
    gallery: "Photos",
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    photoN: (n) => `Photo ${n}`,
    breadcrumbs: "Breadcrumbs",
    about: "About the model",
    keyFacts: "Key facts",
    factRangeEv: "on one charge",
    factRange: "range",
    factConsumption: "consumption",
    factPower: "power",
    factSprint: "0\u2013100 km/h",
    factSeats: "seats",
    specs: "Specifications",
    groupEngine: "Engine and range",
    groupDynamics: "Performance",
    groupBody: "Body and interior",
    seatsRow: "Seats",
    perDayRow: "Per day",
    monthRow: "30 days",
    freeRow: "Available",
    freeNow: "now",
    freeFrom: (date) => `from ${date}`,
    busy: "booked",
    choose: "Choose",
    chosen: "Chosen",
    modelsCount: (n) => `${n} ${n === 1 ? "model" : "models"}`,
    statsPrice: (minDays) => `/ day${minDays && minDays > 1 ? ` for rentals of ${minDays}+ days` : ""}`,
    statsFree: (n) => `${n} available today`,
    categories: "Categories"
  }
};
function Breadcrumbs({ crumbs, locale }) {
  if (crumbs.length === 0) return null;
  return /* @__PURE__ */ jsx("nav", { className: "sb-mp-crumbs", "aria-label": PAGE_STRINGS[locale].breadcrumbs, children: crumbs.map((c, i) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
    i > 0 ? /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "/" }) : null,
    c.href ? /* @__PURE__ */ jsx("a", { href: c.href, children: c.label }) : /* @__PURE__ */ jsx("b", { "aria-current": "page", children: c.label })
  ] }, `${i}-${c.label}`)) });
}
function Svg({ children, className = "sb-mp-ic" }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children
    }
  );
}
var PATHS = {
  chevronLeft: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }),
  chevronRight: /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }),
  calendar: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })
  ] }),
  shield: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
    /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
  ] }),
  route: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "6", cy: "19", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" })
  ] }),
  gauge: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 14l4-4" }),
    /* @__PURE__ */ jsx("path", { d: "M3.34 19a10 10 0 1 1 17.32 0" })
  ] }),
  timer: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "14", r: "8" }),
    /* @__PURE__ */ jsx("path", { d: "M12 10v4l2 2M10 2h4" })
  ] }),
  users: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  engine: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "M4 10h2V8h4V6h4v2h3l2 3h2v5h-2l-2 3H8l-2-3H4z" }) }),
  battery: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "2", y: "7", width: "18", height: "10", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M22 11v2M6 11v2M10 11v2" })
  ] }),
  fuel: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M3 22h12M3 10h12" }),
    /* @__PURE__ */ jsx("path", { d: "M15 13h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3" })
  ] }),
  gearbox: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "5", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "19", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "5", cy: "18", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "18", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8v8M12 8v8M19 8v4H5" })
  ] }),
  drive: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "6", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "18", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M8 6h8M8 18h8M12 6v12" })
  ] }),
  speed: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "M5 12h14M13 6l6 6-6 6" }) }),
  car: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M5 17H3v-5l2-5h14l2 5v5h-2" }),
    /* @__PURE__ */ jsx("path", { d: "M3 12h18" }),
    /* @__PURE__ */ jsx("circle", { cx: "7.5", cy: "17", r: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "16.5", cy: "17", r: "2" })
  ] }),
  height: /* @__PURE__ */ jsx("path", { d: "M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" }),
  weight: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M6 8h12l2 13H4z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "3" })
  ] }),
  bolt: /* @__PURE__ */ jsx("path", { d: "M13 2 3 14h9l-1 8 10-12h-9z" }),
  check: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }),
  truck: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 6h11v10H3zM14 9h4l3 3v4h-7" }),
    /* @__PURE__ */ jsx("circle", { cx: "7", cy: "17.5", r: "1.8" }),
    /* @__PURE__ */ jsx("circle", { cx: "17", cy: "17.5", r: "1.8" })
  ] }),
  contract: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v6h6M8 13h8M8 17h5" })
  ] }),
  chat: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }),
  tag: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" }),
    /* @__PURE__ */ jsx("circle", { cx: "7", cy: "7", r: "1.5" })
  ] })
};
function PageIcon({ name, className }) {
  return /* @__PURE__ */ jsx(Svg, { className, children: PATHS[name] });
}
function IconBadge({ name }) {
  return /* @__PURE__ */ jsx("span", { className: "sb-mp-badge", "aria-hidden": "true", children: /* @__PURE__ */ jsx(PageIcon, { name }) });
}
var MODEL_HERO_ID = "sb-model-hero";
var TRUST_ICONS = ["truck", "contract", "chat"];
function slidesOf(unit) {
  const imgs = [...unit.gallery_images ?? []].sort((a, b) => a.position - b.position);
  const slides = imgs.map((g) => {
    const src = g.display_url ?? g.image_url;
    return src ? { src, thumb: g.thumb_url ?? src } : null;
  }).filter((s) => s !== null);
  if (slides.length === 0 && unit.photo_url) slides.push({ src: unit.photo_url, thumb: unit.photo_url });
  return slides;
}
function Gallery({ unit, alt, locale }) {
  const t = PAGE_STRINGS[locale];
  const slides = useMemo(() => slidesOf(unit), [unit]);
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const current = slides[Math.min(index, Math.max(0, n - 1))];
  const go = (step) => setIndex((i) => (i + step + n) % n);
  return /* @__PURE__ */ jsxs("div", { className: "sb-mp-gal", "aria-label": t.gallery, children: [
    /* @__PURE__ */ jsxs("div", { className: "sb-mp-gal__main", children: [
      current ? /* @__PURE__ */ jsx(
        "img",
        {
          src: current.src,
          alt,
          ...index === 0 ? { fetchPriority: "high" } : { loading: "lazy" }
        },
        current.src
      ) : null,
      n > 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "sb-mp-gal__nav sb-mp-gal__nav--prev", "aria-label": t.prevPhoto, onClick: () => go(-1), children: /* @__PURE__ */ jsx(PageIcon, { name: "chevronLeft" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "sb-mp-gal__nav sb-mp-gal__nav--next", "aria-label": t.nextPhoto, onClick: () => go(1), children: /* @__PURE__ */ jsx(PageIcon, { name: "chevronRight" }) }),
        /* @__PURE__ */ jsx("span", { className: "sb-mp-gal__count", children: `${index + 1} / ${n}` })
      ] }) : null
    ] }),
    n > 1 ? /* @__PURE__ */ jsx("div", { className: "sb-mp-gal__thumbs", children: slides.map((s, i) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `sb-mp-thumb${i === index ? " is-on" : ""}`,
        "aria-label": t.photoN(i + 1),
        "aria-pressed": i === index,
        onClick: () => setIndex(i),
        children: /* @__PURE__ */ jsx("img", { src: s.thumb, alt: "", loading: "lazy" })
      },
      s.src
    )) }) : null
  ] });
}
function Deposit({ unit, locale }) {
  const t = PAGE_STRINGS[locale];
  const list = [...unit.deposits ?? []].filter((d) => formatMoney(d.amount)).sort((a, b) => Number(b.currency_code === "THB") - Number(a.currency_code === "THB"));
  if (list.length === 0) return null;
  const sum = (d) => `${formatMoney(d.amount)}\xA0${d.currency_code === "THB" ? "\u0E3F" : d.currency_code}`;
  const [first, ...rest] = list;
  return /* @__PURE__ */ jsxs("p", { className: "sb-mp-deposit", children: [
    /* @__PURE__ */ jsx(PageIcon, { name: "shield" }),
    /* @__PURE__ */ jsx("span", { children: t.deposit }),
    /* @__PURE__ */ jsx("b", { children: sum(first) }),
    rest.length > 0 ? /* @__PURE__ */ jsx("i", { children: `${t.or} ${rest.map(sum).join(" \xB7 ")}` }) : null
  ] });
}
function ModelHero({ crumbs = [], telegramUrl, whatsappUrl }) {
  const page = useModelPage();
  if (!page || !page.selected) return null;
  const { model, locale, today, versions, selected, select, openBooking } = page;
  const t = PAGE_STRINGS[locale];
  const c = STRINGS3[locale];
  const unit = selected.unit;
  const rows = buildSpecRows(unit, locale);
  const tags = [
    model.category ? categoryLabel(model.category, locale) : null,
    rows.find((r) => r.key === "fuel")?.value ?? null,
    rows.find((r) => r.key === "body")?.value ?? null
  ].filter((x) => Boolean(x));
  const price = versionPrice(unit, today, model);
  const note = price.from ? t.priceNote(price.minDays, price.maxDay) : "";
  const available = selected.availableCount > 0;
  const statusText = available ? t.statusFree : unit.free_from ? t.statusFreesOn(formatLongDate(unit.free_from, locale)) : c.busy;
  const statusMod = available ? "" : unit.free_from ? " sb-mp-status--soon" : " sb-mp-status--busy";
  const quotes = unit.card_prices?.quotes ?? [];
  const discount = Math.round(unit.card_prices?.month_discount_pct ?? 0);
  return /* @__PURE__ */ jsx("section", { className: "sb-section sb-mp-hero", id: MODEL_HERO_ID, children: /* @__PURE__ */ jsxs("div", { className: "sb-container", children: [
    /* @__PURE__ */ jsx(Breadcrumbs, { crumbs, locale }),
    /* @__PURE__ */ jsxs("div", { className: "sb-mp-hero__grid", children: [
      /* @__PURE__ */ jsx("div", { className: "sb-mp-hero__media", children: /* @__PURE__ */ jsx(Gallery, { unit, alt: model.label, locale }, unit.id) }),
      /* @__PURE__ */ jsxs("div", { className: "sb-mp-book", children: [
        tags.length > 0 ? /* @__PURE__ */ jsx("p", { className: "sb-mp-book__tags", children: tags.map((tag) => /* @__PURE__ */ jsx("span", { children: tag }, tag)) }) : null,
        /* @__PURE__ */ jsxs("h1", { className: "sb-mp-title", children: [
          model.label,
          " ",
          /* @__PURE__ */ jsx("small", { children: t.rentInPhuket })
        ] }),
        versions.length > 1 ? /* @__PURE__ */ jsx("div", { className: "sb-mp-seg", style: { ["--n"]: versions.length }, role: "group", "aria-label": t.trims, children: versions.map((v) => {
          const sub = versionSubtitle(v, versions, t.seatsCount);
          const on = v.key === selected.key;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: on ? "is-on" : void 0,
              "aria-pressed": on,
              onClick: () => select(v.key),
              children: [
                trimLabel(v.trim, t.baseTrim),
                sub ? /* @__PURE__ */ jsx("i", { children: sub }) : null
              ]
            },
            v.key
          );
        }) }) : null,
        /* @__PURE__ */ jsxs("div", { className: "sb-mp-book__body", children: [
          /* @__PURE__ */ jsxs("div", { className: "sb-mp-price-row", children: [
            price.from ? /* @__PURE__ */ jsxs("p", { className: "sb-mp-price", children: [
              /* @__PURE__ */ jsx("span", { className: "sb-mp-price__from", children: t.from }),
              /* @__PURE__ */ jsx("b", { children: `${price.from}\xA0\u0E3F` }),
              /* @__PURE__ */ jsx("span", { className: "sb-mp-price__unit", children: t.perDay })
            ] }) : /* @__PURE__ */ jsx("p", { className: "sb-mp-price", children: /* @__PURE__ */ jsx("span", { className: "sb-mp-price__from", children: t.onRequest }) }),
            /* @__PURE__ */ jsxs("span", { className: `sb-mp-status${statusMod}`, children: [
              /* @__PURE__ */ jsx("i", { "aria-hidden": "true" }),
              statusText
            ] })
          ] }),
          note ? /* @__PURE__ */ jsx("p", { className: "sb-mp-price__note", children: note }) : null,
          quotes.length > 0 ? /* @__PURE__ */ jsx("div", { className: "sb-mp-tilerow", children: quotes.map((q) => {
            const best = q.days === 30;
            return /* @__PURE__ */ jsxs("div", { className: `sb-mp-tile${best ? " sb-mp-tile--best" : ""}`, children: [
              best && discount > 0 ? /* @__PURE__ */ jsx("em", { children: `\u2212${discount}%` }) : null,
              /* @__PURE__ */ jsx("span", { children: t.days(q.days) }),
              /* @__PURE__ */ jsx("b", { children: `${formatBahtCeil(q.total)}\xA0\u0E3F` })
            ] }, q.days);
          }) }) : null,
          /* @__PURE__ */ jsx(Deposit, { unit, locale })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sb-mp-actions", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-btn sb-mp-cta", onClick: openBooking, children: [
            /* @__PURE__ */ jsx(PageIcon, { name: "calendar" }),
            t.book
          ] }),
          telegramUrl || whatsappUrl ? /* @__PURE__ */ jsxs("div", { className: "sb-mp-ask", children: [
            /* @__PURE__ */ jsx("span", { children: t.ask }),
            telegramUrl ? /* @__PURE__ */ jsxs("a", { className: "sb-mp-btn-ghost", href: telegramUrl, target: "_blank", rel: "noopener noreferrer", children: [
              /* @__PURE__ */ jsx(ContactIcon, { kind: "telegram", className: "sb-mp-ic" }),
              "Telegram"
            ] }) : null,
            whatsappUrl ? /* @__PURE__ */ jsxs("a", { className: "sb-mp-btn-ghost", href: whatsappUrl, target: "_blank", rel: "noopener noreferrer", children: [
              /* @__PURE__ */ jsx(ContactIcon, { kind: "whatsapp", className: "sb-mp-ic" }),
              "WhatsApp"
            ] }) : null
          ] }) : null
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "sb-mp-trust", children: t.trust.map((label, i) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx(IconBadge, { name: TRUST_ICONS[i] }),
          label
        ] }, label)) })
      ] })
    ] })
  ] }) });
}
function splitValue(row) {
  const i = row.value.indexOf("\xA0");
  return i < 0 ? { number: row.value, unit: "" } : { number: row.value.slice(0, i), unit: row.value.slice(i + 1) };
}
function keyFacts(specs, locale) {
  const t = PAGE_STRINGS[locale];
  const rows = buildSpecRows(specs, locale);
  const row = (key) => rows.find((r) => r.key === key);
  const electric = specs.fuel_type === "electric";
  const picks = [
    row("range") ? [row("range"), "route", electric ? t.factRangeEv : t.factRange] : [row("fuel_consumption") ?? row("power_consumption"), "fuel", t.factConsumption],
    [row("power"), "gauge", t.factPower],
    [row("sprint"), "timer", t.factSprint],
    [row("seats"), "users", t.factSeats]
  ];
  return picks.filter((p) => Boolean(p[0])).map(([r, icon, caption]) => ({ key: r.key, icon, caption, ...splitValue(r) }));
}
function ModelOverview({ about, specs, eyebrow, locale: localeProp }) {
  const page = useModelPage();
  const locale = localeProp ?? page?.locale ?? "ru";
  const t = PAGE_STRINGS[locale];
  const source = specs ?? page?.selected?.unit;
  const facts = source ? keyFacts(source, locale) : [];
  const paragraphs = about.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (facts.length === 0 && paragraphs.length === 0) return null;
  const kicker = eyebrow ?? page?.model.label;
  return /* @__PURE__ */ jsx("section", { className: "sb-section sb-mp-sec", children: /* @__PURE__ */ jsxs("div", { className: "sb-container sb-mp-about", children: [
    facts.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "sb-mp-facts", "aria-label": t.keyFacts, children: facts.map((f) => /* @__PURE__ */ jsxs("li", { className: "sb-mp-fact", children: [
      /* @__PURE__ */ jsx(IconBadge, { name: f.icon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("b", { children: [
          f.number,
          f.unit ? /* @__PURE__ */ jsx("small", { children: f.unit }) : null
        ] }),
        /* @__PURE__ */ jsx("span", { children: f.caption })
      ] })
    ] }, f.key)) }) : null,
    paragraphs.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "sb-mp-about__text", children: [
      kicker ? /* @__PURE__ */ jsx("p", { className: "sb-mp-eyebrow", children: kicker }) : null,
      /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: t.about }),
      paragraphs.map((p, i) => /* @__PURE__ */ jsx("p", { className: "sb-mp-text", children: p }, i))
    ] }) : null
  ] }) });
}
var GROUP_OF = {
  engine: "engine",
  battery: "engine",
  fuel: "engine",
  range: "engine",
  tank: "engine",
  fuel_consumption: "engine",
  power_consumption: "engine",
  power: "dynamics",
  transmission: "dynamics",
  drive: "dynamics",
  sprint: "dynamics",
  max_speed: "dynamics",
  body: "body",
  seats: "body",
  clearance: "body",
  weight: "body"
};
var ROW_ICON = {
  engine: "engine",
  battery: "battery",
  fuel: "fuel",
  range: "route",
  tank: "fuel",
  fuel_consumption: "fuel",
  power_consumption: "bolt",
  power: "gauge",
  transmission: "gearbox",
  drive: "drive",
  sprint: "timer",
  max_speed: "speed",
  body: "car",
  seats: "users",
  clearance: "height",
  weight: "weight"
};
var GROUP_ICON = { engine: "engine", dynamics: "timer", body: "car" };
function SpecGroups({ specs, eyebrow, locale: localeProp }) {
  const page = useModelPage();
  const locale = localeProp ?? page?.locale ?? "ru";
  const t = PAGE_STRINGS[locale];
  const source = specs ?? page?.selected?.unit;
  if (!source) return null;
  const rows = buildSpecRows(source, locale);
  const titles = {
    engine: t.groupEngine,
    dynamics: t.groupDynamics,
    body: t.groupBody
  };
  const groups = ["engine", "dynamics", "body"].map((id) => ({ id, rows: rows.filter((r) => GROUP_OF[r.key] === id) })).filter((g) => g.rows.length > 0);
  if (groups.length === 0) return null;
  const kicker = eyebrow ?? page?.model.label;
  return /* @__PURE__ */ jsx("section", { className: "sb-section sb-mp-sec sb-mp-sec--alt", children: /* @__PURE__ */ jsxs("div", { className: "sb-container", children: [
    kicker ? /* @__PURE__ */ jsx("p", { className: "sb-mp-eyebrow", children: kicker }) : null,
    /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: t.specs }),
    /* @__PURE__ */ jsx("div", { className: "sb-mp-specs", children: groups.map((g) => /* @__PURE__ */ jsxs("div", { className: "sb-mp-sgroup", children: [
      /* @__PURE__ */ jsxs("h3", { children: [
        /* @__PURE__ */ jsx(IconBadge, { name: GROUP_ICON[g.id] }),
        titles[g.id]
      ] }),
      /* @__PURE__ */ jsx("ul", { children: g.rows.map((r) => /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(PageIcon, { name: ROW_ICON[r.key] ?? "check" }),
          r.label
        ] }),
        /* @__PURE__ */ jsx("b", { children: r.value })
      ] }, r.key)) })
    ] }, g.id)) })
  ] }) });
}
function seatsValue(v) {
  const s = v.unit.seats;
  return s === null || s === void 0 || s === "" ? null : String(s);
}
function TrimCompare({ eyebrow }) {
  const page = useModelPage();
  if (!page || page.versions.length < 2) return null;
  const { model, locale, versions, selected, select } = page;
  const t = PAGE_STRINGS[locale];
  const kicker = eyebrow ?? model.label;
  const choose = (key) => {
    select(key);
    if (typeof document !== "undefined") {
      document.getElementById(MODEL_HERO_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return /* @__PURE__ */ jsx("section", { className: "sb-section sb-mp-sec", children: /* @__PURE__ */ jsxs("div", { className: "sb-container", children: [
    kicker ? /* @__PURE__ */ jsx("p", { className: "sb-mp-eyebrow", children: kicker }) : null,
    /* @__PURE__ */ jsx("h2", { className: "sb-h2", children: t.trims }),
    /* @__PURE__ */ jsx("div", { className: "sb-mp-cmps", style: { ["--n"]: Math.min(versions.length, 3) }, children: versions.map((v) => {
      const name = trimLabel(v.trim, t.baseTrim);
      const cp = v.unit.card_prices;
      const range = cp ? `${formatBahtCeil(cp.per_day_min)}${cp.per_day_min === cp.per_day_max ? "" : ` \u2013 ${formatBahtCeil(cp.per_day_max)}`}\xA0\u0E3F` : null;
      const month = cp?.quotes.find((q) => q.days === 30);
      const free = v.availableCount > 0 ? t.freeNow : v.unit.free_from ? t.freeFrom(formatCardDate(v.unit.free_from, locale)) : t.busy;
      const seats = seatsValue(v);
      const on = selected?.key === v.key;
      return /* @__PURE__ */ jsxs("article", { className: `sb-mp-cmp${on ? " is-on" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "sb-mp-cmp__ph", children: v.unit.photo_url ? /* @__PURE__ */ jsx("img", { src: v.unit.photo_url, alt: `${model.label} ${name}`, loading: "lazy" }) : null }),
        /* @__PURE__ */ jsxs("div", { className: "sb-mp-cmp__b", children: [
          /* @__PURE__ */ jsx("h3", { children: name }),
          /* @__PURE__ */ jsxs("ul", { children: [
            seats ? /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx(PageIcon, { name: "users" }),
                t.seatsRow
              ] }),
              /* @__PURE__ */ jsx("b", { children: seats })
            ] }) : null,
            range ? /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx(PageIcon, { name: "calendar" }),
                t.perDayRow
              ] }),
              /* @__PURE__ */ jsx("b", { children: range })
            ] }) : null,
            month ? /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx(PageIcon, { name: "timer" }),
                t.monthRow
              ] }),
              /* @__PURE__ */ jsx("b", { children: `${formatBahtCeil(month.total)}\xA0\u0E3F` })
            ] }) : null,
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx(PageIcon, { name: "check" }),
                t.freeRow
              ] }),
              /* @__PURE__ */ jsx("b", { children: free })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "sb-mp-btn-ghost", "aria-pressed": on, onClick: () => choose(v.key), children: on ? t.chosen : t.choose })
        ] })
      ] }, v.key);
    }) })
  ] }) });
}
var modelKey = (v) => v.vehicle_model?.slug ? `m:${v.vehicle_model.slug}` : `g:${vehicleGroupKey(v)}`;
function ModelGrid({
  vehicles,
  locale,
  booking,
  onlySlugs,
  categoryId,
  limit,
  showCategory = true
}) {
  const t = STRINGS3[locale];
  const [open, setOpen] = useState(null);
  const cards = useMemo(() => {
    const slugs = onlySlugs ? new Set(onlySlugs) : null;
    const list = vehicles.filter(
      (v) => (!slugs || v.vehicle_model?.slug && slugs.has(v.vehicle_model.slug)) && (!categoryId || v.category?.id === categoryId)
    );
    const ordered = orderCatalogCards(groupVehicles(list, modelKey));
    return limit !== void 0 ? ordered.slice(0, limit) : ordered;
  }, [vehicles, onlySlugs, categoryId, limit]);
  if (cards.length === 0) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "sb-vcatalog__grid", children: cards.map((c) => /* @__PURE__ */ jsx(
      VehicleCard,
      {
        vehicle: c.vehicle,
        total: c.total,
        availableCount: c.availableCount,
        categoryName: showCategory && c.vehicle.category ? categoryLabel(c.vehicle.category, locale) : null,
        hasCompleteDateRange: false,
        locale,
        strings: t,
        referralCode: booking.referralCode,
        onOpen: () => setOpen(c),
        href: vehicleModelHref(c.vehicle, locale)
      },
      c.vehicle.id
    )) }),
    open ? /* @__PURE__ */ jsx(
      VehicleBookingModal,
      {
        ...booking,
        vehicle: open.vehicle,
        unitIds: open.units.map((u) => u.id),
        locale,
        onClose: () => setOpen(null)
      }
    ) : null
  ] });
}
function cheapest(models) {
  let best = null;
  for (const m of models) {
    if (!m.price_from_per_day) continue;
    if (!best || parseFloat(m.price_from_per_day) < parseFloat(best.price_from_per_day)) best = m;
  }
  return best ? { price: formatBahtCeil(best.price_from_per_day), minDays: best.price_from_min_days } : null;
}
function CategoryHeader({
  locale,
  section,
  h1,
  crumbs = [],
  models,
  sectionModels,
  categories,
  currentSlug
}) {
  const t = PAGE_STRINGS[locale];
  const from = cheapest(models);
  const freeToday = models.filter((m) => m.available_today_count > 0).length;
  const pool = sectionModels ?? models;
  const chips = categories.filter((c) => c.is_published && c.section === section && c.slug).map((c) => ({ c, count: pool.filter((m) => m.category?.id === c.id).length })).filter((x) => x.count > 0);
  return /* @__PURE__ */ jsx("header", { className: "sb-section sb-mc-head", children: /* @__PURE__ */ jsxs("div", { className: "sb-container", children: [
    /* @__PURE__ */ jsx(Breadcrumbs, { crumbs, locale }),
    /* @__PURE__ */ jsx("h1", { className: "sb-mc-h1", children: h1 }),
    /* @__PURE__ */ jsxs("ul", { className: "sb-mc-stats", children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx(PageIcon, { name: "car" }),
        t.modelsCount(models.length)
      ] }),
      from ? /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx(PageIcon, { name: "calendar" }),
        /* @__PURE__ */ jsxs("span", { children: [
          `${t.from} `,
          /* @__PURE__ */ jsx("b", { children: `${from.price}\xA0\u0E3F` }),
          ` ${t.statsPrice(from.minDays)}`
        ] })
      ] }) : null,
      freeToday > 0 ? /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx(PageIcon, { name: "check" }),
        t.statsFree(freeToday)
      ] }) : null
    ] }),
    chips.length > 0 ? /* @__PURE__ */ jsx("nav", { className: "sb-mc-chips", "aria-label": t.categories, children: chips.map(({ c, count }) => {
      const on = c.slug === currentSlug;
      return /* @__PURE__ */ jsxs(
        "a",
        {
          className: `sb-mc-chip${on ? " is-on" : ""}`,
          href: `/${locale}/${section}/${c.slug}`,
          "aria-current": on ? "page" : void 0,
          children: [
            categoryLabel(c, locale),
            /* @__PURE__ */ jsx("i", { children: count })
          ]
        },
        c.id
      );
    }) }) : null
  ] }) });
}
function MobileBookingBar({ telegramUrl }) {
  const page = useModelPage();
  if (!page || !page.selected) return null;
  const { locale, today, model, selected, openBooking } = page;
  const t = PAGE_STRINGS[locale];
  const price = versionPrice(selected.unit, today, model);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "sb-mp-mbar-spacer", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "sb-mp-mbar", children: [
      /* @__PURE__ */ jsx("div", { children: price.from ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("span", { children: [
          t.from,
          " "
        ] }),
        /* @__PURE__ */ jsx("b", { children: `${price.from}\xA0\u0E3F` }),
        /* @__PURE__ */ jsxs("span", { children: [
          " ",
          t.perDay
        ] })
      ] }) : /* @__PURE__ */ jsx("span", { children: t.onRequest }) }),
      telegramUrl ? /* @__PURE__ */ jsx(
        "a",
        {
          className: "sb-mp-mbar__tg",
          href: telegramUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": "Telegram",
          children: /* @__PURE__ */ jsx(ContactIcon, { kind: "telegram", className: "sb-mp-ic" })
        }
      ) : null,
      /* @__PURE__ */ jsxs("button", { type: "button", className: "sb-btn", onClick: openBooking, children: [
        /* @__PURE__ */ jsx(PageIcon, { name: "calendar" }),
        t.book
      ] })
    ] })
  ] });
}

export { AboutPromo, Breadcrumbs, STRINGS3 as CATALOG_STRINGS, CardPriceOverlay, CardTitle, CategoryHeader, ContactIcon, FeatureCards, Footer, Hero, LanguageSwitcher, LeadForm, MODEL_HERO_ID, MapContacts, MobileBookingBar, ModelGrid, ModelHero, ModelOverview, ModelPageProvider, PAGE_STRINGS, PriceGrid, ReviewsCarousel, RichText, SiteHeader, SpecGroups, StatCounters, TermsAccordion, TrimCompare, VehicleBookingModal, VehicleCard, VehicleCatalog, buildSpecRows, buildVersions, categoryLabel, defaultVersion, formatBahtCeil, formatCardDate, formatDayPrice, formatMoney, groupVehicles, isCurrentSeason, orderCatalogCards, periodLabel, pickRepresentative, priceFromMinDays, puckConfig, seasonLabel, trimLabel, useModelPage, vehicleGroupKey, vehicleModelHref, versionPrice, versionSubtitle, withLinkBase };
