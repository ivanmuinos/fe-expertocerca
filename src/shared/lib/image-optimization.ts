/**
 * Image Optimization Utilities
 * Helpers for optimizing images with Next.js Image component
 */

/**
 * Generate blur placeholder for images
 * This creates a tiny SVG that acts as a placeholder while the image loads
 */
export const generateBlurDataURL = (color: string = "#f3f4f6"): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}"/></svg>`
  ).toString("base64")}`;
};

/**
 * Get optimized image sizes for responsive images
 */
export const getImageSizes = {
  avatar: "(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px",
  card: "(max-width: 640px) 160px, (max-width: 1024px) 200px, 250px",
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px",
  thumbnail: "96px",
  fullWidth: "100vw",
};

/**
 * Image loader for external URLs
 * Useful when images come from external sources like Supabase Storage
 */
export const imageLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // If it's already optimized or from a CDN, return as-is
  if (src.includes("/_next/image") || src.includes("cloudinary")) {
    return src;
  }

  // For Supabase or other external sources, you can add transformation params
  // Example: return `${src}?w=${width}&q=${quality || 75}`;
  return src;
};

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get fallback image based on type
 */
export const getFallbackImage = (type: "avatar" | "card" | "hero"): string => {
  const fallbacks = {
    avatar: "/images/default-avatar.png",
    card: "/images/default-card.png",
    hero: "/images/default-hero.png",
  };
  return fallbacks[type] || fallbacks.card;
};
