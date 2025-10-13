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
import Image from "next/image";
import { Badge } from "@/src/shared/components/ui/badge";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { useState, memo } from "react";
import { generateBlurDataURL, getImageSizes } from "@/src/shared/lib/image-optimization";

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

const PublicationCardComponent = ({
  professional,
  isSelected = false,
  onClick,
  showAllSkills = false,
  className = "",
}: PublicationCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => {
    if (onClick) {
      setIsLoading(true);
      try {
        onClick(professional);
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    }
  };

  const skillsToShow = showAllSkills
    ? professional.profile_skills || []
    : (professional.profile_skills || []).slice(0, 2);

  return (
    <div
      className={`group cursor-pointer transition-all duration-200 ${
        isSelected ? "scale-105" : "scale-100"
      } ${className}`}
      onClick={handleClick}
      style={{
        outline: "none !important",
        WebkitTapHighlightColor: "transparent",
      }}
      onFocus={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Card container */}
      <div
        className='bg-white rounded-xl overflow-hidden'
        style={{ outline: "none" }}
      >
        {/* Image section - cuadrado como Airbnb */}
        <div className='aspect-square relative bg-gray-200 overflow-hidden rounded-xl'>
          {professional.main_portfolio_image ? (
            <Image
              src={professional.main_portfolio_image}
              alt={professional.profile_full_name || "Publication"}
              fill
              sizes={getImageSizes.card}
              className='object-cover'
              placeholder="blur"
              blurDataURL={generateBlurDataURL()}
              priority={false}
              quality={85}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>

        {/* Content section */}
        <div className='p-2 sm:p-3'>
          <div className='space-y-1.5 sm:space-y-2'>
            {/* Title and specialty */}
            <div>
              <h3 className='font-semibold text-foreground line-clamp-1 text-xs sm:text-sm'>
                {professional.trade_name}
              </h3>
              {professional.specialty && (
                <div className='flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground'>
                  {(() => {
                    const SpecialtyIcon = getSpecialtyIcon(
                      professional.specialty
                    );
                    return SpecialtyIcon ? (
                      <SpecialtyIcon className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                    ) : null;
                  })()}
                  <span>{professional.specialty}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className='flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground font-normal'>
              <MapPin className='h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0' />
              <span className='line-clamp-1'>
                {professional.profile_location_city &&
                professional.profile_location_province
                  ? `en ${professional.profile_location_city}, ${professional.profile_location_province}`
                  : "Ubicación no especificada"}
              </span>
            </div>

            {/* Skills */}
            {skillsToShow.length > 0 && (
              <div className='flex flex-wrap gap-1 pt-0.5'>
                {skillsToShow.map((skill, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5'
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Price */}
            {professional.hourly_rate && (
              <div className='pt-0.5 sm:pt-1'>
                <p className='font-semibold text-foreground text-xs sm:text-sm'>
                  ${professional.hourly_rate.toLocaleString()}/hora
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PublicationCard = memo(PublicationCardComponent);
export default PublicationCard;
