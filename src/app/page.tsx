"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
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
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from '@/src/features/auth'
import { useUserRedirect } from "@/src/features/onboarding";
import { SharedHeader } from "@/src/shared/components/SharedHeader";

import { ProfessionalCarousel } from "@/src/shared/components/ProfessionalCarousel";

export default function HomePage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { loading, discoverProfessionals, browseProfessionals } =
    useSecureProfessionals();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthState();
  const navigate = useNavigate();

  // Handle user redirection for first-time users - runs in background
  const { isCheckingRedirect } = useUserRedirect();

  const popularServices = [
    { name: "Electricista", icon: Zap },
    { name: "Plomero", icon: Wrench },
    { name: "Carpintero", icon: Hammer },
    { name: "Pintor", icon: Paintbrush },
    { name: "Albañil", icon: HomeIcon },
    { name: "Jardinero", icon: Scissors },
    { name: "Mecánico", icon: Car },
    { name: "Técnico AC", icon: Snowflake },
    { name: "Gasista", icon: Flame },
    { name: "Cerrajero", icon: Key },
    { name: "Soldador", icon: ZapIcon },
    { name: "Techista", icon: Triangle },
  ];

  const loadProfessionals = useCallback(async () => {
    const { data, error } = user
      ? await browseProfessionals()
      : await discoverProfessionals();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales",
        variant: "destructive",
      });
      return;
    }

    setProfessionals(data || []);
  }, [user, browseProfessionals, discoverProfessionals, toast]);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderCollapsed(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // For now, don't filter - just show all professionals
  const displayedProfessionals = professionals;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedZone("all");
  };

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName === selectedService ? "" : serviceName);
  };

  // Group professionals by category for display
  const groupProfessionalsByCategory = () => {
    const groups: { [key: string]: any[] } = {};

    displayedProfessionals.forEach((prof) => {
      const location =
        prof.profile_location_city && prof.profile_location_province
          ? `${prof.profile_location_city}, ${prof.profile_location_province}`
          : prof.profile_location_province || "Argentina";

      const categoryKey = `${prof.trade_name} en ${location}`;

      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(prof);
    });

    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length);
  };

  const groupedProfessionals = groupProfessionalsByCategory();

  // Show loading screen while checking for redirects
  if (isCheckingRedirect) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <SharedHeader
        variant='transparent'
        showSearch={true}
        searchProps={{
          searchTerm,
          setSearchTerm,
          selectedZone,
          setSelectedZone,
          popularServices,
          clearFilters,
        }}
      />

      {/* Results Section - Mobile first */}
      <section className='px-3 sm:px-4 md:px-6 lg:px-8 pb-6 pt-2'>
        <div className='max-w-7xl mx-auto'>
          {loading ? (
            <div className='space-y-6'>
              {[...Array(3)].map((_, categoryIndex) => (
                <div key={categoryIndex} className='space-y-3'>
                  <div className='h-5 bg-muted rounded w-48 animate-pulse' />
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className='animate-pulse'>
                        <CardContent className='p-3 sm:p-4'>
                          <div className='space-y-3'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-10 h-10 bg-muted rounded-full' />
                              <div className='space-y-2 flex-1'>
                                <div className='h-3 bg-muted rounded w-3/4' />
                                <div className='h-2 bg-muted rounded w-1/2' />
                              </div>
                            </div>
                            <div className='h-16 bg-muted rounded' />
                            <div className='flex gap-1'>
                              <div className='h-5 bg-muted rounded-full w-12' />
                              <div className='h-5 bg-muted rounded-full w-16' />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                <Button onClick={clearFilters} variant='outline'>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}