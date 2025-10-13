"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useAuthState } from "@/src/features/auth";
import { useProfiles, type OnboardingData } from "@/src/features/user-profile";
import { useLoading } from "@/src/shared/stores/useLoadingStore";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Star, MessageCircle, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";
import { apiClient } from "@/src/shared/lib/api-client";

export interface PersonalDataForm {
  fullName: string;
  email: string;
  phone: string;
  facebookProfile?: string;
  instagramProfile?: string;
}

export default function PersonalDataPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { saveOnboardingData } = useProfiles();
  const { withLoading } = useLoading();
  const { setCurrentStep } = useOnboardingProgress();
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneRef = useRef("");

  // Get data from onboarding store
  const {
    selectedSpecialty,
    selectedSpecialtyCategory,
    selectedWorkZone,
    workDescription,
    professionalInfo,
    uploadedPhotos,
    resetOnboarding,
  } = useOnboarding();

  const [formData, setFormData] = useState<PersonalDataForm>({
    fullName: "",
    email: "",
    phone: "",
    facebookProfile: "",
    instagramProfile: "",
  });

  // Load user data from Google auth (only once on mount)
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
    if (user?.user_metadata && !userDataLoaded) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.user_metadata.full_name || prev.fullName,
        email: user.email || prev.email,
      }));
      setUserDataLoaded(true);
    }
  }, [user, userDataLoaded]);

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep(OnboardingStep.PERSONAL_DATA);
  }, [setCurrentStep]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth?next=/onboarding/personal-data");
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate("/onboarding/work-description");
  };

  const handleExit = () => {
    navigate("/");
  };

  // Clear onboarding data after successful registration
  const clearOnboardingData = () => {
    resetOnboarding();
  };

  const handleContinue = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Log para debug
      console.log("formData.phone antes de procesar:", formData.phone);
      console.log("phoneRef antes de procesar:", phoneRef.current);

      // Construir el número completo con el prefijo +54 - MISMA LÓGICA QUE EN PERFIL
      const phoneSource = (phoneRef.current || formData.phone || "").trim();
      const fullPhoneNumber = phoneSource
        ? `+54${phoneSource.replace(/\s/g, "")}`
        : "";

      console.log("fullPhoneNumber después de procesar:", fullPhoneNumber);

      // Mapear la zona de trabajo a ciudad y provincia usando los nombres exactos de la BD
      const getLocationFromWorkZone = (workZone: string) => {
        const zoneMap: Record<string, { city: string; province: string }> = {
          "Ciudad Autónoma de Buenos Aires": {
            city: "Ciudad Autónoma de Buenos Aires",
            province: "Ciudad Autónoma de Buenos Aires",
          },
          "GBA Norte": { city: "Vicente López", province: "Buenos Aires" },
          "GBA Oeste": { city: "Morón", province: "Buenos Aires" },
          "GBA Sur": { city: "Avellaneda", province: "Buenos Aires" },
          "La Plata y alrededores": {
            city: "La Plata",
            province: "Buenos Aires",
          },
          Córdoba: { city: "Córdoba", province: "Córdoba" },
          Rosario: { city: "Rosario", province: "Santa Fe" },
          Mendoza: { city: "Mendoza", province: "Mendoza" },
        };
        return (
          zoneMap[workZone] || {
            city: "Buenos Aires",
            province: "Buenos Aires",
          }
        );
      };

      const location = getLocationFromWorkZone(selectedWorkZone || "");

      const onboardingData: OnboardingData = {
        fullName: formData.fullName,
        phone: fullPhoneNumber,
        whatsappPhone: fullPhoneNumber, // Use phone as WhatsApp by default
        locationProvince: location.province,
        locationCity: location.city,
        bio: workDescription || "Descripción profesional", // From photo upload step
        skills:
          professionalInfo?.skills?.length > 0 ? professionalInfo.skills : [], // From professional info
        // Professional data from onboarding flow
        specialty: selectedSpecialty || undefined,
        specialtyCategory: selectedSpecialtyCategory || undefined, // Category for filtering
        workZone: selectedWorkZone || undefined,
        tradeName:
          professionalInfo?.tradeName && professionalInfo.tradeName.trim()
            ? professionalInfo.tradeName
            : formData.fullName, // Use full name as default
        yearsExperience:
          professionalInfo?.yearsExperience &&
          professionalInfo.yearsExperience > 0
            ? professionalInfo.yearsExperience
            : 1, // Default to 1 year
        hourlyRate:
          professionalInfo?.hourlyRate && professionalInfo.hourlyRate > 0
            ? professionalInfo.hourlyRate
            : undefined,
      };

      console.log("onboardingData a enviar:", onboardingData);

      const result = await saveOnboardingData(onboardingData, user.id);

      if (result.success) {
        // Go to completion page (loading state will persist until completion page finishes)
        navigate("/onboarding/completion");
        // Don't reset isSubmitting - it will be handled by completion page or component unmount
      } else {
        setIsSubmitting(false);
        throw new Error(
          `Failed to save personal data: ${
            result.error?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      setIsSubmitting(false);
      // Show error to user if needed
      console.error("Error saving personal data:", error);
    }
  };

  const canProceed = !!(
    formData.fullName &&
    formData.email &&
    (phoneRef.current || formData.phone)
  );

  // Set static left button on mount and clean up on unmount only
  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: () => handleBack() });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update right button reactively without resetting on each change
  useEffect(() => {
    setRightButton({
      label: "Completar registro",
      onClick: () => handleContinue(),
      loading: isSubmitting,
      disabled: !canProceed || isSubmitting,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProceed, isSubmitting]);

  const updateFormData = (field: keyof PersonalDataForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className='h-screen bg-gradient-subtle flex flex-col overflow-hidden'>
      {/* Header removido: está unificado en el layout */}

      {/* Content */}
      <div className='flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6 flex flex-col min-h-0'>
        {/* Main Title */}
        {/* Form */}
        <div className='flex-1 overflow-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='space-y-4 md:space-y-6'
          >
            {/* Title inside scrollable area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='mb-4 md:mb-6'
            >
              <h1 className='text-lg md:text-xl text-foreground text-left'>
                Completá tus datos personales
              </h1>
              <p className='text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 text-left'>
                Esta información ayudará a los clientes a contactarte
              </p>
            </motion.div>
            {/* Full Name */}
            <div className='space-y-1 md:space-y-2'>
              <Label htmlFor='fullName' className='text-xs md:text-sm'>
                Nombre completo *
              </Label>
              <Input
                id='fullName'
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                placeholder='Tu nombre completo'
                className='h-9 md:h-12 text-sm'
                required
              />
            </div>

            {/* Email - Disabled, from Google */}
            <div className='space-y-1 md:space-y-2'>
              <Label htmlFor='email' className='text-xs md:text-sm'>
                Email *
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                disabled
                className='h-9 md:h-12 bg-gray-50 text-gray-600 text-sm'
                placeholder='Se obtendrá de tu cuenta de Google'
              />
              <p className='text-xs text-muted-foreground'>
                Este email se obtiene automáticamente de tu cuenta de Google
              </p>
            </div>

            {/* Phone with Argentina flag */}
            <div className='space-y-2'>
              <Label htmlFor='phone'>Teléfono / WhatsApp *</Label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm'>
                  <MessageCircle className='w-4 h-4 text-green-500' />
                  <span className='text-gray-600'>+54</span>
                </div>
                <Input
                  id='phone'
                  type='tel'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir números
                    const cleaned = value.replace(/[^\d]/g, "");
                    phoneRef.current = cleaned;
                    setFormData((prev) => ({ ...prev, phone: cleaned }));
                  }}
                  placeholder='Ingresá tu WhatsApp aquí'
                  className='h-9 md:h-12 text-sm pl-20'
                  required
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Ingresá tu número sin el código de país. Este será tu principal
                medio de contacto.
              </p>
            </div>

            {/* Optional Social Media */}
            <div className='pt-4 border-t border-border'>
              <h3 className='text-sm font-medium text-foreground mb-4'>
                Redes sociales
              </h3>

              <div className='space-y-4'>
                {/* Facebook */}
                <div className='space-y-2'>
                  <Label htmlFor='facebook' className='flex items-center gap-2'>
                    <Facebook className='w-4 h-4 text-blue-600' />
                    Perfil de Facebook
                  </Label>
                  <Input
                    id='facebook'
                    value={formData.facebookProfile}
                    onChange={(e) =>
                      updateFormData("facebookProfile", e.target.value)
                    }
                    placeholder='https://facebook.com/tu-perfil'
                    className='h-9 md:h-12 text-sm'
                  />
                </div>

                {/* Instagram */}
                <div className='space-y-2'>
                  <Label
                    htmlFor='instagram'
                    className='flex items-center gap-2'
                  >
                    <Instagram className='w-4 h-4 text-pink-600' />
                    Perfil de Instagram
                  </Label>
                  <Input
                    id='instagram'
                    value={formData.instagramProfile}
                    onChange={(e) =>
                      updateFormData("instagramProfile", e.target.value)
                    }
                    placeholder='https://instagram.com/tu-perfil'
                    className='h-9 md:h-12 text-sm'
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Buttons removed; handled by global footer */}
    </div>
  );
}
