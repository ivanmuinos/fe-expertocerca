"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "@/src/features/auth";
import { apiClient } from "@/src/shared/lib/api-client";
import { CheckCircle, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/shared/lib/query-keys";
import { trackOnboardingComplete } from "@/src/shared/lib/gtm";

export default function CompletionPage() {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { setCurrentStep } = useOnboardingProgress();
  const { uploadedPhotos, resetOnboarding } = useOnboarding();
  const queryClient = useQueryClient();

  const [isUploading, setIsUploading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Usar useRef para controlar si ya se ejecutó el upload
  const uploadExecutedRef = useRef(false);

  useEffect(() => {
    setCurrentStep(OnboardingStep.COMPLETION);
  }, [setCurrentStep]);

  useEffect(() => {
    const uploadPhotos = async () => {
      // Prevenir múltiples uploads usando ref
      if (
        !user ||
        uploadedPhotos.length === 0 ||
        hasUploaded ||
        uploadExecutedRef.current
      ) {
        setIsUploading(false);
        return;
      }

      // Marcar como ejecutado inmediatamente
      uploadExecutedRef.current = true;

      try {
        const profile = await apiClient.get("/profiles/professional");

        if (!profile || !(profile as any).id) {
          throw new Error("Perfil profesional no encontrado");
        }

        const uploadPromises = uploadedPhotos.map(async (photo, index) => {
          try {
            // Sanitize filename to avoid issues with special characters
            const originalFile = photo.file;
            
            // Get file extension from type, handle HEIC/HEIF
            let fileExt = originalFile.type.split('/')[1] || 'jpg';
            // Normalize HEIC/HEIF to jpg for compatibility
            if (fileExt === 'heic' || fileExt === 'heif') {
              fileExt = 'jpg';
            }
            // Remove any special characters from extension
            fileExt = fileExt.replace(/[^a-z0-9]/gi, '');
            
            const sanitizedFileName = `photo_${Date.now()}_${index}.${fileExt}`;

            // Create a new File with sanitized name
            const sanitizedFile = new File([originalFile], sanitizedFileName, {
              type: originalFile.type,
              lastModified: originalFile.lastModified
            });

            const formData = new FormData();
            formData.append("file", sanitizedFile);
            formData.append("professional_profile_id", (profile as any).id);
            formData.append("title", `Foto de trabajo ${index + 1}`);
            formData.append("description", "");

            const response = await fetch("/api/user-profile/portfolio", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();

            return {
              success: true,
              photoId: photo.id,
              supabaseUrl: result.data?.image_url,
              isMain: photo.isMain,
            };
          } catch (error) {
            return { success: false, photoId: photo.id, error };
          }
        });

        const results = await Promise.all(uploadPromises);

        const failedUploads = results.filter((r) => !r.success);

        // If a main photo was selected during onboarding, persist as main image
        // If no main photo was selected, use the first successfully uploaded photo
        let mainPhotoResult = results.find((r) => r.success && r.isMain);
        if (!mainPhotoResult) {
          mainPhotoResult = results.find((r) => r.success);
        }

        if (mainPhotoResult && mainPhotoResult.supabaseUrl) {
          try {
            const res = await fetch(
              `/api/professionals/${(profile as any).id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  main_portfolio_image: mainPhotoResult.supabaseUrl,
                }),
              }
            );
            if (!res.ok) {
              console.warn(
                "No se pudo actualizar la imagen principal al finalizar el onboarding"
              );
            }
          } catch { }
        }

        setHasUploaded(true);
        resetOnboarding();
        
        // Track onboarding completion
        trackOnboardingComplete();

        // Invalidar cache de professionals para que se recarguen en home
        queryClient.invalidateQueries({
          queryKey: queryKeys.professionals.lists(),
        });
      } catch (error) {
        setUploadError(
          "Error al subir las fotos. Podés intentarlo más tarde desde tu perfil."
        );
        // Resetear el ref en caso de error para permitir retry
        uploadExecutedRef.current = false;
      } finally {
        setIsUploading(false);
      }
    };

    uploadPhotos();
  }, [user?.id, uploadedPhotos.length, queryClient, resetOnboarding]); // Agregar dependencias

  // Cuenta regresiva cuando termina la carga
  useEffect(() => {
    if (!isUploading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isUploading && countdown === 0) {
      navigate("/");
    }
  }, [isUploading, countdown, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "usuario";

  return (
    <div className='min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-auto py-8'>
      {isUploading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md md:max-w-2xl mx-auto px-4'
        >
          <div className='mb-8 text-center'>
            <div className='flex justify-center mb-6'>
              <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
                <Loader2 className='w-12 h-12 text-primary animate-spin' />
              </div>
            </div>

            <div className='space-y-4'>
              <h1 className='text-2xl text-foreground text-center'>
                Publicando...
              </h1>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md md:max-w-2xl mx-auto px-4'
        >
          <div className='mb-8 text-center'>
            <div className='flex justify-center mb-6'>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'
              >
                <CheckCircle className='w-12 h-12 text-green-600' />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='space-y-4'
            >
              <h1 className='text-2xl text-foreground text-center'>
                ¡Perfecto, {userName}! 🎉
              </h1>
              <p className='text-muted-foreground text-center leading-relaxed'>
                Tu perfil profesional está configurado. Ahora podés empezar a
                recibir solicitudes de clientes.
              </p>
              <p className='text-sm text-muted-foreground text-center'>
                Redirigiendo al inicio en {countdown} segundo{countdown !== 1 ? 's' : ''}...
              </p>
              {uploadError && (
                <p className='text-orange-600 text-sm text-center'>
                  {uploadError}
                </p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='flex justify-center'
          >
            <button
              onClick={handleGoHome}
              className='flex items-center gap-2 text-sm text-black hover:text-gray-700 underline font-medium'
            >
              <Home className='w-4 h-4' />
              Ir al inicio
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
