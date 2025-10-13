"use client";

import { memo } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/src/shared/components/ui/avatar";
import { generateBlurDataURL, getImageSizes } from "@/src/shared/lib/image-optimization";

interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const OptimizedAvatarComponent = ({
  src,
  alt,
  fallback,
  size = "md",
  className = "",
}: OptimizedAvatarProps) => {
  const pixelSize = sizeMap[size];
  const initials = fallback || alt.substring(0, 2).toUpperCase();

  return (
    <Avatar className={className}>
      {src ? (
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={getImageSizes.avatar}
            className="object-cover"
            placeholder="blur"
            blurDataURL={generateBlurDataURL("#e5e7eb")}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <AvatarFallback>{initials}</AvatarFallback>
      )}
    </Avatar>
  );
};

export const OptimizedAvatar = memo(OptimizedAvatarComponent);
