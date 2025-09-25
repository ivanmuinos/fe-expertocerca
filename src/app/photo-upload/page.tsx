"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Button } from "@/src/shared/components/ui/button";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Star, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboarding,
  type OnboardingPhoto,
} from "@/src/shared/stores/useOnboardingStore";
import { OnboardingProgressBar } from "@/src/shared/components/OnboardingProgressBar";
import { useOnboardingProgress, OnboardingStep } from "@/src/shared/stores/useOnboardingProgressStore";

// Helper function to determine initial section from URL
const getInitialSection = (location: { search: string }, uploadedPhotos: any[]): 'photos' | 'description' => {
  const searchParams = new URLSearchParams(location.search);
  const sectionParam = searchParams.get('section');

  if (sectionParam === 'description' && uploadedPhotos.length >= 2) {
    return 'description';
  }
  return 'photos';
};

export default function PhotoUploadPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ search: string } | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);

  const {
    uploadedPhotos,
    workDescription,
    addPhoto,
    removePhoto,
    updatePhotoStatus,
    setWorkDescription,
    markStepCompleted,
    canProceedFromPhotos,
  } = useOnboarding();

  const { setCurrentStep, setPhotoSection } = useOnboardingProgress();

  const [currentSection, setCurrentSection] = useState<'photos' | 'description'>('photos');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize location client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocation({ search: window.location.search });
    }
  }, []);

  // Handle navigation to specific section based on URL params
  useEffect(() => {
    if (!location) return;

    const targetSection = getInitialSection(location as any, uploadedPhotos);

    // Update section and progress
    setCurrentSection(targetSection);
    setPhotoSection(targetSection);
    setCurrentStep(OnboardingStep.PHOTO_UPLOAD);

    // Scroll to correct section immediately if needed
    if (targetSection === 'description' && descriptionRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        descriptionRef.current?.scrollIntoView({
          behavior: 'instant', // Use instant to avoid glitch
          block: 'start'
        });
      });
    }
  }, [setCurrentStep, setPhotoSection, location, uploadedPhotos.length]);

  // No auto-scroll based on photos - only manual scroll via Continue button

  const handleBack = () => {
    // If we're in the description section, scroll back to photos section
    if (currentSection === 'description') {
      setCurrentSection('photos');
      setPhotoSection('photos'); // Update progress
      photosRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // If we're in the photos section, go back to previous page
      navigate("/photo-guidelines");
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  const handleContinue = async () => {
    // If we're in the photos section and have required photos, scroll to description
    if (currentSection === 'photos' && uploadedPhotos.length >= 2 && descriptionRef.current) {
      descriptionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setCurrentSection('description');
      setPhotoSection('description'); // Update progress
    } else if (currentSection === 'description' && canProceedFromPhotos()) {
      // No upload here - just mark step as completed and proceed
      setIsLoading(true);
      markStepCompleted(4); // Mark photo upload step as completed
      navigate("/personal-data");
      // Loading will be reset when component unmounts
    }
  };

  // No immediate upload - photos stay local until final step

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newImages: OnboardingPhoto[] = [];

    Array.from(files).forEach((file) => {
      if (
        file.type.startsWith("image/") &&
        uploadedPhotos.length + newImages.length < 8
      ) {
        const id = Math.random().toString(36).substring(2, 9);
        const url = URL.createObjectURL(file);
        newImages.push({ id, file, url, uploading: false, uploaded: false });
      }
    });

    // Add new images to the store (local only)
    newImages.forEach((image) => {
      addPhoto(image);
    });
  };

  // Since photos are local only, deletion is just removing from local state

  const handleRemoveImageLocally = (id: string) => {
    // Clean up object URL to prevent memory leaks
    const imageToRemove = uploadedPhotos.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    removePhoto(id);
  };

  const handleRemoveImage = (photo: OnboardingPhoto) => {
    handleRemoveImageLocally(photo.id);
  };

  const canAddMore = uploadedPhotos.length < 8;

  return (
    <div className='h-screen bg-gradient-subtle overflow-hidden'>
      {/* Header - Fixed at top */}
      <div className='fixed top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border'>
        <div className='w-full px-8 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
              <Star className='w-5 h-5 text-white' />
            </div>
          </div>
          <Button
            variant='outline'
            onClick={handleExit}
            className='px-4 py-2 bg-white border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200'
          >
            Salir
          </Button>
        </div>
      </div>

      {/* Main Content Container - Scrollable */}
      <div className='h-full pt-20 pb-24 overflow-y-auto snap-y snap-mandatory scrollbar-hide'>
        {/* Section 1: Photo Upload - 100vh */}
        <motion.div
          ref={photosRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='min-h-screen snap-start flex flex-col'
        >
          <div className='flex-1 w-full max-w-md md:max-w-4xl mx-auto px-4 py-6 flex flex-col'>
            {/* Photo slots grid */}
            <div className='flex-1 overflow-auto'>
              {/* Section Title inside scrollable area */}
              <div className='mb-6 text-left mt-18'>
                <h1 className='text-xl text-foreground mb-2'>
                  Cargá tus mejores fotos
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Las fotos son el factor más importante para que los clientes confíen en tu trabajo
                </p>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {Array.from({ length: 8 }, (_, index) => {
                  const hasImage = index < uploadedPhotos.length;
                  const isRequired = index < 2;
                  const image = uploadedPhotos[index];

                  return (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-2xl transition-all duration-200 group ${
                        hasImage
                          ? "bg-white shadow-sm hover:shadow-md"
                          : isRequired
                          ? "border-2 border-dashed border-gray-400 bg-gray-50"
                          : "border-2 border-dashed border-gray-200 bg-gray-25"
                      }`}
                    >
                      {hasImage && image ? (
                        <>
                          <img
                            src={image.url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl transition-all duration-200"
                          />

                          {/* Hover overlay for delete */}
                          <div className='absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center'>
                            <button
                              onClick={() => handleRemoveImage(image)}
                              className='bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-lg'
                            >
                              <Trash2 className='w-5 h-5' />
                            </button>
                          </div>

                          {/* Image number */}
                          <div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full group-hover:opacity-50 transition-opacity duration-200'>
                            {index + 1}
                          </div>
                        </>
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          {canAddMore && (
                            <>
                              <input
                                type='file'
                                multiple
                                accept='image/*'
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                onChange={(e) => handleFileSelect(e.target.files)}
                              />
                              <div className='text-center'>
                                <Plus
                                  className={`w-8 h-8 mb-2 mx-auto ${
                                    isRequired ? "text-gray-600" : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    isRequired ? "text-gray-600" : "text-gray-400"
                                  }`}
                                >
                                  {isRequired ? "Requerida" : "Opcional"}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Work Description - 100vh (only shown when photos requirement is met) */}
        {uploadedPhotos.length >= 2 && (
          <motion.div
            ref={descriptionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='min-h-screen snap-start flex flex-col'
          >
            <div className='flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-6 flex flex-col'>
              {/* Work Description Textarea */}
              <div className='flex-1 flex flex-col'>
                {/* Section Title inside scrollable area */}
                <div className='mb-6 text-left mt-18'>
                  <h2 className='text-xl text-foreground mb-2'>
                    Describí los trabajos que realizás
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    Contá a tus potenciales clientes sobre tu experiencia y los servicios que ofrecés
                  </p>
                </div>
                <Textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Ejemplo: Soy electricista con más de 10 años de experiencia. Me especializo en instalaciones residenciales y comerciales, reparación de averías eléctricas, instalación de aires acondicionados, automatización del hogar y sistemas de iluminación LED.

Trabajo con materiales de primera calidad y ofrezco garantía en todos mis trabajos. Cuento con matrícula profesional y seguro de responsabilidad civil.

Mis clientes destacan mi puntualidad, prolijidad y precio justo. Atiendo zona norte del GBA con disponibilidad de lunes a sábados."
                  className='flex-1 min-h-[200px] max-h-[400px] resize-none text-sm leading-relaxed bg-white/80 backdrop-blur-sm border-2 border-border focus:border-primary rounded-2xl p-4 transition-colors duration-200'
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.6'
                  }}
                />
                <div className='mt-2 flex justify-between items-center'>
                  <div className='text-xs'>
                    {workDescription.trim().length < 50 ? (
                      <span className='text-red-500'>
                        Mínimo 50 caracteres (faltan {50 - workDescription.trim().length})
                      </span>
                    ) : (
                      <span className='text-green-600'>
                        ✓ Descripción válida
                      </span>
                    )}
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {workDescription.length}/1000 caracteres
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress Bar - Fixed at bottom */}
      <OnboardingProgressBar fixed />

      {/* Footer - Fixed at bottom */}
      <div className='fixed bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm'>
        <div className='w-full px-8 py-6'>
          <div className='flex items-center justify-between'>
            <button
              onClick={handleBack}
              className='text-sm text-black hover:text-gray-700 underline font-medium'
            >
              Atrás
            </button>
            <LoadingButton
              onClick={handleContinue}
              loading={isLoading}
              disabled={isLoading || (currentSection === 'photos' ? uploadedPhotos.length < 2 : !canProceedFromPhotos())}
              className='px-8 h-12 text-base font-medium'
            >
              Continuar
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}