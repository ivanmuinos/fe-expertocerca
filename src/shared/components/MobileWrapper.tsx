"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface MobileContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  orientation: 'portrait' | 'landscape';
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
}

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: 1024,
  orientation: 'landscape',
  isMobileSearchOpen: false,
  setIsMobileSearchOpen: () => {}
});

export const useMobile = () => useContext(MobileContext);

interface MobileWrapperProps {
  children: React.ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const [screenWidth, setScreenWidth] = useState(1024);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenWidth(window.innerWidth);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Inicial
    updateScreenInfo();

    // Listeners
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  const contextValue: MobileContextType = {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    orientation,
    isMobileSearchOpen,
    setIsMobileSearchOpen
  };

  return (
    <MobileContext.Provider value={contextValue}>
      <div className={`app-wrapper ${isMobile ? 'is-mobile' : ''} ${isTablet ? 'is-tablet' : ''} ${isDesktop ? 'is-desktop' : ''}`}>
        {children}

        {/* Mobile-specific global styles */}
        {isMobile && (
          <style jsx global>{`
            /* Mobile-specific global overrides */
            .mobile-only {
              display: block !important;
            }

            .desktop-only {
              display: none !important;
            }

            /* Hide specific elements in mobile */
            .is-mobile .hide-on-mobile {
              display: none !important;
            }

            .is-mobile .show-on-mobile {
              display: block !important;
            }

            /* Mobile header optimizations */
            .is-mobile .shared-header-desktop {
              display: none !important;
            }

            .is-mobile .shared-header-mobile {
              display: flex !important;
            }

            /* Mobile navbar behavior */
            .is-mobile .mobile-navbar {
              display: flex !important;
            }

            /* Reduce padding/margins in mobile */
            .is-mobile .mobile-compact {
              padding: 0.75rem !important;
            }

            /* Mobile text sizes */
            .is-mobile .text-mobile-sm {
              font-size: 0.875rem !important;
            }

            .is-mobile .text-mobile-base {
              font-size: 1rem !important;
            }

            /* Mobile button sizes */
            .is-mobile .btn-mobile-compact {
              padding: 0.5rem 1rem !important;
              font-size: 0.875rem !important;
            }
          `}</style>
        )}
      </div>
    </MobileContext.Provider>
  );
}