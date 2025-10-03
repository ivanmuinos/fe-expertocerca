"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useAuthState } from '@/src/features/auth'
import { useProfiles, type OnboardingData } from "@/src/features/user-profile";
import { useLoading } from "@/src/shared/stores/useLoadingStore";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingProgressBar } from "@/src/shared/components/OnboardingProgressBar";
import { useOnboardingProgress, OnboardingStep } from "@/src/shared/stores/useOnboardingProgressStore";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from onboarding store
  const {
    selectedSpecialty,
    selectedWorkZone,
    workDescription,
    professionalInfo,
    uploadedPhotos,
    resetOnboarding
  } = useOnboarding();

  const [formData, setFormData] = useState<PersonalDataForm>({
    fullName: "",
    email: "",
    phone: "",
    facebookProfile: "",
    instagramProfile: "",
  });

  // Load user data from Google auth
  useEffect(() => {
    if (user?.user_metadata) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.user_metadata.full_name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep(OnboardingStep.PERSONAL_DATA);
  }, [setCurrentStep]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth?next=/personal-data");
    }
  }, [user, navigate]);

  const handleBack = () => {
    // Navigate back to photo-upload but go to the description section
    navigate("/photo-upload?section=description");
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
      const onboardingData: OnboardingData = {
        fullName: formData.fullName,
        phone: formData.phone,
        whatsappPhone: formData.phone, // Use phone as WhatsApp by default
        locationProvince: "Buenos Aires", // TODO: Get from location selector
        locationCity: "Ciudad Autónoma de Buenos Aires", // TODO: Get from location selector
        bio: workDescription || "Descripción profesional", // From photo upload step
        skills: professionalInfo?.skills?.length > 0 ? professionalInfo.skills : [], // From professional info
        // Professional data from onboarding flow
        specialty: selectedSpecialty || undefined,
        workZone: selectedWorkZone || undefined,
        tradeName: (professionalInfo?.tradeName && professionalInfo.tradeName.trim())
                   ? professionalInfo.tradeName
                   : formData.fullName, // Use full name as default
        yearsExperience: (professionalInfo?.yearsExperience && professionalInfo.yearsExperience > 0)
                         ? professionalInfo.yearsExperience
                         : 1, // Default to 1 year
        hourlyRate: (professionalInfo?.hourlyRate && professionalInfo.hourlyRate > 0)
                    ? professionalInfo.hourlyRate
                    : undefined,
      };

      const result = await saveOnboardingData(onboardingData, user.id);

      if (result.success) {
        // Go to completion page (loading state will persist until completion page finishes)
        navigate("/completion");
        // Don't reset isSubmitting - it will be handled by completion page or component unmount
      } else {
        setIsSubmitting(false);
        throw new Error(`Failed to save personal data: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setIsSubmitting(false);
      // Show error to user if needed
      console.error("Error saving personal data:", error);
    }
  };

  const updateFormData = (field: keyof PersonalDataForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = !!(formData.fullName && formData.email && formData.phone);

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format for Argentina mobile: XX XXXX XXXX (11 3066 3794)
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    updateFormData("phone", formatted);
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className='h-screen bg-gradient-subtle flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border'>
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

      {/* Content */}
      <div className='flex-1 w-full max-w-md md:max-w-2xl mx-auto px-3 py-3 md:px-4 md:py-6 flex flex-col min-h-0'>
        {/* Main Title */}
        {/* Form */}
        <div className='flex-1 overflow-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='space-y-3 md:space-y-6'
          >
            {/* Title inside scrollable area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='mb-3 md:mb-6'
            >
              <h1 className='text-base md:text-xl text-foreground text-left'>
                Completá tus datos personales
              </h1>
              <p className='text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 text-left'>
                Esta información ayudará a los clientes a contactarte
              </p>
            </motion.div>
            {/* Full Name */}
            <div className='space-y-1 md:space-y-2'>
              <Label htmlFor='fullName' className='text-xs md:text-sm'>Nombre completo *</Label>
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
              <Label htmlFor='email' className='text-xs md:text-sm'>Email *</Label>
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
              <Label htmlFor='phone'>Teléfono *</Label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm'>
                  <MessageCircle className='w-4 h-4 text-green-500' />
                  <span className='text-gray-600'>+54 9</span>
                </div>
                <Input
                  id='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder='11 3066 3794'
                  className='h-9 md:h-12 text-sm pl-20'
                  maxLength={12}
                  required
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Este número será el principal medio de contacto. Asegurate que sea tu WhatsApp.
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
                    <div className='w-4 h-4 bg-blue-600 rounded-sm'></div>
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
                    <div className='w-4 h-4 bg-pink-600 rounded-sm'></div>
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

      {/* Footer with Progress Bar */}
      <div className='flex-shrink-0 w-full bg-background/95 backdrop-blur-sm'>
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
              loading={isSubmitting}
              disabled={!canProceed || isSubmitting}
              className='px-6 h-9 text-sm md:px-8 md:h-12 md:text-base font-medium'
            >
              Completar registro
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}