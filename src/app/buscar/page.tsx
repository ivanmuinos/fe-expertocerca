"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  X,
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Badge } from "@/src/shared/components/ui/badge";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import ProfessionalMiniDetail from "@/src/shared/components/ProfessionalMiniDetail";
import PublicationCard from "@/src/shared/components/PublicationCard";
import { Footer } from "@/src/shared/components";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile } from "@/src/shared/components/MobileWrapper";

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

function BuscarPageContent() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    Professional[]
  >([]);
  // Selected values (what user picks from dropdowns)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  // Applied values (what's actually used for filtering)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedSelectedZone, setAppliedSelectedZone] = useState("all");
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const searchParams = useSearchParams();
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
    setSearchTerm("");
    setSelectedZone("all");
    setAppliedSearchTerm("");
    setAppliedSelectedZone("all");
  };

  const handleSearch = () => {
    console.log("Search button clicked, applying filters:", {
      searchTerm,
      selectedZone,
    });
    // Si el término de búsqueda es "Todos", tratarlo como vacío
    setAppliedSearchTerm(searchTerm === "Todos" ? "" : searchTerm);
    setAppliedSelectedZone(selectedZone);
  };

  // Read and apply URL parameters whenever they change
  useEffect(() => {
    const servicio = searchParams.get("servicio") || "";
    const zona = searchParams.get("zona") || "all";
    
    console.log("URL params changed:", { 
      servicio, 
      zona, 
      allParams: searchParams.toString(),
      timestamp: new Date().toISOString()
    });
    
    setSearchTerm(servicio);
    setSelectedZone(zona);
    // Apply filters immediately when coming from URL
    setAppliedSearchTerm(servicio);
    setAppliedSelectedZone(zona);
    
    console.log("Applied filters from URL:", { servicio, zona });
  }, [searchParams]);

  const loadProfessionals = useCallback(async () => {
    console.log("Loading professionals...", { isAuthenticated: !!user });
    
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
        ...new Set(data.map((p: any) => p.specialty).filter(Boolean)),
      ];
      const tradeNames = [
        ...new Set(data.map((p) => p.trade_name).filter(Boolean)),
      ];
      const skills = [...new Set(data.flatMap((p) => p.profile_skills || []))];

      console.log("=== AVAILABLE DATA IN DATABASE ===");
      console.log("Available specialties:", specialties);
      console.log("Available trade names:", tradeNames);
      console.log("Available skills:", skills);
      console.log("==================================");

      // Log each professional's searchable fields
      console.log("All professionals with searchable fields:");
      data.forEach((p: any, index: number) => {
        console.log(`Professional ${index + 1}:`, {
          trade_name: p.trade_name,
          specialty: p.specialty,
          skills: p.profile_skills,
          full_name: p.profile_full_name
        });
      });
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
    if (appliedSearchTerm && appliedSearchTerm.trim() !== "") {
      console.log("Filtering by search term:", appliedSearchTerm);
      const searchLower = appliedSearchTerm.toLowerCase();
      
      filtered = filtered.filter((prof) => {
        const tradeName = prof.trade_name?.toLowerCase() || "";
        const fullName = prof.profile_full_name?.toLowerCase() || "";
        const specialty = (prof as any).specialty?.toLowerCase() || "";
        const skills = prof.profile_skills || [];
        
        const matchesName = tradeName.includes(searchLower);
        const matchesFullName = fullName.includes(searchLower);
        const matchesSkills = skills.some((skill: string) =>
          skill.toLowerCase().includes(searchLower)
        );
        const matchesSpecialty = specialty.includes(searchLower);

        const matches =
          matchesName || matchesFullName || matchesSkills || matchesSpecialty;

        console.log("Checking professional:", {
          trade_name: prof.trade_name,
          specialty: (prof as any).specialty,
          profile_skills: prof.profile_skills,
          searchTerm: appliedSearchTerm,
          matchesName,
          matchesFullName,
          matchesSkills,
          matchesSpecialty,
          finalMatch: matches
        });

        return matches;
      });
      console.log("Filtered results:", filtered.length, "out of", professionals.length);
    }

    // Filtro por zona (por work_zone_name exacto; fallback ciudad/provincia contiene)
    if (appliedSelectedZone && appliedSelectedZone !== "all") {
      filtered = filtered.filter((prof: any) => {
        const zone = (prof as any).work_zone_name?.toLowerCase?.().trim() || "";
        const city =
          (prof as any).profile_location_city?.toLowerCase?.().trim() || "";
        const province =
          (prof as any).profile_location_province?.toLowerCase?.().trim() || "";
        const needle = appliedSelectedZone.toLowerCase().trim();
        if (zone) return zone === needle;
        return city.includes(needle) || province.includes(needle);
      });
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
    // Bloquear scroll del body cuando se abre el modal en mobile
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    }
  };

  const handleCloseModal = () => {
    setSelectedProfessional(null);
    // Restaurar scroll del body
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
    }
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
          <div className='p-3 sm:p-6'>
            <div className='flex items-center justify-between mb-4 sm:mb-6'>
              <h2 className='text-sm sm:text-lg font-normal text-muted-foreground'>
                {professionalsLoading ? (
                  <span className='inline-block w-24 sm:w-32 h-4 sm:h-5 bg-muted animate-pulse rounded' />
                ) : (
                  `${filteredProfessionals.length} profesionales`
                )}
              </h2>
              {appliedSearchTerm && appliedSearchTerm.trim() !== "" && (
                <Badge variant='secondary' className='text-xs'>Servicio: {appliedSearchTerm}</Badge>
              )}
            </div>

            {professionalsLoading ? (
              <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='cursor-pointer'>
                    <div className='bg-white rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden'>
                      {/* Image skeleton - aspect-square */}
                      <div className='aspect-square relative bg-muted animate-pulse' />

                      {/* Content skeleton */}
                      <div className='p-3'>
                        <div className='space-y-2'>
                          {/* Title */}
                          <div className='h-5 bg-muted rounded w-3/4 animate-pulse' />

                          {/* Specialty */}
                          <div className='flex items-center gap-1.5'>
                            <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                            <div className='h-4 bg-muted rounded w-20 animate-pulse' />
                          </div>

                          {/* Location */}
                          <div className='flex items-center gap-1'>
                            <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                            <div className='h-3 bg-muted rounded w-2/3 animate-pulse' />
                          </div>

                          {/* Skills badges */}
                          <div className='flex flex-wrap gap-1 pt-1'>
                            <div className='h-5 bg-muted rounded-full w-16 animate-pulse' />
                            <div className='h-5 bg-muted rounded-full w-20 animate-pulse' />
                          </div>

                          {/* Price */}
                          <div className='pt-1'>
                            <div className='h-5 bg-muted rounded w-24 animate-pulse' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'>
                {filteredProfessionals.map((professional) => (
                  <PublicationCard
                    key={professional.id}
                    professional={professional}
                    isSelected={selectedProfessional?.id === professional.id}
                    onClick={handleProfessionalClick}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-8 sm:py-12 space-y-3 sm:space-y-4'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  <Search className='h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-base sm:text-lg font-semibold mb-1 sm:mb-2'>
                    No se encontraron profesionales
                  </h3>
                  <p className='text-sm sm:text-base text-muted-foreground px-4'>
                    Intenta modificar tus filtros de búsqueda o explora otras
                    zonas.
                  </p>
                </div>
                <LoadingButton
                  variant='outline'
                  onClick={clearFilters}
                  loading={professionalsLoading}
                  loadingText='Limpiando'
                  className='text-sm'
                >
                  Limpiar filtros
                </LoadingButton>
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
        <AnimatePresence>
          {selectedProfessional && (
            <motion.div
              className='lg:hidden fixed inset-0 z-[60] flex items-end'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Backdrop */}
              <motion.div
                className='absolute inset-0 bg-black/60 backdrop-blur-sm'
                onClick={handleCloseModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal content */}
              <motion.div
                className='bg-background rounded-t-3xl max-h-[85vh] w-full overflow-hidden relative shadow-2xl'
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
              >
                {/* Drag handle */}
                <div className='w-full flex justify-center pt-3 pb-2'>
                  <div className='w-10 h-1 bg-gray-300 rounded-full' />
                </div>

                <div className='sticky top-0 bg-background/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10'>
                  <h3 className='font-semibold text-lg'>
                    Información del profesional
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleCloseModal}
                    className='h-9 w-9 p-0 rounded-full hover:bg-gray-100'
                  >
                    <X className='h-5 w-5' />
                  </Button>
                </div>
                <div className='overflow-y-auto scrollbar-hide max-h-[calc(85vh-4rem)]'>
                  <ProfessionalMiniDetail professional={selectedProfessional} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer to ensure footer is only visible on scroll */}
      <div className='h-20'></div>

      <Footer />
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className='bg-background min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center animate-pulse'>
            <Search className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground'>Cargando profesionales...</p>
        </div>
      </div>
    }>
      <BuscarPageContent />
    </Suspense>
  );
}
