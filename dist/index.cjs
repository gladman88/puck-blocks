'use strict';

var jsxRuntime = require('react/jsx-runtime');

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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "section",
    {
      className: "sb-hero",
      style: bg ? { backgroundImage: `url("${encodeURI(bg)}")` } : void 0,
      children: [
        bg ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sb-hero__overlay", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sb-hero__inner", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "sb-h1", children: heading }),
          subheading ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "sb-lead", children: subheading }) : null,
          hasCta ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sb-hero__cta", children: /* @__PURE__ */ jsxRuntime.jsx("a", { className: "sb-btn", href, children: ctaLabel }) }) : null
        ] })
      ]
    }
  );
}
function RichText({ content }) {
  const paragraphs = (content ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return /* @__PURE__ */ jsxRuntime.jsx("section", { className: "sb-section", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sb-container sb-richtext", children: paragraphs.map((paragraph, index) => /* @__PURE__ */ jsxRuntime.jsx("p", { children: paragraph }, index)) }) });
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
    render: ({ children }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sb-root", children })
  },
  categories: {
    content: { title: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442", components: ["Hero", "RichText"] }
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
        heading: "Shiba Cars",
        subheading: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0430\u0432\u0442\u043E \u0438 \u0431\u0430\u0439\u043A\u043E\u0432 \u043D\u0430 \u041F\u0445\u0443\u043A\u0435\u0442\u0435",
        backgroundImage: "",
        ctaLabel: "",
        ctaHref: ""
      },
      render: Hero
    },
    RichText: {
      label: "\u0422\u0435\u043A\u0441\u0442",
      fields: {
        content: { type: "textarea", label: "\u0422\u0435\u043A\u0441\u0442", contentEditable: true }
      },
      defaultProps: {
        content: "\u0422\u0435\u043A\u0441\u0442\u2026"
      },
      render: RichText
    }
  }
};
var puckConfig = internalConfig;

exports.Hero = Hero;
exports.RichText = RichText;
exports.puckConfig = puckConfig;
