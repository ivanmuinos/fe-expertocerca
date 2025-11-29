"use client";

import { useState } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useServiceRequestStore } from "@/src/features/service-requests/stores/useServiceRequestStore";
import ServiceRequestChrome from "../ServiceRequestChrome";
import { Label } from "@/src/shared/components/ui/label";
import { Input } from "@/src/shared/components/ui/input";
import { ZoneSelector } from "@/src/shared/components/ZoneSelector";
import { motion } from "framer-motion";
import { useCreateServiceRequest } from "@/src/features/service-requests/hooks/useServiceRequests";
import { usePhotoUpload } from "@/src/features/service-requests/hooks/usePhotoUpload";
import { useToast } from "@/src/shared/hooks/use-toast";
import { MessageCircle } from "lucide-react";

export default function ContactoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const store = useServiceRequestStore();
  const createMutation = useCreateServiceRequest();
  const { uploadMultiplePhotos, uploading } = usePhotoUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = store.zone && store.contact_phone;

  const handlePublish = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    try {
      let photoUrls: string[] = [];
      
      // Upload photos if any
      if (store.photos.length > 0) {
        photoUrls = await uploadMultiplePhotos(store.photos);
      }

      // Create service request
      await createMutation.mutateAsync({
        category: store.category,
        title: store.title,
        description: store.description,
        contact_phone: store.contact_phone ? `+54 9 ${store.contact_phone}` : undefined,
        contact_email: store.contact_email,
        location_city: store.zone,
        location_province: store.zone, // Using zone for both for now as per requirement to replace inputs
        photos: photoUrls,
      });
      
      toast({
        title: "¡Solicitud publicada!",
        description: "Los expertos de tu zona podrán contactarte pronto.",
      });

      store.reset();
      navigate("/");
    } catch (error) {
      console.error('Error creating service request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la solicitud. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ServiceRequestChrome
      progress={100}
      footerRight={{
        label: "Publicar Solicitud",
        onClick: handlePublish,
        disabled: !isValid || isSubmitting,
        loading: isSubmitting || uploading,
      }}
      footerLeft={{
        label: "Atrás",
        onClick: () => navigate("/requests/new/photos"),
        disabled: isSubmitting,
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
              Ubicación y Contacto
            </h1>
            <p className="text-sm text-muted-foreground">
              Indica dónde es el trabajo y cómo pueden contactarte.
            </p>
          </div>

          <div className="space-y-6 bg-white/50 rounded-2xl p-6 border border-border/20">
            <div className="space-y-4">
              <ZoneSelector
                value={store.zone}
                onValueChange={(value) => store.setField('zone', value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono</Label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm'>
                  <MessageCircle className='w-4 h-4 text-green-500' />
                  <span className='text-gray-600'>+54 9</span>
                </div>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={store.contact_phone}
                  onChange={(e) => store.setField('contact_phone', e.target.value)}
                  placeholder="11 1234-5678"
                  className="bg-white pl-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email (Opcional)</Label>
              <Input
                id="contact_email"
                type="email"
                value={store.contact_email}
                onChange={(e) => store.setField('contact_email', e.target.value)}
                placeholder="tu@email.com"
                className="bg-white"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </ServiceRequestChrome>
  );
}
