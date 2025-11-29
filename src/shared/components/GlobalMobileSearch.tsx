"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useMobile } from "./MobileWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/shared/components/ui/button";
import { X, ArrowLeft, Search, Building, TreePine, Waves, Mountain, Compass, Users, FileText } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";

const popularServices = [
  { name: "Todos", icon: Search },
  { name: "Electricista", icon: Search },
  { name: "Plomero", icon: Search },
  { name: "Carpintero", icon: Search },
  { name: "Pintor", icon: Search },
  { name: "Albañil", icon: Search },
  { name: "Jardinero", icon: Search },
  { name: "Mecánico", icon: Search },
  { name: "Técnico en aires", icon: Search },
  { name: "Gasista", icon: Search },
  { name: "Cerrajero", icon: Search },
  { name: "Soldador", icon: Search },
  { name: "Techista", icon: Search },
];

export function GlobalMobileSearch() {
  const { isMobileSearchOpen, setIsMobileSearchOpen } = useMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<"expertos" | "ofertas">("expertos");
  const [mobileSubScreen, setMobileSubScreen] = useState<'main' | 'service' | 'zone'>('main');
  const navigate = useNavigate();
  const pathname = usePathname();

  const handleClose = () => {
    setIsMobileSearchOpen(false);
    setMobileSubScreen('main');
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedZone("all");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Add service parameter if it's not empty and not "Todos"
    if (searchTerm && searchTerm.trim() !== "" && searchTerm !== "Todos") {
      params.set("servicio", searchTerm.trim());
    }
    
    // Add zone parameter if it's not "all"
    if (selectedZone && selectedZone !== "all") {
      params.set("zona", selectedZone);
    }

    // Add category parameter
    params.set("category", selectedCategory);
    
    const queryString = params.toString();
    const targetUrl = queryString ? `/search?${queryString}` : "/search";
    
    navigate(targetUrl);
    handleClose();
  };

  // Reset to main screen when modal closes
  useEffect(() => {
    if (!isMobileSearchOpen) {
      setMobileSubScreen('main');
    }
  }, [isMobileSearchOpen]);

  if (!isMobileSearchOpen) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop with blur */}
        <motion.div
          className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        />

        {/* Search modal - Bottom Drawer */}
        <motion.div
          className='fixed inset-x-0 bottom-0 z-50 bg-background md:hidden shadow-2xl flex flex-col rounded-t-3xl overflow-hidden'
          style={{ maxHeight: '90vh', height: '90vh' }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
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

                {/* Category Tabs */}
                <div className="flex justify-center border-b border-gray-200 px-4">
                  <button
                    onClick={() => setSelectedCategory("expertos")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors relative top-[1px]",
                      selectedCategory === "expertos" ? "border-black text-black" : "border-transparent text-gray-500"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm">Expertos</span>
                  </button>
                  <button
                    onClick={() => setSelectedCategory("ofertas")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors relative top-[1px]",
                      selectedCategory === "ofertas" ? "border-black text-black" : "border-transparent text-gray-500"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Ofertas</span>
                  </button>
                </div>

                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold'>
                    {selectedCategory === "expertos" ? "Encuentra tu experto" : "Encuentra ofertas"}
                  </h2>
                  <Button
                    variant='ghost'
                    onClick={handleClose}
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
                      {searchTerm && searchTerm.trim() !== ""
                        ? searchTerm
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
                      {selectedZone && selectedZone !== "all"
                        ? selectedZone
                        : "¿En qué zona?"}
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className='p-4 border-t border-gray-200 bg-white'>
                  <div className='flex justify-between items-center gap-3'>
                    <Button
                      variant='ghost'
                      onClick={clearFilters}
                      className='text-sm font-normal underline text-black hover:text-black hover:bg-white px-0'
                    >
                      Limpiar todo
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSearch}
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
                    {popularServices
                      .filter((service) => service?.name && service.name.trim().length > 0)
                      .map((service) => (
                        <button
                          key={service.name}
                          onClick={() => {
                            setSearchTerm(service.name);
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
                      { key: "all", name: "Todas las zonas", description: "Descubrí servicios en todas las zonas", icon: Compass },
                      { key: "Ciudad Autónoma de Buenos Aires", name: "Ciudad Autónoma de Buenos Aires", description: "Ciudad Autónoma de Buenos Aires (CABA)", icon: Building },
                      { key: "GBA Norte", name: "GBA Norte", description: "San Isidro, Vicente López, Tigre y alrededores", icon: TreePine },
                      { key: "GBA Sur", name: "GBA Sur", description: "Quilmes, Avellaneda, Berazategui y zona sur", icon: Waves },
                      { key: "GBA Oeste", name: "GBA Oeste", description: "Morón, La Matanza, zona oeste", icon: Mountain },
                      { key: "La Plata y alrededores", name: "La Plata y alrededores", description: "La Plata y zona de influencia", icon: Building },
                      { key: "Córdoba", name: "Córdoba", description: "Córdoba Capital", icon: Building },
                      { key: "Rosario", name: "Rosario", description: "Rosario, Santa Fe", icon: Building },
                      { key: "Mendoza", name: "Mendoza", description: "Mendoza Capital", icon: Mountain },
                    ].map((zone) => {
                      const IconComponent = zone.icon;
                      return (
                        <button
                          key={zone.key}
                          onClick={() => {
                            setSelectedZone(zone.key);
                            setTimeout(() => {
                              setMobileSubScreen('main');
                            }, 150);
                          }}
                          className='flex items-center w-full p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors'
                        >
                          <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-3'>
                            <IconComponent className='h-6 w-6 text-primary' />
                          </div>
                          <div className='flex-1 text-left min-w-0'>
                            <div className='font-medium text-foreground text-base'>
                              {zone.name}
                            </div>
                            <div className='text-sm text-muted-foreground line-clamp-1'>
                              {zone.description}
                            </div>
                          </div>
                          {selectedZone === zone.key && (
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
    </AnimatePresence>
  );
}
