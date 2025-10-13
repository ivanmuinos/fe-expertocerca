"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { Input } from "@/src/shared/components/ui/input";
import {
  Zap,
  Droplets,
  Paintbrush,
  Hammer,
  Wrench,
  Scissors,
  Car,
  Home,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";

// Validation schema for custom specialty
const customSpecialtySchema = z
  .string()
  .min(3, "La especialidad debe tener al menos 3 caracteres")
  .max(50, "La especialidad no puede tener más de 50 caracteres")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/,
    "Solo se permiten letras, sin espacios ni caracteres especiales"
  )
  .regex(/^[A-ZÁÉÍÓÚÑ]/, "Debe comenzar con mayúscula");

// Services data with icons
const popularServices: { name: string; icon: LucideIcon }[] = [
  { name: "Electricista", icon: Zap },
  { name: "Plomero", icon: Droplets },
  { name: "Pintor", icon: Paintbrush },
  { name: "Carpintero", icon: Hammer },
  { name: "Técnico en aires", icon: Wrench },
  { name: "Peluquero", icon: Scissors },
  { name: "Mecánico", icon: Car },
  { name: "Limpieza", icon: Home },
  { name: "Otros", icon: MoreHorizontal },
];

// Work zones for Argentina - Using exact names from database
const workZones = [
  {
    value: "Ciudad Autónoma de Buenos Aires",
    label: "Ciudad Autónoma de Buenos Aires (CABA)",
  },
  { value: "GBA Norte", label: "GBA Norte (Vicente López, San Isidro, Tigre)" },
  { value: "GBA Oeste", label: "GBA Oeste (Morón, Hurlingham, Ituzaingó)" },
  { value: "GBA Sur", label: "GBA Sur (Avellaneda, Quilmes, Berazategui)" },
  { value: "La Plata y alrededores", label: "La Plata y alrededores" },
  { value: "Córdoba", label: "Córdoba Capital" },
  { value: "Rosario", label: "Rosario, Santa Fe" },
  { value: "Mendoza", label: "Mendoza Capital" },
];

export default function SpecialtySelectionPage() {
  const navigate = useNavigate();
  const {
    selectedSpecialty,
    selectedWorkZone,
    setSpecialty,
    setWorkZone,
    markStepCompleted,
  } = useOnboarding();

  const [isLoading, setIsLoading] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customSpecialtyError, setCustomSpecialtyError] = useState("");

  const { setCurrentStep } = useOnboardingProgress();
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();

  // Set current step on mount and initialize state if coming back
  useEffect(() => {
    setCurrentStep(OnboardingStep.SPECIALTY_SELECTION);

    // Initialize state if there's already a selected specialty
    if (selectedSpecialty) {
      const predefinedService = popularServices.find(
        (s) => s.name === selectedSpecialty
      );
      if (predefinedService) {
        setSelectedCategory(predefinedService.name);
      } else {
        // It's a custom specialty
        setSelectedCategory("Otros");
        setCustomSpecialty(selectedSpecialty);
      }
    }
  }, [setCurrentStep]); // Only run on mount

  const handleBack = () => {
    navigate("/onboarding/professional-intro");
  };

  const handleSpecialtyChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "Otros") {
      setSpecialty("", "Otros"); // Clear specialty, set category as "Otros"
      setCustomSpecialty("");
      setCustomSpecialtyError("");
    } else {
      setSpecialty(value, value); // Set both specialty and category
      setCustomSpecialty("");
      setCustomSpecialtyError("");
    }
  };

  const handleCustomSpecialtyChange = (value: string) => {
    // Auto-capitalize first letter and remove spaces/numbers/special chars
    let cleanedValue = value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "") // Remove non-letters
      .replace(/^\s+/, ""); // Remove leading spaces

    // Capitalize first letter, lowercase the rest
    if (cleanedValue.length > 0) {
      cleanedValue =
        cleanedValue.charAt(0).toUpperCase() +
        cleanedValue.slice(1).toLowerCase();
    }

    setCustomSpecialty(cleanedValue);

    // Validate with Zod
    const result = customSpecialtySchema.safeParse(cleanedValue);
    if (!result.success) {
      setCustomSpecialtyError(result.error.errors[0].message);
      setSpecialty("", "Otros"); // Clear specialty but keep category
    } else {
      setCustomSpecialtyError("");
      setSpecialty(cleanedValue, "Otros"); // Save custom specialty with "Otros" as category
    }
  };

  const handleContinue = async () => {
    if (selectedSpecialty && selectedWorkZone) {
      setIsLoading(true);
      markStepCompleted(2); // Mark specialty selection as completed
      navigate("/onboarding/photo-guidelines");
    }
  };

  // Footer buttons
  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: handleBack });
    setRightButton({
      label: "Continuar",
      onClick: handleContinue,
      loading: isLoading,
      disabled:
        !selectedSpecialty ||
        !selectedWorkZone ||
        isLoading ||
        !!customSpecialtyError,
    });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecialty, selectedWorkZone, isLoading, customSpecialtyError]);

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
        <div className='w-full max-w-md mx-auto px-4 py-8 md:py-12'>
          {/* Title */}
          <div className='mb-8 text-left'>
            <h1 className='text-lg md:text-xl font-normal text-foreground mb-2'>
              Tu Especialidad y Zona
            </h1>
            <p className='text-xs md:text-sm text-muted-foreground'>
              Seleccioná tu oficio principal y dónde trabajas
            </p>
          </div>

          {/* Form Container */}
          <div className='space-y-6'>
            {/* Specialty Dropdown */}
            <div className='space-y-2'>
              <label
                htmlFor='specialty'
                className='text-sm font-medium text-foreground'
              >
                ¿Cuál es tu especialidad?
              </label>
              <Select
                value={selectedCategory || selectedSpecialty}
                onValueChange={handleSpecialtyChange}
              >
                <SelectTrigger className='h-12 text-base'>
                  <SelectValue placeholder='Selecciona un oficio' />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className='max-h-[300px]'>
                  {popularServices.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      <div className='flex items-center gap-2'>
                        <service.icon className='w-4 h-4' />
                        <span>{service.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Specialty Input (shown when "Otros" is selected) */}
            {selectedCategory === "Otros" && (
              <div className='space-y-2'>
                <label
                  htmlFor='customSpecialty'
                  className='text-sm font-medium text-foreground'
                >
                  Especifica tu especialidad
                </label>
                <Input
                  id='customSpecialty'
                  type='text'
                  placeholder='Ej: Jardinero, Gasista, etc.'
                  value={customSpecialty}
                  onChange={(e) => handleCustomSpecialtyChange(e.target.value)}
                  className={`h-12 text-base ${
                    customSpecialtyError ? "border-destructive" : ""
                  }`}
                />
                {customSpecialtyError && (
                  <p className='text-sm text-destructive'>
                    {customSpecialtyError}
                  </p>
                )}
              </div>
            )}

            {/* Work Zone Dropdown */}
            <div className='space-y-2'>
              <label
                htmlFor='workZone'
                className='text-sm font-medium text-foreground'
              >
                ¿En qué zona trabajas?
              </label>
              <Select value={selectedWorkZone} onValueChange={setWorkZone}>
                <SelectTrigger className='h-12 text-base'>
                  <SelectValue placeholder='Selecciona una zona' />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className='max-h-[300px]'>
                  {workZones.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.value} - {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
    </div>
  );
}
