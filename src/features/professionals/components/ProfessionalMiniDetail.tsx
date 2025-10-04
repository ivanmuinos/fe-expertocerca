"use client";

import { useState } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import {
  Clock,
  MapPin,
  Phone,
  Star,
  Calendar,
  DollarSign,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Separator } from "@/src/shared/components/ui/separator";

interface Professional {
  id: string;
  trade_name: string;
  description?: string;
  years_experience?: number;
  user_id: string;
  profile_full_name: string;
  profile_location_city?: string;
  profile_location_province?: string;
  profile_skills?: string[];
  profile_avatar_url?: string;
  has_contact_info?: boolean;
  whatsapp_phone?: string;
  hourly_rate?: number;
}

interface ProfessionalMiniDetailProps {
  professional: Professional | null;
}

export default function ProfessionalMiniDetail({
  professional,
}: ProfessionalMiniDetailProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!professional) {
    return (
      <div className='h-full flex items-center justify-center bg-muted/10'>
        <div className='text-center space-y-4 p-8'>
          <div className='w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center'>
            <Clock className='h-8 w-8 text-muted-foreground' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-muted-foreground'>
              Selecciona un profesional
            </h3>
            <p className='text-sm text-muted-foreground max-w-xs'>
              Haz clic en cualquier profesional de la lista para ver sus
              detalles aquí.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleViewFullProfile = () => {
    navigate(`/publication?id=${professional.id}`);
  };

  const handleContactWhatsApp = () => {
    if (professional.whatsapp_phone) {
      const message = encodeURIComponent(
        `Hola ${professional.profile_full_name}, me interesa tu servicio de ${professional.trade_name}. ¿Podrías brindarme más información?`
      );
      window.open(
        `https://wa.me/${professional.whatsapp_phone.replace(
          /\D/g,
          ""
        )}?text=${message}`,
        "_blank"
      );
    }
  };

  return (
    <div className='h-full bg-background overflow-y-auto scrollbar-hide'>
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-start space-x-4'>
          <Avatar className='w-20 h-20 border-4 border-primary/20'>
            <AvatarImage src={professional.profile_avatar_url} />
            <AvatarFallback className='bg-primary text-primary-foreground text-xl font-bold'>
              {professional.profile_full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-2'>
            <div>
              <h2 className='text-xl font-bold text-foreground'>
                {professional.profile_full_name}
              </h2>
              <p className='text-lg text-primary font-semibold'>
                {professional.trade_name}
              </p>
            </div>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Clock className='h-4 w-4' />
              <span>
                {professional.years_experience || 0} años de experiencia
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 gap-4'>
          <Card className='p-4'>
            <div className='flex items-center space-x-2'>
              <DollarSign className='h-5 w-5 text-primary' />
              <div>
                <p className='text-sm text-muted-foreground'>Tarifa por hora</p>
                <p className='font-semibold'>
                  {professional.hourly_rate
                    ? `$${professional.hourly_rate.toLocaleString()}`
                    : "A consultar"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Location */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <MapPin className='h-4 w-4' />
            <span className='text-sm font-medium'>Ubicación</span>
          </div>
          <p className='text-foreground'>
            {professional.profile_location_city &&
            professional.profile_location_province
              ? `${professional.profile_location_city}, ${professional.profile_location_province}`
              : "Ubicación no especificada"}
          </p>
        </div>

        <Separator />

        {/* Description */}
        <div className='space-y-3'>
          <h3 className='font-semibold'>Descripción</h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {professional.description || "No hay descripción disponible."}
          </p>
        </div>

        {/* Skills */}
        {professional.profile_skills &&
          professional.profile_skills.length > 0 && (
            <div className='space-y-3'>
              <h3 className='font-semibold'>Especialidades</h3>
              <div className='flex flex-wrap gap-2'>
                {professional.profile_skills.map((skill, index) => (
                  <Badge key={index} variant='secondary' className='text-xs'>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        <Separator />

        {/* Action Buttons */}
        <div className='space-y-3'>
          <Button onClick={handleViewFullProfile} className='w-full' size='lg'>
            <ExternalLink className='mr-2 h-4 w-4' />
            Ver perfil completo
          </Button>

          {professional.has_contact_info && professional.whatsapp_phone && (
            <Button
              onClick={handleContactWhatsApp}
              variant='outline'
              className='w-full'
              size='lg'
            >
              <MessageCircle className='mr-2 h-4 w-4' />
              Contactar por WhatsApp
            </Button>
          )}

          <Button variant='outline' className='w-full' size='lg'>
            <Calendar className='mr-2 h-4 w-4' />
            Agendar cita
          </Button>
        </div>

        {/* Contact Info */}
        {professional.has_contact_info && (
          <Card className='p-4 bg-muted/50'>
            <div className='flex items-center space-x-2 text-sm'>
              <Phone className='h-4 w-4 text-primary' />
              <span className='font-medium'>
                Información de contacto disponible
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              El profesional ha verificado sus datos de contacto
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
