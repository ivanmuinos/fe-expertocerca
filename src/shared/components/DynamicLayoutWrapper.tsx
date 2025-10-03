"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMobile } from './MobileWrapper';

interface DynamicLayoutWrapperProps {
  children: React.ReactNode;
}

export function DynamicLayoutWrapper({ children }: DynamicLayoutWrapperProps) {
  const { isMobile } = useMobile();
  const pathname = usePathname();
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Define onboarding routes where padding should not be applied
  const onboardingRoutes = [
    '/specialty-selection',
    '/user-type-selection',
    '/onboarding',
    '/photo-upload',
    '/photo-guidelines',
    '/professional-intro',
    '/personal-data'
  ];

  const isOnboardingRoute = onboardingRoutes.some(route => pathname?.startsWith(route));

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

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Don't add padding on onboarding routes
  const paddingBottom = !isOnboardingRoute && isMobile
    ? (isNavbarVisible ? 'pb-20' : 'pb-4')
    : 'pb-0';

  return (
    <div className={`${paddingBottom} transition-all duration-300`}>
      {children}
    </div>
  );
}