"use client";

import { usePathname } from 'next/navigation';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useState, useEffect } from 'react';
import { useMobile } from './MobileWrapper';
import {
  Search,
  Heart,
  Plus,
  MessageCircle,
  User,
  Home,
  Briefcase
} from 'lucide-react';

const navItems = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: Home,
    path: '/'
  },
  {
    id: 'buscar',
    label: 'Buscar',
    icon: Search,
    path: '/buscar'
  },
  {
    id: 'publicar',
    label: 'Publicar',
    icon: Plus,
    path: '/publicar'
  },
  {
    id: 'publicaciones',
    label: 'Publicaciones',
    icon: Briefcase,
    path: '/mis-publicaciones'
  },
  {
    id: 'perfil',
    label: 'Perfil',
    icon: User,
    path: '/perfil'
  }
];

export function MobileNavbar() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { isMobile, isMobileSearchOpen } = useMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Don't control navbar if search modal is open
      if (isMobileSearchOpen) {
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isMobileSearchOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Only show on mobile and when search modal is not open
  if (!isMobile || isMobileSearchOpen) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200 ${
                active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  active ? 'fill-current' : ''
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-xs font-medium leading-none ${
                active ? 'text-primary' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}