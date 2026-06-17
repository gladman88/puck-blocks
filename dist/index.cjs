'use strict';

var jsxRuntime = require('react/jsx-runtime');

// src/blocks/Hero.tsx
function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }) {
  const hasCta = Boolean(ctaLabel && ctaHref);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "section",
    {
      className: "relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center text-white",
      style: backgroundImage ? {
        // Quoted + encoded to prevent CSS injection — this value comes
        // from the editor and is rendered into inline CSS on a public page.
        backgroundImage: `url("${encodeURI(backgroundImage)}")`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      } : { backgroundColor: "#111111" },
      children: [
        backgroundImage ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 bg-black/40", "aria-hidden": "true" }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative z-10 flex max-w-3xl flex-col items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-balance text-4xl font-bold tracking-tight sm:text-5xl", children: heading }),
          subheading ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-balance text-lg opacity-90", children: subheading }) : null,
          hasCta ? /* @__PURE__ */ jsxRuntime.jsx(
            "a",
            {
              href: ctaHref,
              className: "inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90",
              children: ctaLabel
            }
          ) : null
        ] })
      ]
    }
  );
}
function RichText({ content }) {
  const paragraphs = (content ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mx-auto max-w-3xl px-6 py-12", children: paragraphs.map((paragraph, index) => /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mb-4 whitespace-pre-line leading-relaxed last:mb-0", children: paragraph }, index)) });
}
var puckConfig = {
  root: {
    fields: {
      title: { type: "text", label: "SEO title" },
      description: { type: "textarea", label: "SEO description" },
      ogImage: { type: "text", label: "OG image URL" }
    },
    render: ({ children }) => /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children })
  },
  components: {
    Hero: {
      label: "Hero",
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        backgroundImage: { type: "text", label: "Background image URL" },
        ctaLabel: { type: "text", label: "CTA label" },
        ctaHref: { type: "text", label: "CTA link" }
      },
      defaultProps: {
        heading: "Shiba Cars",
        subheading: "Car & motorbike rental in Phuket",
        backgroundImage: "",
        ctaLabel: "",
        ctaHref: ""
      },
      render: Hero
    },
    RichText: {
      label: "Rich text",
      fields: {
        content: { type: "textarea", label: "Content" }
      },
      defaultProps: {
        content: "Your text here."
      },
      render: RichText
    }
  }
};

exports.Hero = Hero;
exports.RichText = RichText;
exports.puckConfig = puckConfig;
