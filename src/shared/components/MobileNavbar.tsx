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
import { PublishTypeModal } from "./PublishTypeModal";

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
    path: "/search",
  },
  {
    id: "publicar",
    label: "Publicar",
    icon: Plus,
    path: null, // Opens modal
  },
  {
    id: "publicaciones",
    label: "Publicaciones",
    icon: Briefcase,
    path: "/my-publications",
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: User,
    path: "/profile",
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
    id: "publicar",
    label: "Publicar",
    icon: Plus,
    path: null, // Opens login modal when not logged in
  },
  {
    id: "buscar",
    label: "Buscar",
    icon: Search,
    path: "/search",
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
  const { user, loading: authLoading } = useAuthState();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

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
        const data = await apiClient.get("/profiles/current") as any;

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
    // Always show navbar on mobile
    setIsVisible(true);
    setIsMobileNavbarVisible(true);
  }, [isMobileSearchOpen]); // Keep dependency on isMobileSearchOpen to ensure visibility when search modal closes

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  // Define routes where navbar should be hidden
  const hiddenNavbarRoutes = [
    "/onboarding", // Covers all onboarding sub-routes
    "/publication",
    "/requests",
    "/requests/new",
    "/requests/new/",
    "/requests/new/problem",
    "/requests/new/photos",
    "/requests/new/contact",
  ];

  const isHiddenNavbarRoute = hiddenNavbarRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  // Check if body has overflow hidden (modal open) - solo para la búsqueda
  const isModalOpen =
    typeof document !== "undefined" &&
    document.body.style.overflow === "hidden" &&
    pathname === "/search";

  // Only show on mobile and when search modal is not open
  if (!isMobile || isMobileSearchOpen) return null;

  // Hide completely when modal is open on search page
  if (isModalOpen) return null;

  // Hide navbar on specific routes (onboarding, professional profile, etc)
  if (isHiddenNavbarRoute) return null;

  // Show skeleton while auth is loading
  if (authLoading) {
    return (
      <div
        className='fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-lg'
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className='flex items-center justify-around py-1'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1'
            >
              <div className='w-6 h-6 bg-white/20 rounded-full mb-1 animate-pulse' />
              <div className='w-12 h-2 bg-white/20 rounded animate-pulse' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PublishTypeModal open={publishModalOpen} onOpenChange={setPublishModalOpen} />
      
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-lg transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-[160%]"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className='flex items-center justify-around py-1 relative'>
          {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          // Special handling for search, login, and publish buttons
          const handleClick = () => {
            if (item.id === "buscar") {
              // Always open search modal
              setIsMobileSearchOpen(true);
            } else if (item.id === "login") {
              // Open login modal by dispatching custom event
              window.dispatchEvent(new CustomEvent("openLoginModal"));
            } else if (item.id === "publicar") {
              // If user is logged in, open publish modal; otherwise open login modal
              if (user) {
                setPublishModalOpen(true);
              } else {
                window.dispatchEvent(new CustomEvent("openLoginModal"));
              }
            } else if (item.path) {
              setLoadingId(item.id);
              navigate(item.path);
              setTimeout(() => setLoadingId(null), 600);
            }
          };

          // Special styling for publish button (elevated)
          const isPublishButton = item.id === "publicar";
          
          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-all duration-200 ${
                isPublishButton
                  ? "relative -mt-8"
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
                    <AvatarFallback className='text-xs bg-white/20 text-white'>
                      {userProfile.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : isPublishButton ? (
                <div className='relative mb-1'>
                  <div className='w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-lg ring-4 ring-primary'>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              ) : (
                <div className='relative mb-1'>
                  <Icon
                    className={`w-6 h-6 ${active ? "fill-current" : ""}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {loadingId === item.id && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
                    </div>
                  )}
                </div>
              )}
              <span
                className={`text-xs font-medium leading-none ${
                  active
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
    </>
  );
}

