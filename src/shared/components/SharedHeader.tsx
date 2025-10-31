"use client";

import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";
import {
  ArrowLeft,
  User,
  FileText,
  LogOut,
  Plus,
  Search,
  Home,
  X,
  AlertCircle,
  Menu,
  Compass,
  Building,
  TreePine,
  Waves,
  Mountain,
} from "lucide-react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { usePathname } from "next/navigation";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { useOnboardingStatus } from "@/src/features/onboarding";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/src/shared/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceSelector } from "@/src/shared/components/ServiceSelector";
import { ZoneSelector } from "@/src/shared/components/ZoneSelector";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { useMobile } from "@/src/shared/components/MobileWrapper";
import { useLoadingStore } from "@/src/shared/stores/useLoadingStore";

export interface SharedHeaderProps {
  // Navigation
  showBackButton?: boolean;
  title?: string;

  // Create button
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;

  // Right action button
  rightAction?: React.ReactNode;

  // Search functionality
  showSearch?: boolean;
  searchCollapsed?: boolean;
  searchProps?: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedZone: string;
    setSelectedZone: (zone: string) => void;
    popularServices: { name: string; icon: any }[];
    clearFilters: () => void;
    onSearch?: () => void;
  };

  // Styling
  variant?: "default" | "transparent";
  hideOnMobile?: boolean;
}

export function SharedHeader({
  showBackButton = false,
  title,
  showCreateButton = false,
  createButtonText = "Crear",
  onCreateClick,
  rightAction,
  variant = "default",
  showSearch = false,
  searchCollapsed = false,
  searchProps,
  hideOnMobile = false,
}: SharedHeaderProps) {
  const navigate = useNavigate();
  const pathname = usePathname();
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const onboardingStatus = useOnboardingStatus();
  const [profile, setProfile] = useState<any>(null);
  const { isMobileSearchOpen, setIsMobileSearchOpen } = useMobile();

  const { setLoading, clearLoading } = useLoadingStore();
  const handleSearch = () => {
    // Close mobile search modal after search
    setIsMobileSearchOpen(false);
    // Start loading feedback on search action
    try {
      setLoading(true);
    } catch {}

    // Check current page to determine behavior
    if (pathname.startsWith("/buscar")) {
      // If we're on /buscar page, apply filters in-place
      if (searchProps?.onSearch) {
        searchProps.onSearch();
      }
      // Collapse desktop search if expanded
      if (isDesktopSearchExpanded) {
        setIsDesktopSearchExpanded(false);
      }
    } else {
      // If we're on any other page (like /home), navigate to /buscar with filters
      if (searchProps) {
        const params = new URLSearchParams();
        if (searchProps.searchTerm && searchProps.searchTerm !== "Todos")
          params.set("servicio", searchProps.searchTerm);
        if (searchProps.selectedZone && searchProps.selectedZone !== "all")
          params.set("zona", searchProps.selectedZone);
        const queryString = params.toString();
        navigate(queryString ? `/buscar?${queryString}` : "/buscar");
      }
    }
    // stop loading after letting navigation start
    setTimeout(() => {
      try {
        clearLoading();
      } catch {}
    }, 300);
  };

  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(
    (!searchCollapsed || pathname === "/") &&
      !pathname.startsWith("/publication")
  );
  const [isServiceSelectorOpen, setIsServiceSelectorOpen] = useState(false);
  const [isZoneSelectorOpen, setIsZoneSelectorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const lastToggleAtRef = useRef<number>(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const lastActionScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const serviceSectionRef = useRef<HTMLDivElement>(null);
  const zoneSectionRef = useRef<HTMLDivElement>(null);
  const [mobileSubScreen, setMobileSubScreen] = useState<'main' | 'service' | 'zone'>('main');
  const [activeDesktopField, setActiveDesktopField] = useState<'service' | 'zone' | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const data = await apiClient.get("/profiles/current");
        setProfile(data);
      } catch (error) {
        // Error loading profile - fail silently
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  // Listen for custom event to toggle login modal (from MobileNavbar)
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen((prev) => !prev);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  // Handle scroll for header styling and search behavior
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 20);

          // Only apply scroll behavior on home page and when search is collapsible, but not on profesional page
          if (
            pathname === "/" &&
            searchCollapsed &&
            showSearch &&
            !pathname.startsWith("/publication")
          ) {
            // If we're at the very top (within 20px), expand search (with cooldown)
            if (currentScrollY <= 20) {
              const nowTop = performance.now();
              if (
                !isDesktopSearchExpanded &&
                nowTop - lastToggleAtRef.current > 300
              ) {
                setIsDesktopSearchExpanded(true);
                setIsScrollingDown(false);
                lastActionScrollY.current = currentScrollY;
                lastToggleAtRef.current = nowTop;
              }
            }
            // Block when a dropdown is open (avoid fighting user intent)
            else if (isServiceSelectorOpen || isZoneSelectorOpen) {
              // Do nothing while dropdowns are open
            }
            // If expanded mid-page and user scrolls up a bit, close (user likely wants more content)
            else if (
              isDesktopSearchExpanded &&
              currentScrollY > 20 &&
              lastScrollY - currentScrollY > 8
            ) {
              const now = performance.now();
              if (now - lastToggleAtRef.current > 300) {
                setIsDesktopSearchExpanded(false);
                setIsScrollingDown(false);
                lastActionScrollY.current = currentScrollY;
                lastToggleAtRef.current = now;
              }
            }
            // If scrolled down enough from last action, collapse search
            else if (
              currentScrollY > lastActionScrollY.current + 10 &&
              currentScrollY > 80 &&
              isDesktopSearchExpanded
            ) {
              // Cooldown: avoid rapid toggles within 250ms
              const now = performance.now();
              if (now - lastToggleAtRef.current < 350) {
                ticking = false;
                return;
              }
              setIsDesktopSearchExpanded(false);
              setIsScrollingDown(true);
              lastActionScrollY.current = currentScrollY;
              lastToggleAtRef.current = now;
            }
            // Do not re-expand mid-page; only expand near the very top

            setLastScrollY(currentScrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isScrollingDown, pathname, searchCollapsed, showSearch]);

  // Handle click outside to collapse search and close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        // Close active dropdown when clicking outside
        if (activeDesktopField) {
          setActiveDesktopField(null);
        }

        // Collapse entire search if expanded
        if (searchCollapsed && isDesktopSearchExpanded) {
          // On home: only collapse if not at the very top
          if (pathname === "/") {
            if (typeof window !== "undefined" && window.scrollY > 20) {
              setIsDesktopSearchExpanded(false);
              setActiveDesktopField(null);
            }
          } else {
            // On other pages: always collapse on outside click
            setIsDesktopSearchExpanded(false);
            setActiveDesktopField(null);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchCollapsed, isDesktopSearchExpanded, pathname, activeDesktopField]);

  // Close service dropdown when clicking outside its own section
  useEffect(() => {
    if (!isServiceSelectorOpen) return;
    const handleServiceOutside = (event: MouseEvent) => {
      if (
        serviceSectionRef.current &&
        !serviceSectionRef.current.contains(event.target as Node)
      ) {
        setIsServiceSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleServiceOutside);
    return () =>
      document.removeEventListener("mousedown", handleServiceOutside);
  }, [isServiceSelectorOpen]);

  // Close zone dropdown when clicking outside its own section
  useEffect(() => {
    if (!isZoneSelectorOpen) return;
    const handleZoneOutside = (event: MouseEvent) => {
      if (
        zoneSectionRef.current &&
        !zoneSectionRef.current.contains(event.target as Node)
      ) {
        setIsZoneSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleZoneOutside);
    return () => document.removeEventListener("mousedown", handleZoneOutside);
  }, [isZoneSelectorOpen]);

  const getPageTitle = () => {
    if (title) return title;

    switch (pathname) {
      case "/":
        return "Experto Cerca";
      case "/buscar":
        return "Buscar";
      case "/perfil":
        return "Perfil";
      case "/mis-publicaciones":
        return "Mis Publicaciones";
      case "/publicar":
        return "Publicar Servicio";
      case "/onboarding":
        return "Configurar Perfil";
      default:
        return "Experto Cerca";
    }
  };

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
    setMobileSubScreen('main');
  };

  return (
    <>
      {/* Overlay when desktop search is expanded - Only on non-home pages */}
      {pathname !== "/" && (
        <AnimatePresence>
          {searchCollapsed && isDesktopSearchExpanded && (
            <motion.div
              className='fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => {
                setIsDesktopSearchExpanded(false);
                setActiveDesktopField(null);
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Mobile-first Airbnb-style header */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 transition-all duration-300 ease-out bg-white md:bg-primary ${hideOnMobile ? 'hidden md:block' : ''}`}
      >
        <div className='w-full px-3 md:px-6 sm:px-8 lg:px-10 pt-2 pb-3'>
          {/* Mobile: ONLY search bar */}
          {showSearch && searchProps ? (
            <div className='md:hidden h-16 flex items-center'>
              <div className='w-full'>
                <Button
                  variant='ghost'
                  onClick={handleMobileSearchOpen}
                  className='w-full bg-white border border-gray-300 rounded-full px-6 py-4 h-14 flex items-center gap-3 hover:bg-white transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none active:scale-[0.98] active:bg-white'
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)' }}
                >
                  <Search className='h-5 w-5 text-muted-foreground flex-shrink-0' />
                  <div className='text-sm truncate'>
                    {searchProps.searchTerm &&
                    searchProps.searchTerm.trim() !== "" ? (
                      <span className='font-medium text-foreground'>
                        {searchProps.searchTerm}
                      </span>
                    ) : (
                      <span className='font-semibold text-foreground'>
                        Empezá tu búsqueda
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className='md:hidden flex items-center justify-between w-full relative h-16 bg-primary px-2'>
              {showBackButton ? (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigate(-1)}
                  className='p-2 h-8 w-8 hover:bg-white/10 text-white'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              ) : (
                <div className='w-8' />
              )}
              <Image
                src='/logo-bco-experto-cerca.svg'
                alt='Experto Cerca'
                width={120}
                height={40}
                className='h-7 w-auto cursor-pointer'
                onClick={() => navigate("/")}
                priority
              />
              {rightAction ? (
                <div>{rightAction}</div>
              ) : (
                <div className='w-8' />
              )}
            </div>
          )}

          {/* Desktop: Full header */}
          <div className='hidden md:flex items-center h-16 sm:h-18 w-full relative'>
            {/* Logo a la izquierda */}
            <div className='flex items-center justify-start absolute left-0'>
              <Image
                src='/logo-bco-experto-cerca.svg'
                alt='Experto Cerca'
                width={140}
                height={46}
                className='h-8 md:h-9 w-auto cursor-pointer'
                onClick={() => navigate("/")}
                priority
              />
            </div>

            {/* Desktop: Centered search bar - Compact version */}
            {showSearch &&
              searchProps &&
              searchCollapsed &&
              !isDesktopSearchExpanded && (
                <div className='flex justify-center w-full'>
                  <button
                    onClick={() => setIsDesktopSearchExpanded(true)}
                    className='bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[420px]'
                  >
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex items-center divide-x divide-gray-300 flex-1'>
                        {/* Service section */}
                        <div className='flex items-center gap-2 px-3 py-2 flex-1'>
                          <span className='text-sm font-semibold text-foreground truncate'>
                            {searchProps.searchTerm && searchProps.searchTerm.trim() !== ""
                              ? searchProps.searchTerm
                              : "Cualquier lugar"}
                          </span>
                        </div>

                        {/* Zone section */}
                        <div className='flex items-center gap-2 px-3 py-2 flex-1'>
                          <span className='text-sm text-muted-foreground truncate'>
                            {searchProps.selectedZone === "all"
                              ? "Todas las zonas"
                              : searchProps.selectedZone && searchProps.selectedZone !== "all"
                              ? searchProps.selectedZone
                              : "Cualquier zona"}
                          </span>
                        </div>
                      </div>

                      {/* Search button */}
                      <div className='flex items-center pr-1 py-1'>
                        <div className='bg-secondary text-secondary-foreground rounded-full p-2 hover:bg-secondary/90 transition-colors'>
                          <Search className='h-4 w-4' />
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

            {/* Right section - ALWAYS VISIBLE - Airbnb style */}
            <div className='flex items-center gap-2 absolute right-0'>
              {rightAction && <div>{rightAction}</div>}
              {user ? (
                <>
                  {/* Avatar que va directo a perfil */}
                  <Button
                    variant='ghost'
                    onClick={() => navigate("/perfil")}
                    className='relative h-10 w-10 rounded-full p-0 hover:bg-gray-100'
                  >
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className='bg-primary text-primary-foreground text-sm'>
                        {profile?.full_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>

                  {/* Menú hamburguesa - Solo desktop */}
                  <div className='hidden md:block'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='relative h-10 w-10 rounded-full p-0 hover:bg-white/10 transition-all duration-200 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none'
                        >
                          <Menu className='h-4 w-4 text-white' />
                          {onboardingStatus.needsOnboarding && (
                            <div className='absolute -top-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-primary rounded-full flex items-center justify-center'>
                              <div className='h-1.5 w-1.5 bg-white rounded-full animate-pulse' />
                            </div>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className='w-48 bg-white border-0 shadow-xl rounded-2xl p-2 z-50'
                        align='end'
                      >
                        <div className='flex items-center justify-start gap-2 p-2 mb-2'>
                          <div className='flex flex-col space-y-1 leading-none'>
                            <p className='text-sm font-medium'>
                              {profile?.full_name || "Usuario"}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/mis-publicaciones")}
                          className='text-sm rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors'
                        >
                          <FileText className='mr-3 h-4 w-4' />
                          Mis Publicaciones
                        </DropdownMenuItem>
                        {onboardingStatus.needsOnboarding && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                navigate("/onboarding/user-type-selection")
                              }
                              className='text-sm rounded-xl px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700'
                            >
                              <AlertCircle className='mr-3 h-4 w-4' />
                              Completar registro
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            await signOut();
                            navigate("/");
                          }}
                          className='text-sm rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors'
                        >
                          <LogOut className='mr-3 h-4 w-4' />
                          Cerrar sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <>
                  {/* Botón "Convertite en experto" */}
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant='ghost'
                    className='hidden sm:flex text-sm font-medium text-white hover:text-white hover:bg-white/10 rounded-full px-4 py-2 h-10 transition-all duration-200'
                  >
                    Convertite en experto
                  </Button>

                  {/* Botón "Iniciar sesión" - Solo desktop */}
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className='hidden md:flex text-sm font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-6 py-2 h-10 transition-all duration-200'
                  >
                    Iniciar sesión
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Desktop: Expanded search section - Airbnb style */}
          {showSearch &&
            searchProps &&
            (!searchCollapsed || isDesktopSearchExpanded) && (
              <div className='hidden md:flex items-center pb-4 w-full justify-center'>
                {/* Centered search */}
                <motion.div
                  className='bg-white rounded-full shadow-lg border border-gray-300 relative max-w-3xl w-full'
                  initial={
                    searchCollapsed
                      ? { opacity: 0, y: -10, scale: 0.98 }
                      : ({} as any)
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className='flex items-stretch'>
                      {/* Servicio button */}
                      <button
                        onClick={() => setActiveDesktopField(activeDesktopField === 'service' ? null : 'service')}
                        className={`flex-1 px-8 py-3 text-left rounded-l-full transition-all ${
                          activeDesktopField === 'service' ? 'bg-white shadow-xl scale-105 z-10' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className='text-xs font-semibold text-gray-900 mb-1'>
                          Servicio
                        </div>
                        <div className={`text-sm ${
                          searchProps.searchTerm && searchProps.searchTerm.trim() !== ""
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {searchProps.searchTerm && searchProps.searchTerm.trim() !== ""
                            ? searchProps.searchTerm
                            : "Buscar servicios"}
                        </div>
                      </button>

                      {/* Divider */}
                      <div className='w-px bg-gray-300 my-3' />

                      {/* Zona button */}
                      <button
                        onClick={() => setActiveDesktopField(activeDesktopField === 'zone' ? null : 'zone')}
                        className={`flex-1 px-8 py-3 text-left transition-all ${
                          activeDesktopField === 'zone' ? 'bg-white shadow-xl scale-105 z-10' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className='text-xs font-semibold text-gray-900 mb-1'>
                          Zona
                        </div>
                        <div className={`text-sm ${
                          searchProps.selectedZone && searchProps.selectedZone !== "all"
                            ? 'text-gray-900 font-medium'
                            : searchProps.selectedZone === "all"
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {searchProps.selectedZone === "all"
                            ? "Todas las zonas"
                            : searchProps.selectedZone && searchProps.selectedZone !== "all"
                            ? searchProps.selectedZone
                            : "Agregar zona"}
                        </div>
                      </button>

                      {/* Search button */}
                      <div className='flex items-center pr-2 pl-4'>
                        <Button
                          onClick={() => {
                            handleSearch();
                            setIsDesktopSearchExpanded(false);
                            setActiveDesktopField(null);
                          }}
                          className='h-12 px-6 rounded-full bg-secondary hover:bg-secondary/90 flex items-center gap-2 shadow-md transition-all hover:scale-105'
                        >
                          <Search className='h-4 w-4 text-white' />
                          <span className='text-white font-semibold text-sm'>Buscar</span>
                        </Button>
                      </div>
                    </div>

                    {/* Service Dropdown */}
                    <AnimatePresence>
                      {activeDesktopField === 'service' && (
                        <motion.div
                          className='absolute top-full left-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 w-full max-w-md z-50'
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className='space-y-1 max-h-96 overflow-y-auto'>
                            {searchProps.popularServices?.map((service) => (
                              <button
                                key={service.name}
                                onClick={() => {
                                  searchProps.setSearchTerm(service.name);
                                  // Transición automática a zona
                                  setTimeout(() => {
                                    setActiveDesktopField('zone');
                                  }, 150);
                                }}
                                className='flex items-center gap-4 p-3 w-full hover:bg-gray-50 rounded-xl transition-colors text-left'
                              >
                                <div className='flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                                  <service.icon className='h-5 w-5 text-gray-600' />
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='font-medium text-sm text-gray-900'>
                                    {service.name}
                                  </div>
                                </div>
                                {searchProps.searchTerm === service.name && (
                                  <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
                                    <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                      <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Zone Dropdown */}
                    <AnimatePresence>
                      {activeDesktopField === 'zone' && (
                        <motion.div
                          className='absolute top-full right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 w-full max-w-sm z-50'
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className='space-y-1'>
                            {[
                              { name: "all", label: "Todas las zonas", icon: Compass },
                              { name: "Ciudad Autónoma de Buenos Aires", label: "CABA", icon: Building },
                              { name: "GBA Norte", label: "GBA Norte", icon: TreePine },
                              { name: "GBA Sur", label: "GBA Sur", icon: Waves },
                              { name: "GBA Oeste", label: "GBA Oeste", icon: Mountain },
                              { name: "La Plata y alrededores", label: "La Plata", icon: Building },
                              { name: "Córdoba", label: "Córdoba", icon: Building },
                              { name: "Rosario", label: "Rosario", icon: Building },
                              { name: "Mendoza", label: "Mendoza", icon: Mountain },
                            ].map((zone) => {
                              const IconComponent = zone.icon;
                              return (
                                <button
                                  key={zone.name}
                                  onClick={() => {
                                    searchProps.setSelectedZone(zone.name);
                                    setActiveDesktopField(null);
                                  }}
                                  className='flex items-center gap-4 p-3 w-full hover:bg-gray-50 rounded-xl transition-colors text-left'
                                >
                                  <div className='flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                                    <IconComponent className='h-5 w-5 text-gray-600' />
                                  </div>
                                  <div className='flex-1 min-w-0'>
                                    <div className='font-medium text-sm text-gray-900'>
                                      {zone.label}
                                    </div>
                                  </div>
                                  {searchProps.selectedZone === zone.name && (
                                    <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
                                      <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
              </div>
            )}
        </div>
      </header>

      {/* Mobile: Full-screen search overlay (Airbnb style) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              onClick={handleMobileSearchClose}
            />

            {/* Search modal - Bottom Drawer */}
            <motion.div
              className='fixed inset-x-0 bottom-0 z-50 bg-background md:hidden shadow-2xl flex flex-col rounded-t-3xl overflow-hidden'
              style={{ maxHeight: '90vh', height: '90vh' }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Main Screen */}
              <AnimatePresence mode="wait">
                {mobileSubScreen === 'main' && (
                  <motion.div
                    key="main"
                    className='flex flex-col h-full'
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Handle */}
                    <div className='w-full flex justify-center pt-3 pb-2'>
                      <div className='w-10 h-1 bg-gray-300 rounded-full' />
                    </div>

                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
                      <h2 className='text-lg font-semibold'>Encuentra tu experto</h2>
                      <Button
                        variant='ghost'
                        onClick={handleMobileSearchClose}
                        className='p-2 h-9 w-9 rounded-full hover:bg-gray-100'
                      >
                        <X className='h-5 w-5' />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                      {/* Service selector button */}
                      <button
                        onClick={() => setMobileSubScreen('service')}
                        className='w-full p-4 border border-gray-300 rounded-xl text-left hover:border-gray-400 transition-colors'
                      >
                        <div className='text-xs font-semibold text-gray-500 mb-1'>Servicio</div>
                        <div className='text-sm font-medium text-gray-900'>
                          {searchProps?.searchTerm && searchProps.searchTerm.trim() !== ""
                            ? searchProps.searchTerm
                            : "¿Qué servicio necesitas?"}
                        </div>
                      </button>

                      {/* Zone selector button */}
                      <button
                        onClick={() => setMobileSubScreen('zone')}
                        className='w-full p-4 border border-gray-300 rounded-xl text-left hover:border-gray-400 transition-colors'
                      >
                        <div className='text-xs font-semibold text-gray-500 mb-1'>Zona</div>
                        <div className='text-sm font-medium text-gray-900'>
                          {searchProps?.selectedZone && searchProps.selectedZone !== "all"
                            ? searchProps.selectedZone
                            : "¿En qué zona?"}
                        </div>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className='p-4 border-t border-gray-200 bg-white'>
                      <div className='flex justify-between items-center gap-3'>
                        <Button
                          variant='ghost'
                          onClick={searchProps?.clearFilters || (() => {})}
                          className='text-sm font-normal underline text-black hover:text-black hover:bg-white px-0 focus:bg-white focus-visible:bg-white active:bg-white'
                        >
                          Limpiar todo
                        </Button>
                        <Button
                          onClick={() => {
                            handleSearch();
                            handleMobileSearchClose();
                          }}
                          className='h-12 px-8 text-base font-medium rounded-xl bg-primary hover:bg-primary-dark shadow-lg'
                        >
                          Buscar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Service Sub-Screen */}
                {mobileSubScreen === 'service' && (
                  <motion.div
                    key="service"
                    className='flex flex-col h-full'
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header with Back */}
                    <div className='flex items-center gap-3 px-4 py-4 border-b border-gray-200'>
                      <Button
                        variant='ghost'
                        onClick={() => setMobileSubScreen('main')}
                        className='p-2 h-9 w-9 rounded-full hover:bg-gray-100'
                      >
                        <ArrowLeft className='h-5 w-5' />
                      </Button>
                      <h2 className='text-lg font-semibold'>Seleccionar servicio</h2>
                    </div>

                    {/* Service List */}
                    <div className='flex-1 overflow-y-auto p-4'>
                      <div className='space-y-2'>
                        {searchProps?.popularServices
                          ?.filter((service) => service?.name && service.name.trim().length > 0)
                          .map((service) => (
                            <button
                              key={service.name}
                              onClick={() => {
                                searchProps?.setSearchTerm(service.name);
                                // Transición automática a zona en mobile
                                setTimeout(() => {
                                  setMobileSubScreen('zone');
                                }, 150);
                              }}
                              className='flex items-center w-full p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors'
                            >
                              <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-3'>
                                <service.icon className='h-6 w-6 text-primary' />
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <div className='font-medium text-foreground text-base'>
                                  {service.name}
                                </div>
                              </div>
                              {searchProps?.searchTerm === service.name && (
                                <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-2'>
                                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Zone Sub-Screen */}
                {mobileSubScreen === 'zone' && (
                  <motion.div
                    key="zone"
                    className='flex flex-col h-full'
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header with Back */}
                    <div className='flex items-center gap-3 px-4 py-4 border-b border-gray-200'>
                      <Button
                        variant='ghost'
                        onClick={() => setMobileSubScreen('main')}
                        className='p-2 h-9 w-9 rounded-full hover:bg-gray-100'
                      >
                        <ArrowLeft className='h-5 w-5' />
                      </Button>
                      <h2 className='text-lg font-semibold'>Seleccionar zona</h2>
                    </div>

                    {/* Zone List */}
                    <div className='flex-1 overflow-y-auto p-4'>
                      <div className='space-y-2'>
                        {[
                          { name: "all", label: "Todas las zonas", icon: Compass },
                          { name: "Ciudad Autónoma de Buenos Aires", label: "CABA", icon: Building },
                          { name: "GBA Norte", label: "GBA Norte", icon: TreePine },
                          { name: "GBA Sur", label: "GBA Sur", icon: Waves },
                          { name: "GBA Oeste", label: "GBA Oeste", icon: Mountain },
                          { name: "La Plata y alrededores", label: "La Plata", icon: Building },
                          { name: "Córdoba", label: "Córdoba", icon: Building },
                          { name: "Rosario", label: "Rosario", icon: Building },
                          { name: "Mendoza", label: "Mendoza", icon: Mountain },
                        ].map((zone) => {
                          const IconComponent = zone.icon;
                          return (
                            <button
                              key={zone.name}
                              onClick={() => {
                                searchProps?.setSelectedZone(zone.name);
                                setMobileSubScreen('main');
                              }}
                              className='flex items-center w-full p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors'
                            >
                              <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-3'>
                                <IconComponent className='h-6 w-6 text-primary' />
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <div className='font-medium text-foreground text-base'>
                                  {zone.label}
                                </div>
                              </div>
                              {searchProps?.selectedZone === zone.name && (
                                <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-2'>
                                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
