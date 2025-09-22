"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Wrench,
  Hammer,
  Paintbrush,
  Zap,
  Droplets,
  Scissors,
  Car,
  Home,
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { Badge } from "@/src/shared/components/ui/badge";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import ProfessionalMiniDetail from "@/src/shared/components/ProfessionalMiniDetail";
import ProfessionalCard from "@/src/shared/components/ProfessionalCard";
import { Footer } from "@/src/shared/components";

interface Professional {
  id: string;
  trade_name: string;
  description?: string;
  specialty?: string;
  years_experience?: number;
  user_id: string;
  profile_full_name: string;
  profile_location_city?: string;
  profile_location_province?: string;
  profile_skills?: string[];
  profile_avatar_url?: string;
  has_contact_info?: boolean;
  whatsapp_phone?: string;
  hourly_rate?: number;
  main_portfolio_image?: string;
}

export default function BuscarPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    Professional[]
  >([]);
  // Selected values (what user picks from dropdowns)
  const [searchTerm, setSearchTerm] = useState("Todos");
  const [selectedZone, setSelectedZone] = useState("all");

  // Applied values (what's actually used for filtering)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("Todos");
  const [appliedSelectedZone, setAppliedSelectedZone] = useState("all");
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );
  const {
    loading: professionalsLoading,
    discoverProfessionals,
    browseProfessionals,
  } = useSecureProfessionals();
  const { user } = useAuthState();
  const { toast } = useToast();

  // Popular services for autocomplete
  const popularServices = [
    { name: "Todos", icon: Search },
    { name: "Electricista", icon: Zap },
    { name: "Plomero", icon: Droplets },
    { name: "Pintor", icon: Paintbrush },
    { name: "Carpintero", icon: Hammer },
    { name: "Técnico en aires", icon: Wrench },
    { name: "Peluquero", icon: Scissors },
    { name: "Mecánico", icon: Car },
    { name: "Limpieza", icon: Home },
  ];

  const clearFilters = () => {
    setSearchTerm("Todos");
    setSelectedZone("all");
    setAppliedSearchTerm("Todos");
    setAppliedSelectedZone("all");
  };

  const handleSearch = () => {
    console.log("Search button clicked, applying filters:", {
      searchTerm,
      selectedZone,
    });
    setAppliedSearchTerm(searchTerm);
    setAppliedSelectedZone(selectedZone);
  };

  // Initialize search params client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  // Obtener parámetros de la URL
  useEffect(() => {
    if (!searchParams) return;
    const servicio = searchParams.get("servicio") || "Todos";
    const zona = searchParams.get("zona") || "all";
    setSearchTerm(servicio);
    setSelectedZone(zona);
    // Si vienen de URL, aplicar inmediatamente
    setAppliedSearchTerm(servicio);
    setAppliedSelectedZone(zona);
  }, [searchParams]);

  const loadProfessionals = useCallback(async () => {
    const { data, error } = user
      ? await browseProfessionals()
      : await discoverProfessionals();

    if (error) {
      console.error("Error loading professionals:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales",
        variant: "destructive",
      });
      return;
    }

    console.log("Raw API response:", data);
    console.log("Number of professionals loaded:", data?.length || 0);

    // Log all unique specialties and trade names to see what's available
    if (data && data.length > 0) {
      const specialties = [
        ...new Set(data.map((p) => p.specialty).filter(Boolean)),
      ];
      const tradeNames = [
        ...new Set(data.map((p) => p.trade_name).filter(Boolean)),
      ];
      const skills = [...new Set(data.flatMap((p) => p.profile_skills || []))];

      console.log("Available specialties:", specialties);
      console.log("Available trade names:", tradeNames);
      console.log("Available skills:", skills);

      // Check specifically for "Carpintero" related terms
      const carpinteroRelated = data.filter(
        (p) =>
          p.specialty?.toLowerCase().includes("carpint") ||
          p.trade_name?.toLowerCase().includes("carpint") ||
          p.profile_skills?.some((skill) =>
            skill.toLowerCase().includes("carpint")
          )
      );
      console.log("Carpintero-related professionals:", carpinteroRelated);
    }

    setProfessionals((data || []) as Professional[]);
  }, [user, browseProfessionals, discoverProfessionals, toast]);

  const applyFilters = useCallback(() => {
    let filtered = professionals;

    console.log("Applying filters:", {
      appliedSearchTerm,
      appliedSelectedZone,
    });
    console.log("Total professionals:", professionals.length);
    console.log("Sample professional data:", professionals[0]);

    // Filtro por término de búsqueda (servicio)
    if (appliedSearchTerm && appliedSearchTerm !== "Todos") {
      console.log("Filtering by search term:", appliedSearchTerm);
      filtered = filtered.filter((prof) => {
        const matchesName = prof.trade_name
          .toLowerCase()
          .includes(appliedSearchTerm.toLowerCase());
        const matchesFullName = prof.profile_full_name
          .toLowerCase()
          .includes(appliedSearchTerm.toLowerCase());
        const matchesSkills = prof.profile_skills?.some((skill: string) =>
          skill.toLowerCase().includes(appliedSearchTerm.toLowerCase())
        );
        const matchesSpecialty = prof.specialty
          ?.toLowerCase()
          .includes(appliedSearchTerm.toLowerCase());

        const matches =
          matchesName || matchesFullName || matchesSkills || matchesSpecialty;

        if (matches) {
          console.log("Match found:", {
            trade_name: prof.trade_name,
            specialty: prof.specialty,
            profile_skills: prof.profile_skills,
            matchesName,
            matchesFullName,
            matchesSkills,
            matchesSpecialty,
          });
        }

        return matches;
      });
      console.log("Filtered results:", filtered.length);
    }

    // Filtro por zona
    if (appliedSelectedZone && appliedSelectedZone !== "all") {
      filtered = filtered.filter(
        (prof) =>
          prof.profile_location_city
            ?.toLowerCase()
            .includes(appliedSelectedZone.toLowerCase()) ||
          prof.profile_location_province
            ?.toLowerCase()
            .includes(appliedSelectedZone.toLowerCase())
      );
    }

    setFilteredProfessionals(filtered);
  }, [professionals, appliedSearchTerm, appliedSelectedZone]);

  useEffect(() => {
    loadProfessionals();
  }, [user, loadProfessionals]);

  useEffect(() => {
    console.log("Effect triggered - applying filters with:", {
      professionalsCount: professionals.length,
      appliedSearchTerm,
      appliedSelectedZone,
    });
    applyFilters();
  }, [professionals, appliedSearchTerm, appliedSelectedZone, applyFilters]);

  const handleProfessionalClick = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  return (
    <div className='bg-background'>
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

      {/* Layout tipo Airbnb */}
      <div className='min-h-screen flex flex-col lg:flex-row'>
        {/* Grid de profesionales - 70% width on desktop */}
        <div className='flex-1 lg:w-[70%] overflow-y-auto scrollbar-hide bg-background'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold'>
                {filteredProfessionals.length} profesionales
              </h2>
              {appliedSearchTerm && appliedSearchTerm !== "Todos" && (
                <Badge variant='secondary'>Servicio: {appliedSearchTerm}</Badge>
              )}
            </div>

            {professionalsLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='animate-pulse'>
                    <div className='aspect-square bg-muted rounded-xl mb-3' />
                    <div className='space-y-2 p-3'>
                      <div className='h-4 bg-muted rounded w-3/4' />
                      <div className='h-3 bg-muted rounded w-1/2' />
                      <div className='h-3 bg-muted rounded w-full' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    isSelected={selectedProfessional?.id === professional.id}
                    onClick={handleProfessionalClick}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12 space-y-4'>
                <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  <Search className='h-8 w-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>
                    No se encontraron profesionales
                  </h3>
                  <p className='text-muted-foreground'>
                    Intenta modificar tus filtros de búsqueda o explora otras
                    zonas.
                  </p>
                </div>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchTerm("Todos");
                    setSelectedZone("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Panel de detalle - Hidden en mobile, visible en desktop, fixed width 30% */}
        <div className='hidden lg:block lg:w-[30%] bg-white border-l border-gray-200'>
          <div className='h-full w-full overflow-y-auto scrollbar-hide'>
            <ProfessionalMiniDetail professional={selectedProfessional} />
          </div>
        </div>

        {/* Modal de detalle para mobile */}
        {selectedProfessional && (
          <div className='lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end'>
            <div className='bg-background rounded-t-2xl max-h-[80vh] w-full overflow-hidden'>
              <div className='sticky top-0 bg-background border-b p-3 flex justify-between items-center'>
                <h3 className='font-semibold'>Información del profesional</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedProfessional(null)}
                  className='h-8 w-8 p-0'
                >
                  ✕
                </Button>
              </div>
              <div className='overflow-y-auto scrollbar-hide'>
                <ProfessionalMiniDetail professional={selectedProfessional} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer to ensure footer is only visible on scroll */}
      <div className='h-20'></div>

      <Footer />
    </div>
  );
}
