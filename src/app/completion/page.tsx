"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "@/src/features/auth";
import { apiClient } from "@/src/shared/lib/api-client";
import { Star, CheckCircle, Home, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";

export default function CompletionPage() {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { setCurrentStep } = useOnboardingProgress();
  const { uploadedPhotos, resetOnboarding } = useOnboarding();

  const [isUploading, setIsUploading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

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
            const formData = new FormData();
            formData.append("file", photo.file);
            formData.append("professional_profile_id", (profile as any).id);
            formData.append("title", `Foto de trabajo ${index + 1}`);
            formData.append("description", "Foto subida durante el onboarding");

            const response = await fetch("/api/user-profile/portfolio", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            return { success: true, photoId: photo.id };
          } catch (error) {
            return { success: false, photoId: photo.id, error };
          }
        });

        const results = await Promise.all(uploadPromises);
        const failedUploads = results.filter((r) => !r.success);

        if (failedUploads.length > 0) {
          console.error("Failed uploads:", failedUploads);
        }

        setHasUploaded(true);
        resetOnboarding();
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
  }, [user?.id, uploadedPhotos.length]); // Remover hasUploaded de las dependencias

  const handleGoHome = () => {
    navigate("/");
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "usuario";

  return (
    <div className='h-screen bg-gradient-subtle overflow-hidden flex flex-col'>
      <div className='flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border'>
        <div className='w-full px-8 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
              <Star className='w-5 h-5 text-white' />
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col justify-center'>
        {isUploading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='w-full max-w-md md:max-w-2xl mx-auto px-4 flex flex-col justify-center items-center'
          >
            <div className='mb-8 text-center'>
              <div className='flex justify-center mb-6'>
                <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Loader2 className='w-12 h-12 text-primary animate-spin' />
                </div>
              </div>

              <div className='space-y-4'>
                <h1 className='text-2xl text-foreground text-center'>
                  Finalizando tu perfil...
                </h1>
                <p className='text-muted-foreground text-center leading-relaxed'>
                  {uploadedPhotos.length > 0
                    ? `Subiendo ${uploadedPhotos.length} foto${
                        uploadedPhotos.length > 1 ? "s" : ""
                      } de tu trabajo`
                    : "Configurando tu perfil profesional"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='w-full max-w-md md:max-w-2xl mx-auto px-4 flex flex-col justify-center items-center'
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
    </div>
  );
}
