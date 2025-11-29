import { useCallback, useEffect, useState, memo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { useNavigate } from "@/src/shared/lib/navigation";
import PublicationCard from "@/src/shared/components/PublicationCard";
import type { ServiceRequest } from "@/src/features/service-requests/types";

interface ServiceRequestCarouselProps {
  categoryName: string;
  requests: ServiceRequest[];
}

// Transform ServiceRequest to match Publication interface
const transformRequestToPublication = (request: ServiceRequest) => ({
  id: request.id,
  trade_name: request.title,
  description: request.description,
  specialty: request.category,
  years_experience: 0,
  user_id: request.user_id,
  profile_full_name: request.profile_full_name || 'Usuario',
  profile_location_city: request.location_city,
  profile_location_province: request.location_province,
  profile_skills: [],
  profile_avatar_url: request.profile_avatar_url,
  has_contact_info: !!(request.contact_phone || request.contact_email),
  whatsapp_phone: request.contact_phone,
  hourly_rate: undefined,
  main_portfolio_image: request.photos?.[0] || undefined,
  license_number: undefined,
});

const ServiceRequestCarouselComponent = ({
  categoryName,
  requests,
}: ServiceRequestCarouselProps) => {
  const navigate = useNavigate();

  // Limit to 7 requests per category for main page
  const displayedRequests = requests.slice(0, 7);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: true, // Allow free scrolling
  });

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-semibold'>{categoryName}</h2>
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {displayedRequests.map((request, index) => (
            <div
              key={request.id}
              className="flex-[0_0_45%] min-w-0"
            >
              <PublicationCard
                professional={transformRequestToPublication(request)}
                onClick={() => navigate(`/requests/${request.id}`)}
                priority={index < 2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className='hidden md:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4'>
        {displayedRequests.map((request, index) => (
          <div
            key={request.id}
            className='w-full'
          >
            <PublicationCard
              professional={transformRequestToPublication(request)}
              onClick={() => navigate(`/requests/${request.id}`)}
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoize to prevent re-renders when parent re-renders
export const ServiceRequestCarousel = memo(ServiceRequestCarouselComponent);
