"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
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
  AlertCircle
} from "lucide-react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { usePathname } from "next/navigation";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { useOnboardingStatus } from "@/src/features/onboarding";
import { useEffect, useState } from "react";
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
  searchProps?: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedZone: string;
    setSelectedZone: (zone: string) => void;
    popularServices: { name: string; icon: any }[];
    clearFilters: () => void;
  };
  
  // Styling
  variant?: 'default' | 'transparent';
}

export function SharedHeader({ 
  showBackButton = false, 
  title, 
  showCreateButton = false,
  createButtonText = "Crear",
  onCreateClick,
  variant = 'default',
  showSearch = false,
  searchProps
}: SharedHeaderProps) {
  const navigate = useNavigate();
  const pathname = usePathname();
  const { user } = useAuthState();
  const { signOut } = useAuthActions();
  const onboardingStatus = useOnboardingStatus();
  const [profile, setProfile] = useState<any>(null);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isServiceSelectorOpen, setIsServiceSelectorOpen] = useState(false);
  const [isZoneSelectorOpen, setIsZoneSelectorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const data = await apiClient.get('/profiles/current');
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    if (title) return title;
    
    switch (pathname) {
      case '/':
        return 'Experto Cerca';
      case '/buscar':
        return 'Buscar';
      case '/perfil':
        return 'Perfil';
      case '/mis-publicaciones':
        return 'Mis Publicaciones';
      case '/publicar':
        return 'Publicar Servicio';
      case '/onboarding':
        return 'Configurar Perfil';
      default:
        return 'Experto Cerca';
    }
  };

  const baseHeaderClasses = `
    bg-secondary shadow-sm
  `;

  const handleSearch = () => {
    if (searchProps) {
      const params = new URLSearchParams();
      if (searchProps.searchTerm) params.set('servicio', searchProps.searchTerm);
      if (searchProps.selectedZone && searchProps.selectedZone !== 'all') params.set('zona', searchProps.selectedZone);
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
      {/* Mobile-first Airbnb-style header */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${
        variant === 'transparent' 
          ? `bg-background/95 backdrop-blur-sm ${isScrolled ? 'shadow-sm' : ''}` 
          : `${baseHeaderClasses} ${isScrolled ? 'shadow-md' : 'shadow-sm'}`
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-2">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Mobile: Minimal search bar (Airbnb style) */}
            {showSearch && searchProps && (
              <div className="md:hidden flex-1 mr-3">
                <Button
                  variant="ghost"
                  onClick={handleMobileSearchOpen}
                  className="w-full bg-white border-2 border-border/50 rounded-full shadow-elevated px-6 py-4 h-14 flex items-center gap-3 hover:shadow-glow focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                >
                  <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                    <Search className="h-1.5 w-1.5 text-muted-foreground flex-shrink-0" />
                    <div className="text-xs font-medium text-foreground truncate">
                      {searchProps.searchTerm && searchProps.searchTerm !== 'all' 
                        ? searchProps.searchTerm 
                        : 'Encuentra a tu experto'
                      }
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Desktop: Regular header content */}
            <div className="hidden md:flex items-center space-x-3 min-w-0 flex-1">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)}
                  className="p-2 h-8 w-8 flex-shrink-0 hover:bg-muted/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {getPageTitle() === 'Experto Cerca' ? (
                  <>Experto <span className="text-primary">Cerca</span></>
                ) : (
                  getPageTitle()
                )}
              </h1>
            </div>

            {/* Right section - Actions + Avatar */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Create button */}
              {showCreateButton && onCreateClick && (
                <Button
                  onClick={onCreateClick}
                  size="sm"
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{createButtonText}</span>
                </Button>
              )}

              {/* User Avatar */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Onboarding incomplete indicator */}
                      {onboardingStatus.needsOnboarding && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-background border z-50" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="text-sm font-medium">
                          {profile?.full_name || "Usuario"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/')} className="text-sm">
                      <Home className="mr-2 h-4 w-4" />
                      Inicio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/buscar')} className="text-sm">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="text-sm">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/mis-publicaciones')} className="text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Mis Publicaciones
                    </DropdownMenuItem>
                    {/* Onboarding completion reminder */}
                    {onboardingStatus.needsOnboarding && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate('/user-type-selection')} 
                          className="text-sm bg-orange-50 hover:bg-orange-100 text-orange-700"
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Completar registro
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }} 
                      className="text-sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 hover:bg-muted/50"
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Desktop: Full search section */}
          {showSearch && searchProps && (
            <div className="hidden md:block pb-4">
              <div className="bg-white rounded-full shadow-glow border-2 border-border/60 p-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <ServiceSelector 
                      value={searchProps.searchTerm}
                      onValueChange={searchProps.setSearchTerm}
                      popularServices={searchProps.popularServices}
                      isOtherSelectorOpen={isZoneSelectorOpen}
                      onOpenChange={setIsServiceSelectorOpen}
                    />
                  </div>

                  <div className="flex-1">
                    <ZoneSelector 
                      value={searchProps.selectedZone}
                      onValueChange={searchProps.setSelectedZone}
                      isOtherSelectorOpen={isServiceSelectorOpen}
                      onOpenChange={setIsZoneSelectorOpen}
                    />
                  </div>

                  <Button 
                    size="lg"
                    onClick={handleSearch}
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary-dark flex-shrink-0 p-0"
                  >
                    <Search className="h-6 w-6" />
                  </Button>
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              onClick={handleMobileSearchClose}
            />

            {/* Search modal - Full Screen */}
            <motion.div 
              className="fixed inset-0 z-50 bg-background md:hidden shadow-2xl flex flex-col"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Mobile search header */}
              <div className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm flex-shrink-0">
                <Button
                  variant="ghost"
                  onClick={handleMobileSearchClose}
                  className="p-2 h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-normal">Encuentra tu experto</h2>
                <div className="w-10" /> {/* Spacer */}
              </div>

              {/* Mobile search content - Scrollable area */}
              <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                <div className="max-w-sm mx-auto space-y-8">
                  {/* Combined selectors card */}
                  <motion.div 
                    className="bg-white rounded-3xl border border-border/20 p-6 shadow-xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Service selector */}
                    <div className="space-y-4 mb-6">
                      <h3 className="text-base font-semibold text-foreground">¿Qué servicio necesitas?</h3>
                      <div className="scale-90 origin-center">
                        <ServiceSelector 
                          value={searchProps?.searchTerm || ''}
                          onValueChange={searchProps?.setSearchTerm || (() => {})}
                          popularServices={searchProps?.popularServices || []}
                          isOtherSelectorOpen={isZoneSelectorOpen}
                          onOpenChange={setIsServiceSelectorOpen}
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/20 my-6"></div>

                    {/* Zone selector */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-foreground">¿En qué zona?</h3>
                      <div className="scale-90 origin-center">
                        <ZoneSelector 
                          value={searchProps?.selectedZone || ''}
                          onValueChange={searchProps?.setSelectedZone || (() => {})}
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
                className="p-4 border-t border-border/10 bg-white/95 backdrop-blur-sm flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex justify-between items-center w-full max-w-sm mx-auto">
                  {/* Clear filters button */}
                  <Button 
                    variant="ghost"
                    onClick={searchProps?.clearFilters || (() => {})}
                    className="text-sm font-normal underline text-black hover:text-black px-0"
                  >
                    Limpiar todo
                  </Button>
                  
                  {/* Search button */}
                  <Button 
                    onClick={handleSearch}
                    className="h-10 px-6 text-sm font-normal rounded-2xl bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-200"
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