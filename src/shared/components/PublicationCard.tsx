"use client";

import {
  MapPin,
  Phone,
  Wrench,
  Hammer,
  Paintbrush,
  Zap,
  Droplets,
  Scissors,
  Car,
  Home,
} from "lucide-react";
import { Badge } from "@/src/shared/components/ui/badge";

interface Publication {
  id: string;
  trade_name: string;
  description?: string;
  specialty?: string;
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
  main_portfolio_image?: string;
}

interface PublicationCardProps {
  professional: Publication;
  isSelected?: boolean;
  onClick?: (professional: Publication) => void;
  showAllSkills?: boolean;
  className?: string;
}

// Función para mapear especialidades a iconos
const getSpecialtyIcon = (specialty: string) => {
  const specialtyMap: { [key: string]: any } = {
    Electricista: Zap,
    Plomero: Droplets,
    Pintor: Paintbrush,
    Carpintero: Hammer,
    "Técnico en aires": Wrench,
    Peluquero: Scissors,
    Mecánico: Car,
    Limpieza: Home,
  };

  return specialtyMap[specialty] || null;
};

export function PublicationCard({
  professional,
  isSelected = false,
  onClick,
  showAllSkills = false,
  className = "",
}: PublicationCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(professional);
    }
  };

  const skillsToShow = showAllSkills
    ? professional.profile_skills || []
    : (professional.profile_skills || []).slice(0, 2);

  return (
    <div
      className={`group cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-gray-200" : ""
      } ${className}`}
      onClick={handleClick}
      style={{
        outline: "none !important",
        WebkitTapHighlightColor: "transparent",
      }}
      onFocus={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Card container with Airbnb-style shadow */}
      <div
        className='bg-white rounded-xl hover:shadow-md transition-shadow duration-300 overflow-hidden'
        style={{ outline: "none" }}
      >
        {/* Image section - cuadrado como Airbnb */}
        <div className='aspect-square relative bg-gray-200 overflow-hidden'>
          {professional.main_portfolio_image ? (
            <img
              src={professional.main_portfolio_image}
              alt={professional.profile_full_name || "Publication"}
              className='w-full h-full object-cover'
              loading='lazy'
              onError={(e) => {
                console.log("Error loading image:", professional.main_portfolio_image);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>

        {/* Content section */}
        <div className='p-3'>
          <div className='space-y-2'>
            {/* Title and specialty */}
            <div>
              <h3 className='font-semibold text-foreground line-clamp-1 text-base'>
                {professional.trade_name}
              </h3>
              {professional.specialty && (
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  {(() => {
                    const SpecialtyIcon = getSpecialtyIcon(
                      professional.specialty
                    );
                    return SpecialtyIcon ? (
                      <SpecialtyIcon className='h-4 w-4' />
                    ) : null;
                  })()}
                  <span>{professional.specialty}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className='flex items-center gap-1 text-[13px] text-muted-foreground font-normal'>
              <MapPin className='h-4 w-4 flex-shrink-0' />
              <span className='line-clamp-1'>
                {professional.profile_location_city &&
                professional.profile_location_province
                  ? `en ${professional.profile_location_city}, ${professional.profile_location_province}`
                  : "Ubicación no especificada"}
              </span>
            </div>

            {/* Skills */}
            {skillsToShow.length > 0 && (
              <div className='flex flex-wrap gap-1 pt-1'>
                {skillsToShow.map((skill, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='text-xs px-2 py-0.5'
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Price */}
            {professional.hourly_rate && (
              <div className='pt-1'>
                <p className='font-semibold text-foreground'>
                  ${professional.hourly_rate.toLocaleString()}/hora
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicationCard;
