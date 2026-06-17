import { jsxs, jsx } from 'react/jsx-runtime';

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
  const paragraphs = (content ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
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
    content: { title: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442", components: ["Hero", "AboutPromo", "RichText"] },
    sections: {
      title: "\u0421\u0435\u043A\u0446\u0438\u0438",
      components: ["StatCounters", "FeatureCards", "TermsAccordion", "ReviewsCarousel"]
    }
  },
  components: {
    Hero: {
      label: "Hero",
      fields: {
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A", contentEditable: true },
        subheading: { type: "textarea", label: "\u041F\u043E\u0434\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A", contentEditable: true },
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
        heading: { type: "text", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A", contentEditable: true },
        text: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442", contentEditable: true },
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
        content: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442", contentEditable: true }
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
    }
  }
};
var puckConfig = internalConfig;

export { AboutPromo, FeatureCards, Hero, ReviewsCarousel, RichText, StatCounters, TermsAccordion, puckConfig };
