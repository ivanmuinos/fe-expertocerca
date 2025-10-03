"use client";

import { useState, useEffect } from 'react';
import { useMobile } from './MobileWrapper';

interface DynamicLayoutWrapperProps {
  children: React.ReactNode;
}

export function DynamicLayoutWrapper({ children }: DynamicLayoutWrapperProps) {
  const { isMobile } = useMobile();
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const paddingBottom = isMobile
    ? (isNavbarVisible ? 'pb-20' : 'pb-4')
    : 'pb-0';

  return (
    <div className={`${paddingBottom} transition-all duration-300`}>
      {children}
    </div>
  );
}