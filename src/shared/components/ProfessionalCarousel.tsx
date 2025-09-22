"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/src/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@/src/shared/lib/navigation";
import ProfessionalCard from "@/src/shared/components/ProfessionalCard";

interface Professional {
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

interface ProfessionalCarouselProps {
  categoryName: string;
  professionals: Professional[];
}

export function ProfessionalCarousel({
  categoryName,
  professionals,
}: ProfessionalCarouselProps) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 1280px)": { slidesToScroll: 4 },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-semibold'>{categoryName}</h2>
        <div className='flex items-center gap-2'>
          <span className='text-xs sm:text-sm text-muted-foreground'>
            {professionals.length} disponible
            {professionals.length !== 1 ? "s" : ""}
          </span>
          <div className='hidden sm:flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={scrollPrev}
              className='h-7 w-7 p-0 rounded-full border-2'
            >
              <ChevronLeft className='h-3 w-3' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={scrollNext}
              className='h-7 w-7 p-0 rounded-full border-2'
            >
              <ChevronRight className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </div>

      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-2 sm:gap-3'>
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className='flex-shrink-0 w-[160px] sm:w-[180px]'
            >
              <ProfessionalCard
                professional={professional}
                onClick={() => navigate(`/profesional?id=${professional.id}`)}
                showAllSkills={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
