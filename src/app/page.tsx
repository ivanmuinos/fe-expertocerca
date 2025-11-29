"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/src/shared/lib/navigation";
import { queryKeys } from "@/src/shared/lib/query-keys";
import { useOptimizedScroll } from "@/src/shared/hooks/use-optimized-scroll";
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
import { useSecureProfessionals } from "@/src/features/professionals";
import { useServiceRequests } from "@/src/features/service-requests/hooks/useServiceRequests";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { useUserRedirect } from "@/src/features/onboarding";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { CategoryTabs } from "@/src/shared/components/CategoryTabs";
import { DesktopCategoryTabs } from "@/src/shared/components/DesktopCategoryTabs";
import HomeSkeleton from "@/src/shared/components/HomeSkeleton";
import { HomeMiniNavbar } from "@/src/shared/components/HomeMiniNavbar";
import { HomeSearchBar } from "@/src/shared/components/HomeSearchBar";
import { useMobile } from "@/src/shared/components/MobileWrapper";
import { ProfessionalCarousel } from "@/src/shared/components/ProfessionalCarousel";
import { ServiceRequestCarousel } from "@/src/shared/components/ServiceRequestCarousel";
import { Footer, FloatingPublishButton } from "@/src/shared/components";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"expertos" | "ofertas">("expertos");
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

  // React Query: Cache service requests list - only fetch when in "ofertas" tab
  const {
    data: serviceRequests = [],
    isLoading: loadingRequests,
    error: requestsError,
  } = useServiceRequests({
    status: 'open',
    enabled: selectedCategory === 'ofertas'
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

  const groupRequestsByCity = () => {
    const groups: { [key: string]: any[] } = {};

    serviceRequests.forEach((req: any) => {
      const cityKey = req.location_city || "Argentina";

      if (!groups[cityKey]) {
        groups[cityKey] = [];
      }
      groups[cityKey].push(req);
    });

    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length);
  };

  const groupedProfessionals = groupProfessionalsByCategory();
  const groupedRequests = groupRequestsByCity();

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
        centerContent={
          <DesktopCategoryTabs 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        }
      />

      {/* Category tabs - mobile only, below search bar */}
      <CategoryTabs 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <section className='px-3 sm:px-4 md:px-6 lg:px-8 pb-6 mt-8 sm:mt-12 bg-transparent'>
        <div className='max-w-7xl mx-auto'>
          {isInitialLoading ? (
            <HomeSkeleton />
          ) : selectedCategory === "expertos" ? (
            groupedProfessionals.length > 0 ? (
              <div className='space-y-8'>
                {/* Marketing header for experts section */}
                {/* Mobile version - Card style */}
                <div className='sm:hidden mb-6'>
                  <div
                    className='bg-white rounded-2xl p-4 shadow-md border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform'
                    onClick={() => navigate('/search')}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-3 flex-1'>
                        {/* Stacked Preview thumbnails - mobile */}
                        <div className='relative w-14 h-14 flex-shrink-0'>
                          <div className='absolute top-0 left-0 w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-sm z-10'>
                            {groupedProfessionals[0]?.[1]?.[0]?.main_portfolio_image ? (
                              <img
                                src={groupedProfessionals[0][1][0].main_portfolio_image}
                                alt="Preview"
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-100' />
                            )}
                          </div>
                          <div className='absolute top-3 left-3 w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-sm'>
                            {groupedProfessionals[0]?.[1]?.[1]?.main_portfolio_image ? (
                              <img
                                src={groupedProfessionals[0][1][1].main_portfolio_image}
                                alt="Preview"
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-100' />
                            )}
                          </div>
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h2 className='text-base font-semibold text-gray-900 mb-1 leading-tight'>
                            Encontrá los mejores expertos cerca tuyo
                          </h2>
                          <p className='text-xs text-gray-600 line-clamp-2'>
                            Profesionales verificados listos para ayudarte
                          </p>
                        </div>
                      </div>

                      <div className='flex-shrink-0 p-1.5'>
                        <svg className='w-4 h-4 text-gray-900' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop version - Border style */}
                <div className='hidden sm:block border-b border-gray-200 pb-6 mb-6 sm:pb-8 sm:mb-8'>
                  <div className='flex items-center justify-center gap-8'>
                    {/* Stacked Preview thumbnails */}
                    <div className='relative w-20 h-20'>
                      <div className='absolute top-0 left-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md z-10'>
                        {groupedProfessionals[0]?.[1]?.[0]?.main_portfolio_image ? (
                          <img
                            src={groupedProfessionals[0][1][0].main_portfolio_image}
                            alt="Preview"
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-100' />
                        )}
                      </div>
                      <div className='absolute top-4 left-4 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md'>
                        {groupedProfessionals[0]?.[1]?.[1]?.main_portfolio_image ? (
                          <img
                            src={groupedProfessionals[0][1][1].main_portfolio_image}
                            alt="Preview"
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-100' />
                        )}
                      </div>
                    </div>

                    <div className='text-center'>
                      <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                        Encontrá los mejores expertos cerca tuyo
                      </h2>
                      <p className='text-sm text-gray-600'>
                        Profesionales verificados listos para ayudarte con cualquier trabajo
                      </p>
                    </div>
                  </div>
                </div>

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
                </div>
              </div>
            )
          ) : (
            loadingRequests ? (
              <HomeSkeleton />
            ) : groupedRequests.length > 0 ? (
              <div className='space-y-8'>
                {/* Marketing header for offers section */}
                {/* Mobile version - Card style */}
                <div className='sm:hidden mb-6'>
                  <div
                    className='bg-white rounded-2xl p-4 shadow-md border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform'
                    onClick={() => {
                      if (!user) {
                        window.dispatchEvent(new CustomEvent("openLoginModal"));
                      } else {
                        navigate('/requests/new/problem');
                      }
                    }}
                  >
                    <div className='flex items-center gap-3 flex-1'>
                        {/* Stacked Preview thumbnails - mobile */}
                        <div className='relative w-14 h-14 flex-shrink-0'>
                          <div className='absolute top-0 left-0 w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-sm z-10'>
                            {groupedRequests[0]?.[1]?.[0]?.photos?.[0] ? (
                              <img
                                src={groupedRequests[0][1][0].photos[0]}
                                alt="Preview"
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full bg-gradient-to-br from-primary/20 to-primary/10' />
                            )}
                          </div>
                          <div className='absolute top-3 left-3 w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-sm'>
                            {groupedRequests[0]?.[1]?.[1]?.photos?.[0] ? (
                              <img
                                src={groupedRequests[0][1][1].photos[0]}
                                alt="Preview"
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full bg-gradient-to-br from-primary/10 to-primary/20' />
                            )}
                          </div>
                        </div>

                      <div className='flex-1 min-w-0'>
                        <h2 className='text-base font-semibold text-gray-900 mb-1 leading-tight'>
                          ¿Necesitás un servicio? Publicá tu solicitud
                        </h2>
                        <p className='text-xs text-gray-600 line-clamp-2'>
                          Los mejores profesionales te contactarán
                        </p>
                      </div>

                      <div className='flex-shrink-0 p-1.5'>
                        <svg className='w-4 h-4 text-gray-900' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop version - Border style */}
                <div className='hidden sm:block border-b border-gray-200 pb-6 mb-6 sm:pb-8 sm:mb-8'>
                  <div className='flex items-center justify-center gap-8'>
                    {/* Stacked Preview thumbnails */}
                    <div className='relative w-20 h-20'>
                      <div className='absolute top-0 left-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md z-10'>
                        {groupedRequests[0]?.[1]?.[0]?.photos?.[0] ? (
                          <img
                            src={groupedRequests[0][1][0].photos[0]}
                            alt="Preview"
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gradient-to-br from-primary/20 to-primary/10' />
                        )}
                      </div>
                      <div className='absolute top-4 left-4 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md'>
                        {groupedRequests[0]?.[1]?.[1]?.photos?.[0] ? (
                          <img
                            src={groupedRequests[0][1][1].photos[0]}
                            alt="Preview"
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gradient-to-br from-primary/10 to-primary/20' />
                        )}
                      </div>
                    </div>

                    <div className='text-center'>
                      <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                        ¿Necesitás un servicio?{' '}
                        <button
                          onClick={() => {
                            if (!user) {
                              window.dispatchEvent(new CustomEvent("openLoginModal"));
                            } else {
                              navigate('/requests/new');
                            }
                          }}
                          className='text-primary hover:text-primary-dark underline transition-colors cursor-pointer'
                        >
                          Publicá tu solicitud
                        </button>
                      </h2>
                      <p className='text-sm text-gray-600'>
                        Los mejores profesionales te contactarán para resolver lo que necesites
                      </p>
                    </div>
                  </div>
                </div>

                {groupedRequests.map(([cityName, requests]) => (
                  <ServiceRequestCarousel
                    key={cityName}
                    categoryName={cityName}
                    requests={requests}
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
                    No hay ofertas disponibles
                  </h3>
                  <p className='text-muted-foreground'>
                    Sé el primero en publicar una oferta de trabajo.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
