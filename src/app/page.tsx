"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/src/shared/lib/navigation";
import { queryKeys } from "@/src/shared/lib/query-keys";
import { useOptimizedScroll } from "@/src/shared/hooks/use-optimized-scroll";
import dynamic from "next/dynamic";
import {
  Search,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Home as HomeIcon,
  Scissors,
  Car,
  Snowflake,
  Flame,
  Key,
  Zap as ZapIcon,
  Triangle,
} from "lucide-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { useUserRedirect } from "@/src/features/onboarding";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import HomeSkeleton from "@/src/shared/components/HomeSkeleton";
import { HomeMiniNavbar } from "@/src/shared/components/HomeMiniNavbar";
import { HomeSearchBar } from "@/src/shared/components/HomeSearchBar";
import { useMobile } from "@/src/shared/components/MobileWrapper";

// Lazy load heavy components
const ProfessionalCarousel = dynamic(
  () => import("@/src/shared/components/ProfessionalCarousel").then(mod => ({ default: mod.ProfessionalCarousel })),
  { 
    loading: () => <HomeSkeleton />,
    ssr: true 
  }
);

const Footer = dynamic(
  () => import("@/src/shared/components").then(mod => ({ default: mod.Footer })),
  { ssr: false }
);

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const isHeaderCollapsed = useOptimizedScroll(100);
  const { discoverProfessionals, browseProfessionals } =
    useSecureProfessionals();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const { setIsMobileSearchOpen } = useMobile();

  // Handle user redirection for first-time users - runs in background
  const { isCheckingRedirect } = useUserRedirect();

  // React Query: Cache professionals list
  const {
    data: professionals = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.professionals.list(user ? "browse" : "discover"),
    queryFn: async () => {
      const { data, error } = user
        ? await browseProfessionals()
        : await discoverProfessionals();

      if (error) {
        throw new Error(error);
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !authLoading, // Don't fetch until auth is ready
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedZone("all");
  };

  const popularServices = [
    { name: "Todos", icon: Search },
    { name: "Electricista", icon: Zap },
    { name: "Plomero", icon: Wrench },
    { name: "Carpintero", icon: Hammer },
    { name: "Pintor", icon: Paintbrush },
    { name: "Albañil", icon: HomeIcon },
    { name: "Jardinero", icon: Scissors },
    { name: "Mecánico", icon: Car },
    { name: "Técnico en aires", icon: Snowflake },
    { name: "Gasista", icon: Flame },
    { name: "Cerrajero", icon: Key },
    { name: "Soldador", icon: ZapIcon },
    { name: "Techista", icon: Triangle },
  ];

  // Removed - using optimized scroll hook instead

  // Filter by selected zone using work_zone_name when provided
  // Home does NOT filter results; filtering happens only on explicit search click
  const displayedProfessionals = professionals;

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName === selectedService ? "" : serviceName);
  };

  // When clicking the search (lupa), navigate to /buscar with applied params
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm && searchTerm.trim() !== "")
      params.set("servicio", searchTerm.trim());
    if (selectedZone && selectedZone !== "all")
      params.set("zona", selectedZone);
    navigate(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const groupProfessionalsByCategory = () => {
    const groups: { [key: string]: any[] } = {};

    displayedProfessionals.forEach((prof: any) => {
      // Group by work zone when available; fallback to city
      const location =
        (prof as any).work_zone_name ||
        prof.profile_location_city ||
        "Argentina";

      const categoryKey = location;

      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(prof);
    });

    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length);
  };

  const groupedProfessionals = groupProfessionalsByCategory();

  // Combine both loading states to show skeleton only once
  const isInitialLoading = isCheckingRedirect || (loading && professionals.length === 0);

  return (
    <div className='min-h-screen bg-dots-pattern'>
      {/* Mini navbar solo en mobile */}
      <HomeMiniNavbar />
      
      {/* Barra de búsqueda compacta solo en mobile */}
      <HomeSearchBar 
        searchTerm={searchTerm}
        onOpen={() => setIsMobileSearchOpen(true)}
      />

      {/* Header completo solo en desktop */}
      <SharedHeader
        variant='transparent'
        showSearch={true}
        searchCollapsed={true}
        hideOnMobile={true}
        searchProps={{
          searchTerm,
          setSearchTerm,
          selectedZone,
          setSelectedZone,
          popularServices,
          clearFilters,
          onSearch: handleSearch,
        }}
      />

      <section className='px-3 sm:px-4 md:px-6 lg:px-8 pb-6 mt-2 bg-transparent'>
        <div className='max-w-7xl mx-auto'>
          {isInitialLoading ? (
            <HomeSkeleton />
          ) : groupedProfessionals.length > 0 ? (
            <div className='space-y-8'>
              {groupedProfessionals.map(([categoryName, professionals]) => (
                <ProfessionalCarousel
                  key={categoryName}
                  categoryName={categoryName}
                  professionals={professionals}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto space-y-4'>
                <div className='w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  <Search className='h-8 w-8 text-muted-foreground' />
                </div>
                <h3 className='text-xl font-semibold'>
                  No se encontraron profesionales
                </h3>
                <p className='text-muted-foreground'>
                  Intenta modificar tus filtros de búsqueda o explorar
                  diferentes servicios.
                </p>
                <LoadingButton
                  onClick={clearFilters}
                  variant='outline'
                  loading={loading}
                  loadingText='Limpiando'
                >
                  Limpiar filtros
                </LoadingButton>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Spacer to push footer below the fold - full viewport height */}
      <div className='h-screen'></div>

      <Footer />
    </div>
  );
}
