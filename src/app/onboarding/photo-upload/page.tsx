"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Star, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboarding,
  type OnboardingPhoto,
} from "@/src/shared/stores/useOnboardingStore";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";

export default function PhotoUploadPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    uploadedPhotos,
    addPhoto,
    removePhoto,
    setMainPhoto,
  } = useOnboarding();

  const { setCurrentStep } = useOnboardingProgress();
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();

  useEffect(() => {
    setCurrentStep(OnboardingStep.PHOTO_UPLOAD);
  }, [setCurrentStep]);

  const handleBack = () => {
    navigate("/onboarding/photo-guidelines");
  };

  const handleContinue = () => {
    setIsLoading(true);
    navigate("/onboarding/work-description");
  };

  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: handleBack });
    setRightButton({
      label: "Continuar",
      onClick: handleContinue,
      disabled: uploadedPhotos.length < 2 || isLoading,
      loading: isLoading,
    });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedPhotos.length, isLoading]);

  // No immediate upload - photos stay local until final step

  const handleFileSelect = async (
    files: FileList | null,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!files || files.length === 0) return;

    const newImages: OnboardingPhoto[] = [];
    const currentCount = uploadedPhotos.length;
    const availableSlots = 8 - currentCount;

    // Procesar solo los archivos que caben en los slots disponibles
    Array.from(files)
      .slice(0, availableSlots)
      .forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const url = URL.createObjectURL(file);
          // Si es la primera foto y no hay ninguna foto cargada, marcarla como principal
          const isMain = currentCount === 0 && index === 0;
          newImages.push({
            id,
            file,
            url,
            uploading: false,
            uploaded: false,
            isMain,
          });
        }
      });

    // Add new images to the store (local only)
    newImages.forEach((image) => {
      addPhoto(image);
    });

    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
    if (event?.target) {
      event.target.value = "";
    }
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
    <div className='flex-1 flex flex-col overflow-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md md:max-w-4xl mx-auto px-4 py-4 md:px-4 md:py-6'
        >
          {/* Section Title */}
          <div className='mb-4 md:mb-6 text-left'>
            <h1 className='text-lg md:text-xl text-foreground mb-1 md:mb-2'>
              Cargá tus mejores fotos
            </h1>
            <p className='text-xs md:text-sm text-muted-foreground'>
              Las fotos son el factor más importante para que los clientes
              confíen en tu trabajo
            </p>
          </div>

          {/* Photo slots grid */}
          <div className='overflow-auto'>
            <div className='mb-4 md:mb-6'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
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
                            className='w-full h-full object-cover rounded-2xl transition-all duration-200'
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

                          {/* Image badges and actions */}
                          <div className='absolute bottom-2 left-2 flex items-center gap-2'>
                            <div className='bg-black/70 text-white text-xs px-2 py-1 rounded-full group-hover:opacity-50 transition-opacity duration-200'>
                              {index + 1}
                            </div>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                setMainPhoto(image.id);
                              }}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                image.isMain
                                  ? "bg-primary text-white"
                                  : "bg-white/90 text-gray-900 hover:bg-white"
                              }`}
                            >
                              {image.isMain ? "Principal" : "Hacer principal"}
                            </button>
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
                                onChange={(e) =>
                                  handleFileSelect(e.target.files, e)
                                }
                              />
                              <div className='text-center'>
                                <Plus
                                  className={`w-8 h-8 mb-2 mx-auto ${
                                    isRequired
                                      ? "text-gray-600"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    isRequired
                                      ? "text-gray-600"
                                      : "text-gray-400"
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
    </div>
  );
}
