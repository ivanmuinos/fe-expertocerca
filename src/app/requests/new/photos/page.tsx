"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useServiceRequestStore } from "@/src/features/service-requests/stores/useServiceRequestStore";
import ServiceRequestChrome from "../ServiceRequestChrome";
import { PhotoUploader } from "@/src/features/service-requests/components/PhotoUploader";
import { motion } from "framer-motion";

import { useState } from "react";
export default function FotosPage() {
  const navigate = useNavigate();
  const { photos, setPhotos } = useServiceRequestStore();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleContinue = () => {
    setIsNavigating(true);
    navigate("/requests/new/contact");
  };

  return (
    <ServiceRequestChrome
      progress={66}
      footerRight={{
        label: "Continuar",
        onClick: handleContinue,
        loading: isNavigating,
        disabled: isNavigating,
      }}
      footerLeft={{
        label: "Atrás",
        onClick: () => navigate("/requests/new/problem"),
        disabled: isNavigating,
      }}
    >
      <div className="w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Fotos del problema
            </h1>
            <p className="text-sm text-muted-foreground">
              Sube hasta 2 fotos para que los expertos entiendan mejor qué necesitas. (Opcional)
            </p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
            <PhotoUploader 
              photos={photos} 
              onPhotosChange={setPhotos} 
              maxPhotos={2}
            />
          </div>
        </motion.div>
      </div>
    </ServiceRequestChrome>
  );
}
