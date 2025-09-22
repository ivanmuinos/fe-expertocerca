"use client";

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

export interface SharedHeaderProps {
  // Navigation
  showBackButton?: boolean;
  title?: string;

  // Create button
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;

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
  };

  // Styling
  variant?: "default" | "transparent";
}

export function SharedHeader({
  showBackButton = false,
  title,
  showCreateButton = false,
  createButtonText = "Crear",
  onCreateClick,
  variant = "default",
  showSearch = false,
  searchCollapsed = false,
  searchProps,
}: SharedHeaderProps) {
  const navigate = useNavigate();
  const pathname = usePathname();
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const onboardingStatus = useOnboardingStatus();
  const [profile, setProfile] = useState<any>(null);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(
    !searchCollapsed
  );
  const [isServiceSelectorOpen, setIsServiceSelectorOpen] = useState(false);
  const [isZoneSelectorOpen, setIsZoneSelectorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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
        // Error loading profile
      }
    };

    loadProfile();
  }, [user]);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchCollapsed &&
        isDesktopSearchExpanded &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsDesktopSearchExpanded(false);
        setIsServiceSelectorOpen(false);
        setIsZoneSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchCollapsed, isDesktopSearchExpanded]);

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

  const baseHeaderClasses = `
    bg-secondary shadow-sm
  `;

  const handleSearch = () => {
    if (searchProps) {
      const params = new URLSearchParams();
      if (searchProps.searchTerm)
        params.set("servicio", searchProps.searchTerm);
      if (searchProps.selectedZone && searchProps.selectedZone !== "all")
        params.set("zona", searchProps.selectedZone);
      navigate(`/buscar?${params.toString()}`);
    }
    setIsMobileSearchOpen(false);
  };

  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      {/* Overlay when desktop search is expanded */}
      {searchCollapsed && isDesktopSearchExpanded && (
        <div className='fixed inset-0 bg-black/20 z-30' />
      )}

      {/* Mobile-first Airbnb-style header */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 transition-all duration-200 ${
          variant === "transparent"
            ? `bg-background/95 backdrop-blur-sm ${
                isScrolled ? "shadow-sm" : ""
              }`
            : `${baseHeaderClasses} ${isScrolled ? "shadow-md" : "shadow-sm"}`
        }`}
      >
        <div className='w-full px-6 sm:px-8 lg:px-10 pt-2'>
          <div className='flex items-center justify-between h-16 sm:h-18 w-full'>
            {/* Logo a la izquierda */}
            <div className='flex-shrink-0'>
              <h1
                className='text-xl font-semibold text-foreground cursor-pointer'
                onClick={() => navigate("/")}
              >
                <>
                  Experto <span className='text-primary'>Cerca</span>
                </>
              </h1>
            </div>

            {/* Mobile: Minimal search bar (Airbnb style) */}
            {showSearch && searchProps && (
              <div className='md:hidden flex-1 mx-4'>
                <Button
                  variant='ghost'
                  onClick={handleMobileSearchOpen}
                  className='w-full bg-white border border-border/50 rounded-full shadow-sm px-4 py-2 h-12 flex items-center gap-3 hover:shadow-md transition-all'
                >
                  <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                  <div className='text-sm text-foreground truncate'>
                    {searchProps.searchTerm && searchProps.searchTerm !== "all"
                      ? searchProps.searchTerm
                      : "Encuentra a tu experto"}
                  </div>
                </Button>
              </div>
            )}

            {/* Desktop: Centered search bar */}
            {showSearch &&
              searchProps &&
              searchCollapsed &&
              !isDesktopSearchExpanded && (
                <div className='hidden md:flex flex-1 justify-center'>
                  <Button
                    variant='ghost'
                    onClick={() => setIsDesktopSearchExpanded(true)}
                    className='bg-white border border-border/50 rounded-full shadow-sm px-6 py-2 h-12 flex items-center gap-3 hover:shadow-md hover:bg-gray-50 transition-all max-w-md'
                  >
                    <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                    <div className='text-sm text-muted-foreground'>
                      {searchProps.searchTerm &&
                      searchProps.searchTerm !== "all"
                        ? searchProps.searchTerm
                        : "Encuentra a tu experto"}
                    </div>
                  </Button>
                </div>
              )}

            {/* Right section - Airbnb style */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
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
                      {onboardingStatus.needsOnboarding && (
                        <div className='absolute -top-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center'>
                          <div className='h-1.5 w-1.5 bg-white rounded-full animate-pulse' />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='w-48 bg-background border z-50'
                    align='end'
                    forceMount
                  >
                    <div className='flex items-center justify-start gap-2 p-2'>
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
                      onClick={() => navigate("/")}
                      className='text-sm'
                    >
                      <Home className='mr-2 h-4 w-4' />
                      Inicio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/buscar")}
                      className='text-sm'
                    >
                      <Search className='mr-2 h-4 w-4' />
                      Buscar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/perfil")}
                      className='text-sm'
                    >
                      <User className='mr-2 h-4 w-4' />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/mis-publicaciones")}
                      className='text-sm'
                    >
                      <FileText className='mr-2 h-4 w-4' />
                      Mis Publicaciones
                    </DropdownMenuItem>
                    {onboardingStatus.needsOnboarding && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate("/user-type-selection")}
                          className='text-sm bg-orange-50 hover:bg-orange-100 text-orange-700'
                        >
                          <AlertCircle className='mr-2 h-4 w-4' />
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
                      className='text-sm'
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Botón "Convertite en experto" */}
                  <Button
                    onClick={() => navigate("/user-type-selection")}
                    variant='ghost'
                    className='hidden sm:flex text-sm font-medium text-foreground hover:bg-gray-100 rounded-full px-4 py-2 h-10'
                  >
                    Convertite en experto
                  </Button>

                  {/* Menú hamburguesa */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        className='h-10 w-10 rounded-full p-0 hover:bg-gray-200 border border-gray-300'
                      >
                        <Menu className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className='w-48 bg-background border z-50'
                      align='end'
                    >
                      <DropdownMenuItem
                        onClick={() => setIsLoginModalOpen(true)}
                        className='text-sm'
                      >
                        <User className='mr-2 h-4 w-4' />
                        Iniciar sesión
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/user-type-selection")}
                        className='text-sm'
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Registrarse
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/")}
                        className='text-sm'
                      >
                        <Home className='mr-2 h-4 w-4' />
                        Inicio
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/buscar")}
                        className='text-sm'
                      >
                        <Search className='mr-2 h-4 w-4' />
                        Buscar profesionales
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Desktop: Full search section - Airbnb style */}
          {showSearch &&
            searchProps &&
            (!searchCollapsed || isDesktopSearchExpanded) && (
              <div className='hidden md:block pb-6 relative'>
                <div className='bg-white rounded-full shadow-lg border border-gray-200 max-w-2xl mx-auto overflow-visible relative'>
                  <div className='flex items-center'>
                    {/* Servicio section */}
                    <div
                      className='flex-1 px-6 py-4 border-r border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-l-full relative'
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "Service clicked, current state:",
                          isServiceSelectorOpen
                        );
                        setIsServiceSelectorOpen(!isServiceSelectorOpen);
                        setIsZoneSelectorOpen(false);
                      }}
                    >
                      <div className='text-xs font-semibold text-gray-900 mb-1'>
                        Servicio
                      </div>
                      <div className='text-sm text-gray-600'>
                        {searchProps.searchTerm &&
                        searchProps.searchTerm !== "all"
                          ? searchProps.searchTerm
                          : "Buscar servicios"}
                      </div>

                      {/* Service Selector Dropdown */}
                      {isServiceSelectorOpen && (
                        <div className='absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto'>
                          <div className='p-2'>
                            {searchProps.popularServices?.map((service) => (
                              <div
                                key={service.name}
                                className='flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  searchProps.setSearchTerm(service.name);
                                  setIsServiceSelectorOpen(false);
                                }}
                              >
                                <service.icon className='h-5 w-5 text-primary' />
                                <div>
                                  <div className='font-medium text-sm text-gray-900'>
                                    {service.name}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    Servicio profesional
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <div className='p-3 text-center text-gray-500'>
                                No hay servicios disponibles
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zona section */}
                    <div
                      className='flex-1 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer relative'
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "Zone clicked, current state:",
                          isZoneSelectorOpen
                        );
                        setIsZoneSelectorOpen(!isZoneSelectorOpen);
                        setIsServiceSelectorOpen(false);
                      }}
                    >
                      <div className='text-xs font-semibold text-gray-900 mb-1'>
                        Zona
                      </div>
                      <div className='text-sm text-gray-600'>
                        {searchProps.selectedZone &&
                        searchProps.selectedZone !== "all"
                          ? searchProps.selectedZone === "CABA"
                            ? "CABA"
                            : searchProps.selectedZone === "GBA Norte"
                            ? "GBA Norte"
                            : searchProps.selectedZone === "GBA Sur"
                            ? "GBA Sur"
                            : searchProps.selectedZone === "GBA Oeste"
                            ? "GBA Oeste"
                            : searchProps.selectedZone
                          : "Agregar zona"}
                      </div>

                      {/* Zone Selector Dropdown */}
                      {isZoneSelectorOpen && (
                        <div className='absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg'>
                          <div className='p-2'>
                            {[
                              {
                                name: "all",
                                label: "Todas las zonas",
                                description:
                                  "Buscar en toda el área metropolitana",
                              },
                              {
                                name: "CABA",
                                label: "CABA",
                                description: "Ciudad Autónoma de Buenos Aires",
                              },
                              {
                                name: "GBA Norte",
                                label: "GBA Norte",
                                description: "San Isidro, Vicente López, Tigre",
                              },
                              {
                                name: "GBA Sur",
                                label: "GBA Sur",
                                description: "Quilmes, Avellaneda, Berazategui",
                              },
                              {
                                name: "GBA Oeste",
                                label: "GBA Oeste",
                                description: "Morón, La Matanza, zona oeste",
                              },
                            ].map((zone) => (
                              <div
                                key={zone.name}
                                className='flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors'
                                onClick={() => {
                                  searchProps.setSelectedZone(zone.name);
                                  setIsZoneSelectorOpen(false);
                                }}
                              >
                                <div className='h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <div className='h-2 w-2 bg-primary rounded-full'></div>
                                </div>
                                <div>
                                  <div className='font-medium text-sm text-gray-900'>
                                    {zone.label}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {zone.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search button */}
                    <div className='px-2 py-4'>
                      <Button
                        onClick={handleSearch}
                        className='h-12 w-12 rounded-full bg-primary hover:bg-primary/80 flex-shrink-0 p-0 shadow-md transition-all hover:scale-105'
                      >
                        <Search className='h-4 w-4 text-white' />
                      </Button>
                    </div>
                  </div>
                </div>
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
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              onClick={handleMobileSearchClose}
            />

            {/* Search modal - Full Screen */}
            <motion.div
              className='fixed inset-0 z-50 bg-background md:hidden shadow-2xl flex flex-col'
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Mobile search header */}
              <div className='flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm flex-shrink-0'>
                <Button
                  variant='ghost'
                  onClick={handleMobileSearchClose}
                  className='p-2 h-10 w-10 rounded-full hover:bg-gray-100'
                >
                  <X className='h-5 w-5' />
                </Button>
                <h2 className='text-lg font-normal'>Encuentra tu experto</h2>
                <div className='w-10' /> {/* Spacer */}
              </div>

              {/* Mobile search content - Scrollable area */}
              <div className='flex-1 p-6 overflow-y-auto scrollbar-hide'>
                <div className='max-w-sm mx-auto space-y-8'>
                  {/* Combined selectors card */}
                  <motion.div
                    className='bg-white rounded-3xl border border-border/20 p-6 shadow-xl mx-auto'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {/* Service selector */}
                    <div className='space-y-4 mb-6'>
                      <h3 className='text-base font-semibold text-foreground'>
                        ¿Qué servicio necesitas?
                      </h3>
                      <div className='scale-90 origin-center'>
                        <ServiceSelector
                          value={searchProps?.searchTerm || ""}
                          onValueChange={
                            searchProps?.setSearchTerm || (() => {})
                          }
                          popularServices={searchProps?.popularServices || []}
                          isOtherSelectorOpen={isZoneSelectorOpen}
                          onOpenChange={setIsServiceSelectorOpen}
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className='border-t border-border/20 my-6'></div>

                    {/* Zone selector */}
                    <div className='space-y-4'>
                      <h3 className='text-base font-semibold text-foreground'>
                        ¿En qué zona?
                      </h3>
                      <div className='scale-90 origin-center'>
                        <ZoneSelector
                          value={searchProps?.selectedZone || ""}
                          onValueChange={
                            searchProps?.setSelectedZone || (() => {})
                          }
                          isOtherSelectorOpen={isServiceSelectorOpen}
                          onOpenChange={setIsZoneSelectorOpen}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Mobile search footer - Fixed at bottom */}
              <motion.div
                className='p-4 border-t border-border/10 bg-white/95 backdrop-blur-sm flex-shrink-0'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <div className='flex justify-between items-center w-full max-w-sm mx-auto'>
                  {/* Clear filters button */}
                  <Button
                    variant='ghost'
                    onClick={searchProps?.clearFilters || (() => {})}
                    className='text-sm font-normal underline text-black hover:text-black px-0'
                  >
                    Limpiar todo
                  </Button>

                  {/* Search button */}
                  <Button
                    onClick={handleSearch}
                    className='h-10 px-6 text-sm font-normal rounded-2xl bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    Buscar
                  </Button>
                </div>
              </motion.div>
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
