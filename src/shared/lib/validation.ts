import { z } from "zod";

// ============================================================================
// PROFILE VALIDATION SCHEMAS
// ============================================================================

export const profileUpdateSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .optional()
    .nullable()
    .or(z.literal("")),
  whatsapp_phone: z
    .string()
    .min(1, "WhatsApp is required")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatar_url: z.string().url("Invalid URL").optional().nullable(),
  full_name: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .optional()
    .nullable(),
  location_city: z.string().max(100).optional().nullable(),
  location_province: z.string().max(100).optional().nullable(),
  facebook_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  instagram_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  twitter_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
});

// ============================================================================
// PROFESSIONAL PROFILE VALIDATION SCHEMAS
// ============================================================================

export const professionalProfileSchema = z.object({
  trade_name: z.string().min(3, "Trade name too short").max(200),
  description: z.string().min(20, "Description too short").max(2000),
  specialty: z.string().min(3).max(100).optional().nullable(),
  years_experience: z.number().int().min(0).max(80),
  hourly_rate: z.number().positive().max(999999).optional().nullable(),
  whatsapp_phone: z.string().min(1).optional().nullable().or(z.literal("")),
  work_phone: z.string().min(1).optional().nullable().or(z.literal("")),
  main_portfolio_image: z.string().url().optional().nullable(),
});

export const professionalProfileUpdateSchema =
  professionalProfileSchema.partial();

// ============================================================================
// PORTFOLIO VALIDATION SCHEMAS
// ============================================================================

export const portfolioPhotoSchema = z.object({
  image_url: z.string().url("Invalid image URL"),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  professional_profile_id: z.string().uuid(),
});

export const portfolioPhotoUpdateSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

// ============================================================================
// REVIEW VALIDATION SCHEMAS
// ============================================================================

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "Comment too short")
    .max(1000, "Comment too long"),
  professional_profile_id: z.string().uuid(),
});

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB.`,
    };
  }

  return { valid: true };
}

// ============================================================================
// URL VALIDATION (anti-SSRF)
// ============================================================================

const ALLOWED_URL_PROTOCOLS = ["https:"];
const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // AWS metadata
  "metadata.google.internal", // GCP metadata
];

export function validateExternalUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsed = new URL(url);

    if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTPS URLs are allowed" };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((blocked) => hostname.includes(blocked))) {
      return { valid: false, error: "Invalid URL host" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

// ============================================================================
// SANITIZATION
// ============================================================================

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars
    .replace(/\.{2,}/g, ".") // Remove directory traversal
    .slice(0, 255); // Limit length
}
