"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, type OnboardingData } from '@/hooks/useProfiles';
import { useLoading } from '@/stores/useLoadingStore';
import { OnboardingLayout, type OnboardingStep } from '@/components/onboarding/OnboardingLayout';
import { PersonalInfoStep, type PersonalInfo } from '@/components/onboarding/PersonalInfoStep';
import { ProfessionalInfoStep, type ProfessionalInfo } from '@/components/onboarding/ProfessionalInfoStep';
import { CompletionStep } from '@/components/onboarding/CompletionStep';

const steps: OnboardingStep[] = [
  { id: 1, title: 'Datos personales', description: 'Información básica de contacto' },
  { id: 2, title: 'Información profesional', description: 'Tu experiencia y servicios' },
  { id: 3, title: 'Completado', description: 'Todo listo para empezar' }
];

export default function ProfessionalOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    phone: '',
    locationProvince: '',
    locationCity: ''
  });
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    bio: '',
    skills: [],
    tradeName: '',
    yearsExperience: 0,
    hourlyRate: 0
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveOnboardingData } = useProfiles();
  const { withLoading } = useLoading();

  // Load user data from auth
  useEffect(() => {
    if (user?.user_metadata) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: user.user_metadata.full_name || prev.fullName
      }));
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?next=/onboarding');
    }
  }, [user, navigate]);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to Supabase and complete onboarding
      if (!user) return;
      
      try {
        await withLoading(async () => {
          const finalData: OnboardingData = {
            ...personalInfo,
            ...professionalInfo
          };
          
          const result = await saveOnboardingData(finalData, user.id);
          
          if (result.success) {
            console.log('Profile completed successfully');
            // Don't navigate automatically - let the completion step handle it
          } else {
            throw new Error('Failed to save onboarding data');
          }
        }, "Completando tu perfil...");
      } catch (error) {
        console.error('Error completing onboarding:', error);
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on first step, go back to photo upload
      navigate('/photo-upload');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(personalInfo.fullName && personalInfo.phone && 
                 personalInfo.locationProvince && personalInfo.locationCity);
      case 2:
        return !!(professionalInfo.tradeName && professionalInfo.bio && 
                 professionalInfo.skills.length > 0 && professionalInfo.yearsExperience > 0);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const updatePersonalInfo = (data: Partial<PersonalInfo>) => {
    setPersonalInfo(prev => ({ ...prev, ...data }));
  };

  const updateProfessionalInfo = (data: Partial<ProfessionalInfo>) => {
    setProfessionalInfo(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep 
            data={personalInfo}
            onChange={updatePersonalInfo}
          />
        );
      case 2:
        return (
          <ProfessionalInfoStep 
            data={professionalInfo}
            onChange={updateProfessionalInfo}
          />
        );
      case 3:
        return (
          <CompletionStep 
            userType="professional"
            userName={personalInfo.fullName.split(' ')[0]}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  const handleExit = () => {
    navigate('/');
  };

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed()}
      onExit={handleExit}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}