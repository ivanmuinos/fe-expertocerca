"use client";

import { usePathname } from "next/navigation";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useState, useEffect } from "react";
import { useMobile } from "./MobileWrapper";
import { useAuthState } from "@/src/features/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import {
  Search,
  Heart,
  Plus,
  MessageCircle,
  User,
  Home,
  Briefcase,
  LogIn,
} from "lucide-react";

const loggedInNavItems = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    path: "/",
  },
  {
    id: "buscar",
    label: "Buscar",
    icon: Search,
    path: "/buscar",
  },
  {
    id: "publicar",
    label: "Publicar",
    icon: Plus,
    path: "/onboarding/user-type-selection",
  },
  {
    id: "publicaciones",
    label: "Publicaciones",
    icon: Briefcase,
    path: "/mis-publicaciones",
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: User,
    path: "/perfil",
  },
];

const loggedOutNavItems = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    path: "/",
  },
  {
    id: "buscar",
    label: "Buscar",
    icon: Search,
    path: "/buscar",
  },
  {
    id: "login",
    label: "Iniciar sesión",
    icon: User,
    path: null, // Special handling - opens modal
  },
];

export function MobileNavbar() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const {
    isMobile,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    setIsMobileNavbarVisible,
  } = useMobile();
  const { user } = useAuthState();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Choose nav items based on auth state
  const navItems = user ? loggedInNavItems : loggedOutNavItems;

  // Load user profile for avatar
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { apiClient } = await import("@/src/shared/lib/api-client");
        const data = await apiClient.get("/profiles/current");

        if (data) {
          setUserProfile({
            avatar_url: data.avatar_url,
            full_name: data.full_name,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    let ticking = false;

    const controlNavbar = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // En mobile el scroll está en body, en desktop en window
          const isMobileView = window.innerWidth <= 768;
          const currentScrollY = Math.max(
            0,
            isMobileView
              ? document.body.scrollTop || document.documentElement.scrollTop
              : window.scrollY
          );

          // Don't control navbar if search modal is open
          if (isMobileSearchOpen) {
            ticking = false;
            return;
          }

          // Check if we're at the bottom
          const scrollHeight = isMobileView
            ? document.body.scrollHeight
            : document.documentElement.scrollHeight;
          const clientHeight = isMobileView
            ? document.body.clientHeight
            : window.innerHeight;
          const isAtBottom = scrollHeight - currentScrollY - clientHeight < 100;

          // If at bottom, show navbar
          if (isAtBottom) {
            setIsVisible(true);
            setIsMobileNavbarVisible(true);
            setLastScrollY(currentScrollY);
            ticking = false;
            return;
          }

          // Calculate scroll difference
          const scrollDiff = currentScrollY - lastScrollY;

          // Require minimum scroll movement (10px threshold)
          if (Math.abs(scrollDiff) < 10) {
            ticking = false;
            return;
          }

          // Only hide/show navbar on scroll if user is logged in
          if (user) {
            // Scrolling down & past 50px - hide navbar
            if (scrollDiff > 0 && currentScrollY > 50) {
              setIsVisible(false);
              setIsMobileNavbarVisible(false);
            }
            // Scrolling up - show navbar
            else if (scrollDiff < 0) {
              setIsVisible(true);
              setIsMobileNavbarVisible(true);
            }
          } else {
            // Always show navbar for non-logged users
            setIsVisible(true);
            setIsMobileNavbarVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to both window and body scroll events
    window.addEventListener("scroll", controlNavbar, { passive: true });
    document.body.addEventListener("scroll", controlNavbar, { passive: true });

    return () => {
      window.removeEventListener("scroll", controlNavbar);
      document.body.removeEventListener("scroll", controlNavbar);
    };
  }, [isMobileSearchOpen, lastScrollY, user]);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  // Define routes where navbar should be hidden
  const hiddenNavbarRoutes = [
    "/onboarding/specialty-selection",
    "/onboarding/user-type-selection",
    "/onboarding",
    "/onboarding/photo-upload",
    "/onboarding/photo-guidelines",
    "/onboarding/professional-intro",
    "/onboarding/personal-data",
    "/publication",
  ];

  const isHiddenNavbarRoute = hiddenNavbarRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  // Check if body has overflow hidden (modal open) - solo para la búsqueda
  const isModalOpen =
    typeof document !== "undefined" &&
    document.body.style.overflow === "hidden" &&
    pathname === "/buscar";

  // Only show on mobile and when search modal is not open
  if (!isMobile || isMobileSearchOpen) return null;

  // Hide completely when modal is open on search page
  if (isModalOpen) return null;

  // Hide navbar on specific routes (onboarding, professional profile, etc)
  if (isHiddenNavbarRoute) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-lg transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className='flex items-center justify-around py-1'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          // Special handling for search and login buttons
          const handleClick = () => {
            if (item.id === "buscar") {
              // Open search modal instead of navigating
              setIsMobileSearchOpen(true);
            } else if (item.id === "login") {
              // Open login modal by dispatching custom event
              window.dispatchEvent(new CustomEvent("openLoginModal"));
            } else if (item.path) {
              setLoadingId(item.id);
              navigate(item.path);
              setTimeout(() => setLoadingId(null), 600);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-all duration-200 ${
                item.id === "login"
                  ? "bg-secondary rounded-lg mx-1 scale-105 shadow-md"
                  : ""
              } ${
                active ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {/* Show avatar for profile button if user is logged in */}
              {item.id === "perfil" && user && userProfile ? (
                <div className='mb-1'>
                  <Avatar className='w-6 h-6 ring-2 ring-white/30'>
                    <AvatarImage src={userProfile.avatar_url || undefined} />
                    <AvatarFallback className='text-[10px] bg-white/20 text-white'>
                      {userProfile.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className='relative mb-1'>
                  <Icon
                    className={`w-6 h-6 ${active ? "fill-current" : ""} ${
                      item.id === "login" ? "text-white" : ""
                    }`}
                    strokeWidth={item.id === "login" ? 2.5 : active ? 2.5 : 2}
                  />
                  {loadingId === item.id && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
                    </div>
                  )}
                </div>
              )}
              <span
                className={`text-[10px] font-medium leading-none ${
                  item.id === "login"
                    ? "text-white"
                    : active
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
