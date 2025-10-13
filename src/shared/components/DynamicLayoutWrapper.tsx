"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMobile } from "./MobileWrapper";

interface DynamicLayoutWrapperProps {
  children: React.ReactNode;
}

export function DynamicLayoutWrapper({ children }: DynamicLayoutWrapperProps) {
  const { isMobile } = useMobile();
  const pathname = usePathname();
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Define routes where padding should not be applied
  const noPaddingRoutes = [
    "/onboarding/user-type-selection",
    "/onboarding/specialty-selection",
    "/onboarding",
    "/onboarding/photo-upload",
    "/onboarding/photo-guidelines",
    "/onboarding/professional-intro",
    "/onboarding/personal-data",
    "/publication",
    "/perfil",
    "/mis-publicaciones",
  ];

  const isNoPaddingRoute = noPaddingRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  // Don't add padding on specific routes
  const paddingBottom =
    !isNoPaddingRoute && isMobile
      ? isNavbarVisible
        ? "pb-20"
        : "pb-4"
      : "pb-0";

  return (
    <div className={`${paddingBottom} transition-all duration-300`}>
      {children}
    </div>
  );
}
