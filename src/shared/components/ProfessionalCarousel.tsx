"use client";

import { useCallback, useEffect, useState, memo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/src/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@/src/shared/lib/navigation";
import PublicationCard from "@/src/shared/components/PublicationCard";

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
  license_number?: string;
}

interface ProfessionalCarouselProps {
  categoryName: string;
  professionals: Professional[];
}

const ProfessionalCarouselComponent = ({
  categoryName,
  professionals,
}: ProfessionalCarouselProps) => {
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

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-semibold'>{categoryName}</h2>
        {(canScrollPrev || canScrollNext) && (
          <div className='flex items-center gap-2'>
            <div className='hidden sm:flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className='h-7 w-7 p-0 rounded-full border-2 disabled:opacity-30'
              >
                <ChevronLeft className='h-3 w-3' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={scrollNext}
                disabled={!canScrollNext}
                className='h-7 w-7 p-0 rounded-full border-2 disabled:opacity-30'
              >
                <ChevronRight className='h-3 w-3' />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-2 sm:gap-3'>
          {professionals.map((professional, index) => (
            <div
              key={professional.id}
              className='flex-shrink-0 w-[160px] sm:w-[200px]'
            >
              <PublicationCard
                professional={professional}
                onClick={() => navigate(`/publication?id=${professional.id}`)}
                showAllSkills={false}
                priority={index < 2}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent re-renders when parent re-renders
export const ProfessionalCarousel = memo(ProfessionalCarouselComponent);
