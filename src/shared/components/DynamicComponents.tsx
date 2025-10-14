"use client";

import dynamic from "next/dynamic";

// Dynamic imports for components that are not immediately needed
export const GlobalMobileSearch = dynamic(
  () => import("@/src/shared/components/GlobalMobileSearch").then(mod => ({ default: mod.GlobalMobileSearch })),
  { ssr: false }
);

export const Toaster = dynamic(
  () => import("@/src/shared/components/ui/toaster").then(mod => ({ default: mod.Toaster })),
  { ssr: false }
);

export const PromoBanner = dynamic(
  () => import("@/src/shared/components/PromoBanner").then(mod => ({ default: mod.PromoBanner })),
  { ssr: false }
);

export const GlobalLoginModal = dynamic(
  () => import("@/src/shared/components/GlobalLoginModal").then(mod => ({ default: mod.GlobalLoginModal })),
  { ssr: false }
);
