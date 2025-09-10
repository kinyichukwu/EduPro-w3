import { useEffect } from "react";

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: string;
  twitterSite?: string;
  author?: string;
  canonical?: string;
}

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    // Update document title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (
      property: string,
      content: string,
      useProperty = false
    ) => {
      if (!content) return;

      const selector = useProperty
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement;

      if (!tag) {
        tag = document.createElement("meta");
        if (useProperty) {
          tag.setAttribute("property", property);
        } else {
          tag.setAttribute("name", property);
        }
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      if (!href) return;

      let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

      if (!tag) {
        tag = document.createElement("link");
        tag.setAttribute("rel", rel);
        document.head.appendChild(tag);
      }

      tag.setAttribute("href", href);
    };

    // Basic meta tags
    updateMetaTag("description", seoData.description || "");
    updateMetaTag("keywords", seoData.keywords || "");
    updateMetaTag("author", seoData.author || "");

    // Open Graph tags
    updateMetaTag("og:title", seoData.title || "", true);
    updateMetaTag("og:description", seoData.description || "", true);
    updateMetaTag("og:image", seoData.image || "", true);
    updateMetaTag("og:url", seoData.url || window.location.href, true);
    updateMetaTag("og:type", seoData.type || "website", true);
    updateMetaTag("og:site_name", seoData.siteName || "EduPro AI", true);
    updateMetaTag("og:locale", seoData.locale || "en_US", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", seoData.twitterCard || "summary_large_image");
    updateMetaTag("twitter:site", seoData.twitterSite || "@eduproai");
    updateMetaTag("twitter:title", seoData.title || "");
    updateMetaTag("twitter:description", seoData.description || "");
    updateMetaTag("twitter:image", seoData.image || "");

    // Canonical URL
    updateLinkTag("canonical", seoData.canonical || window.location.href);

    // Additional structured data for educational content
    if (seoData.type === "educational") {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: seoData.siteName || "EduPro AI",
        description: seoData.description,
        url: seoData.url || window.location.href,
        logo: seoData.image,
        sameAs: [
          "https://twitter.com/eduproai",
          "https://facebook.com/eduproai",
        ],
        hasOfferingCatalog: {
          "@type": "OfferingCatalog",
          name: "AI-Powered Learning Services",
          itemListElement: [
            {
              "@type": "Course",
              name: "AI Chat Assistant",
              description:
                "Interactive AI-powered chat assistant for personalized learning support",
              provider: {
                "@type": "EducationalOrganization",
                name: "EduPro AI",
              },
            },
          ],
        },
      };

      // Remove existing structured data
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [seoData]);
};
