"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/src/shared/lib/navigation";
import { queryKeys } from "@/src/shared/lib/query-keys";
import { useOptimizedScroll } from "@/src/shared/hooks/use-optimized-scroll";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  X,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Input } from "@/src/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { useUserRedirect } from "@/src/features/onboarding";
import { SharedHeader } from "@/src/shared/components/SharedHeader";

import { ProfessionalCarousel } from "@/src/shared/components/ProfessionalCarousel";
import { Footer } from "@/src/shared/components";
import HomeSkeleton from "@/src/shared/components/HomeSkeleton";

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

  if (isCheckingRedirect) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-dots-pattern'>
      <SharedHeader
        variant='transparent'
        showSearch={true}
        searchCollapsed={true}
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
          {loading ? (
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
