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

  // Helper function to compress and validate images
  const processImageFile = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Max file size: 10MB
      const MAX_SIZE = 10 * 1024 * 1024;
      const MAX_DIMENSION = 2048;

      console.log("Processing image:", {
        name: file.name,
        size: file.size,
        type: file.type,
        needsCompression: file.size > MAX_SIZE
      });

      // If file is small enough and valid type, return as-is
      if (file.size <= MAX_SIZE && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        console.log("File is valid, no processing needed");
        resolve(file);
        return;
      }

      // Need to compress or convert
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded for processing:", {
            width: img.width,
            height: img.height
          });

          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = (height / width) * MAX_DIMENSION;
              width = MAX_DIMENSION;
            } else {
              width = (width / height) * MAX_DIMENSION;
              height = MAX_DIMENSION;
            }
          }

          console.log("Resizing to:", { width, height });

          // Create canvas and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              console.log("Image compressed:", {
                originalSize: file.size,
                newSize: blob.size,
                reduction: `${((1 - blob.size / file.size) * 100).toFixed(1)}%`
              });

              // Create new file with sanitized name
              const sanitizedName = `photo_${Date.now()}.jpg`;
              const newFile = new File([blob], sanitizedName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              resolve(newFile);
            },
            'image/jpeg',
            0.85 // Quality
          );
        };

        img.onerror = () => {
          reject(new Error('Could not load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Could not read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  // No immediate upload - photos stay local until final step
  const handleFileSelect = async (
    files: FileList | null,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("=== PHOTO UPLOAD DEBUG START ===");
    console.log("1. handleFileSelect called", { 
      timestamp: new Date().toISOString(),
      filesCount: files?.length, 
      hasFiles: !!files,
      currentPhotos: uploadedPhotos.length,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
    
    if (!files || files.length === 0) {
      console.log("2. No files selected - EARLY RETURN");
      console.log("=== PHOTO UPLOAD DEBUG END ===");
      return;
    }

    const currentCount = uploadedPhotos.length;
    const availableSlots = 8 - currentCount;

    console.log("3. Processing files", { 
      availableSlots, 
      filesLength: files.length,
      willProcess: Math.min(files.length, availableSlots)
    });

    // Procesar solo los archivos que caben en los slots disponibles
    const filesToProcess = Array.from(files).slice(0, availableSlots);
    console.log("4. Files to process:", filesToProcess.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      lastModified: f.lastModified
    })));

    // Process files sequentially to avoid memory issues
    for (let index = 0; index < filesToProcess.length; index++) {
      const file = filesToProcess[index];
      console.log(`5.${index + 1}. Processing file ${index + 1}/${filesToProcess.length}`, { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size,
        isImage: file.type.startsWith("image/")
      });
      
      // Validate it's an image
      if (!file.type.startsWith("image/")) {
        console.log(`5.${index + 1}. File skipped - not an image`, {
          fileName: file.name,
          fileType: file.type
        });
        continue;
      }

      try {
        // Process and compress image
        console.log(`5.${index + 1}.a Processing and compressing image...`);
        const processedFile = await processImageFile(file);
        console.log(`5.${index + 1}.b Image processed successfully`);

        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`5.${index + 1}.c Creating object URL`);
        const url = URL.createObjectURL(processedFile);
        console.log(`5.${index + 1}.d Object URL created:`, url);
        
        // Si es la primera foto y no hay ninguna foto cargada, marcarla como principal
        const isMain = currentCount === 0 && index === 0;
        const imageObj: OnboardingPhoto = {
          id,
          file: processedFile,
          url,
          uploading: false,
          uploaded: false,
          isMain,
        };

        console.log(`5.${index + 1}.e Adding image to store`, { 
          id, 
          isMain,
          fileName: processedFile.name,
          fileSize: processedFile.size,
          objectUrl: url
        });

        addPhoto(imageObj);
        console.log(`5.${index + 1}.f Image added successfully`);

      } catch (error) {
        console.error(`5.${index + 1}.ERROR processing image:`, {
          error: error instanceof Error ? error.message : String(error),
          fileName: file.name
        });
        // Continue with next file even if this one fails
      }
    }

    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
    if (event?.target) {
      event.target.value = "";
      console.log("6. Input cleared");
    }
    
    console.log("7. File selection complete", { 
      totalPhotos: uploadedPhotos.length,
      processedFiles: filesToProcess.length
    });
    console.log("=== PHOTO UPLOAD DEBUG END ===");
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
                        <label 
                          className='w-full h-full flex items-center justify-center cursor-pointer relative'
                          htmlFor={`file-input-${index}`}
                        >
                          {canAddMore && (
                            <>
                              <input
                                id={`file-input-${index}`}
                                type='file'
                                multiple
                                accept='image/jpeg,image/jpg,image/png,image/heic,image/heif'
                                className='sr-only'
                                onChange={(e) => {
                                  console.log("Input onChange triggered", {
                                    filesCount: e.target.files?.length,
                                    files: e.target.files ? Array.from(e.target.files).map(f => ({
                                      name: f.name,
                                      type: f.type,
                                      size: f.size
                                    })) : []
                                  });
                                  handleFileSelect(e.target.files, e);
                                }}
                              />
                              <div className='text-center pointer-events-none'>
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
                        </label>
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
