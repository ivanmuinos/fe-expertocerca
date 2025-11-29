import { memo } from "react";
import useEmblaCarousel from "embla-carousel-react";
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

  // Limit to 7 professionals per category for main page
  const displayedProfessionals = professionals.slice(0, 7);

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
          {displayedProfessionals.map((professional, index) => (
            <div
              key={professional.id}
              className="flex-[0_0_45%] min-w-0"
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

      {/* Desktop Grid */}
      <div className='hidden md:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4'>
        {displayedProfessionals.map((professional, index) => (
          <div
            key={professional.id}
            className='w-full'
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
  );
};

// Memoize to prevent re-renders when parent re-renders
export const ProfessionalCarousel = memo(ProfessionalCarouselComponent);
