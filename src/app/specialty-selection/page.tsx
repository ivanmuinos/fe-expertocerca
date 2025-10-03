"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useRef, useEffect, useState } from "react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Button } from "@/src/shared/components/ui/button";
import {
  Star,
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Wrench,
  Scissors,
  Car,
  Home,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import { OnboardingProgressBar } from "@/src/shared/components/OnboardingProgressBar";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";

// Services data from existing app
const popularServices = [
  {
    name: "Electricista",
    icon: Zap,
    description: "Instalaciones y reparaciones eléctricas",
  },
  {
    name: "Plomero",
    icon: Droplets,
    description: "Instalaciones y reparaciones de plomería",
  },
  {
    name: "Pintor",
    icon: Paintbrush,
    description: "Pintura interior y exterior",
  },
  {
    name: "Carpintero",
    icon: Hammer,
    description: "Muebles y estructuras de madera",
  },
  {
    name: "Técnico en aires",
    icon: Wrench,
    description: "Instalación y reparación de A/C",
  },
  {
    name: "Peluquero",
    icon: Scissors,
    description: "Servicios de belleza y peluquería",
  },
  {
    name: "Mecánico",
    icon: Car,
    description: "Reparación y mantenimiento vehicular",
  },
  {
    name: "Limpieza",
    icon: Home,
    description: "Servicios de limpieza doméstica",
  },
];

// Work zones for Argentina
const workZones = [
  { name: "CABA", fullName: "Ciudad Autónoma de Buenos Aires", icon: MapPin },
  {
    name: "Zona Norte GBA",
    fullName: "Vicente López, San Isidro, Tigre",
    icon: MapPin,
  },
  {
    name: "Zona Oeste GBA",
    fullName: "Morón, Hurlingham, Ituzaingó",
    icon: MapPin,
  },
  {
    name: "Zona Sur GBA",
    fullName: "Avellaneda, Quilmes, Berazategui",
    icon: MapPin,
  },
  { name: "La Plata", fullName: "La Plata y alrededores", icon: MapPin },
  { name: "Córdoba Capital", fullName: "Ciudad de Córdoba", icon: MapPin },
  { name: "Rosario", fullName: "Rosario, Santa Fe", icon: MapPin },
  { name: "Mendoza", fullName: "Gran Mendoza", icon: MapPin },
];

// Helper function to determine initial section from URL
const getInitialSpecialtySection = (location: { search: string }, selectedSpecialty: any): "specialty" | "zone" => {
  const searchParams = new URLSearchParams(location.search);
  const sectionParam = searchParams.get('section');

  if (sectionParam === 'zone' && selectedSpecialty) {
    return 'zone';
  }
  return 'specialty';
};

export default function SpecialtySelectionPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ search: string } | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  const {
    selectedSpecialty,
    selectedWorkZone,
    setSpecialty,
    setWorkZone,
    markStepCompleted,
  } = useOnboarding();

  const [currentSection, setCurrentSection] = useState<"specialty" | "zone">("specialty");
  const [isLoading, setIsLoading] = useState(false);

  const { setCurrentStep, setSpecialtySection } = useOnboardingProgress();

  // Initialize location client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocation({ search: window.location.search });
    }
  }, []);

  // Handle navigation to specific section based on URL params
  useEffect(() => {
    if (!location) return;

    const targetSection = getInitialSpecialtySection(location, selectedSpecialty);

    // Update section and progress
    setCurrentSection(targetSection);
    setSpecialtySection(targetSection);
    setCurrentStep(OnboardingStep.SPECIALTY_SELECTION);

    // Scroll to correct section immediately if needed
    if (targetSection === 'zone' && zoneRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        zoneRef.current?.scrollIntoView({
          behavior: "instant", // Use instant to avoid glitch
          block: "center",
        });
      });
    }
  }, [setCurrentStep, setSpecialtySection, location, selectedSpecialty]);

  // No auto-scroll based on specialty selection - only manual scroll via Continue button

  const handleBack = () => {
    // If we're in the zone section, scroll back to specialty section
    if (currentSection === "zone") {
      setWorkZone(""); // Clear zone selection
      setCurrentSection("specialty"); // Set section first
      setSpecialtySection("specialty"); // Update progress
      specialtyRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      // If we're in the specialty section, go back to professional intro
      navigate("/professional-intro");
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  const handleContinue = async () => {
    // If we're in the specialty section and have selected a specialty, scroll to zone
    if (currentSection === "specialty" && selectedSpecialty && zoneRef.current) {
      zoneRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setCurrentSection("zone");
      setSpecialtySection("zone"); // Update progress
    } else if (currentSection === "zone" && selectedSpecialty && selectedWorkZone) {
      // If we're in the zone section and both are selected, proceed to next page
      setIsLoading(true);
      markStepCompleted(2); // Mark specialty selection as completed
      navigate("/photo-guidelines");
      // Loading will be reset when component unmounts
    }
  };

  // Helper function to check if continue button should be enabled
  const canContinue = () => {
    if (currentSection === "specialty") {
      return !!selectedSpecialty;
    } else if (currentSection === "zone") {
      return !!(selectedSpecialty && selectedWorkZone);
    }
    return false;
  };

  return (
    <div className='h-screen bg-gradient-subtle overflow-hidden'>
      {/* Header - Fixed at top */}
      <div className='fixed top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border'>
        <div className='w-full px-3 py-2 md:px-8 md:py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center'>
              <Star className='w-4 h-4 md:w-5 md:h-5 text-white' />
            </div>
          </div>
          <Button
            variant='outline'
            onClick={handleExit}
            className='px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200'
          >
            Salir
          </Button>
        </div>
      </div>

      {/* Main Content Container - Scrollable */}
      <div className='h-full pt-14 pb-20 md:pt-20 md:pb-24 overflow-y-auto snap-y snap-mandatory scrollbar-hide'>
        {/* Section 1: Specialty Selection */}
        <motion.div
          ref={specialtyRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='min-h-screen snap-start flex flex-col'
        >
          <div className='flex-1 w-full max-w-md md:max-w-2xl mx-auto px-3 py-3 md:px-4 md:py-6 flex flex-col'>
            {/* Services Grid */}
            <div className='flex-1 overflow-auto'>
              {/* Section Title inside scrollable area */}
              <div className='mb-3 md:mb-6 text-left mt-2 md:mt-18'>
                <h1 className='text-base md:text-xl text-foreground mb-1 md:mb-2'>
                  ¿Cuál es tu especialidad?
                </h1>
                <p className='text-xs md:text-sm text-muted-foreground'>
                  Selecciona el servicio principal que ofreces
                </p>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
                {popularServices.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => setSpecialty(service.name)}
                    className={`
                      p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                      ${
                        selectedSpecialty === service.name
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className='flex flex-col items-center text-center h-full'>
                      <div
                        className={`
                        w-9 h-9 md:w-12 md:h-12 rounded-xl mb-2 md:mb-3 flex items-center justify-center
                        ${
                          selectedSpecialty === service.name
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }
                      `}
                      >
                        <service.icon className='w-5 h-5 md:w-6 md:h-6' />
                      </div>
                      <h3 className='font-semibold text-xs md:text-sm text-foreground mb-0.5 md:mb-1'>
                        {service.name}
                      </h3>
                      <p className='text-[10px] md:text-xs text-muted-foreground leading-tight'>
                        {service.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Work Zone Selection - 100vh (only shown when specialty is selected) */}
        {selectedSpecialty && (
          <motion.div
            ref={zoneRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='min-h-screen snap-start flex flex-col'
          >
            <div className='flex-1 w-full max-w-md md:max-w-2xl mx-auto px-3 py-3 md:px-4 md:py-6 flex flex-col'>
              {/* Work Zones Grid */}
              <div className='flex-1 overflow-auto'>
                {/* Section Title inside scrollable area */}
                <div className='mb-3 md:mb-6 text-left mt-2 md:mt-18'>
                  <h2 className='text-base md:text-xl text-foreground mb-1 md:mb-2'>
                    ¿En qué zona trabajas?
                  </h2>
                  <p className='text-xs md:text-sm text-muted-foreground'>
                    Seleccioná la zona donde ofreces tus servicios
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  {workZones.map((zone, index) => (
                    <motion.div
                      key={zone.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => setWorkZone(zone.name)}
                      className={`
                        p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                        ${
                          selectedWorkZone === zone.name
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className='flex items-center gap-2 md:gap-3'>
                        <div
                          className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          ${
                            selectedWorkZone === zone.name
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary"
                          }
                        `}
                        >
                          <zone.icon className='w-4 h-4 md:w-5 md:h-5' />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-xs md:text-sm text-foreground mb-0.5 md:mb-1'>
                            {zone.name}
                          </h3>
                          <p className='text-[10px] md:text-xs text-muted-foreground leading-tight'>
                            {zone.fullName}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer with Progress Bar - Fixed at bottom */}
      <div className='fixed bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm'>
        {/* Progress Bar */}
        <OnboardingProgressBar />

        {/* Footer Buttons */}
        <div className='w-full px-3 py-3 md:px-8 md:py-6'>
          <div className='flex items-center justify-between'>
            <button
              onClick={handleBack}
              className='text-xs md:text-sm text-black hover:text-gray-700 underline font-medium'
            >
              Atrás
            </button>
            <LoadingButton
              onClick={handleContinue}
              loading={isLoading}
              disabled={!canContinue() || isLoading}
              className='px-6 h-9 text-sm md:px-8 md:h-12 md:text-base font-medium'
            >
              Continuar
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}