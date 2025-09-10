/**
 * SEO Utilities for testing and validation
 */

export const getSEOData = () => {
  const title = document.title;
  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") || "";
  const keywords =
    document.querySelector('meta[name="keywords"]')?.getAttribute("content") ||
    "";
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") || "";
  const ogDescription =
    document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") || "";
  const ogImage =
    document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content") || "";
  const canonical =
    document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const structuredData =
    document.querySelector('script[type="application/ld+json"]')?.textContent ||
    "";

  return {
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    structuredData: structuredData ? JSON.parse(structuredData) : null,
  };
};

export const validateSEO = () => {
  const seoData = getSEOData();
  const issues: string[] = [];

  // Title validation
  if (!seoData.title) {
    issues.push("Missing page title");
  } else if (seoData.title.length < 30 || seoData.title.length > 60) {
    issues.push("Title should be between 30-60 characters");
  }

  // Description validation
  if (!seoData.description) {
    issues.push("Missing meta description");
  } else if (
    seoData.description.length < 120 ||
    seoData.description.length > 160
  ) {
    issues.push("Description should be between 120-160 characters");
  }

  // Open Graph validation
  if (!seoData.ogTitle) issues.push("Missing Open Graph title");
  if (!seoData.ogDescription) issues.push("Missing Open Graph description");
  if (!seoData.ogImage) issues.push("Missing Open Graph image");

  // Canonical URL validation
  if (!seoData.canonical) issues.push("Missing canonical URL");

  return {
    isValid: issues.length === 0,
    issues,
    seoData,
  };
};

// Development helper function to log SEO data
export const logSEOData = () => {
  if (process.env.NODE_ENV === "development") {
    const validation = validateSEO();
    console.group("🔍 SEO Validation Report");
    console.log("Valid:", validation.isValid ? "✅" : "❌");
    if (validation.issues.length > 0) {
      console.warn("Issues:", validation.issues);
    }
    console.log("SEO Data:", validation.seoData);
    console.groupEnd();
  }
};
