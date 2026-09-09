import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "product";
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
}

const DEFAULT_TITLE = "Manju Group | Sri Lanka's Premier Multi-Brand Group";
const DEFAULT_DESCRIPTION =
  "Manju Group is Sri Lanka's trusted conglomerate offering high-quality DEW Motors electric bikes, DEW Plus smart TVs, commercial RO water purification systems, and inverter ACs with nationwide warranty.";
const DEFAULT_KEYWORDS =
  "Manju Group, Sri Lanka, DEW Motors, electric bikes Sri Lanka, DEW Plus Smart TV, RO water purifier, inverter AC, home appliances Sri Lanka, buy online Sri Lanka";
const DEFAULT_IMAGE = "https://manjugroup.lk/manju-logo-transparent.webp";
const SITE_NAME = "Manju Group Sri Lanka";
const BASE_URL = "https://manjugroup.lk";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  structuredData,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // 1. Document Title
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    );

    // 3. Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "en_US");
    setMeta("property", "og:image", image.startsWith("http") ? image : `${BASE_URL}${image}`);

    const currentUrl = canonical
      ? (canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`)
      : (typeof window !== "undefined" ? window.location.href : BASE_URL);
    setMeta("property", "og:url", currentUrl);

    // 4. Twitter Cards
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `${BASE_URL}${image}`);

    // 5. Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", currentUrl);

    // 6. JSON-LD Structured Data
    const scriptId = "dynamic-json-ld";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup dynamically injected schema if component unmounts
      const dynamicScript = document.getElementById(scriptId);
      if (dynamicScript) dynamicScript.remove();
    };
  }, [title, description, keywords, canonical, image, type, structuredData, noindex]);

  return null;
}
