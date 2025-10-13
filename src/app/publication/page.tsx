"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import {
  MapPin,
  Phone,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Home as HomeIcon,
  Scissors,
  Car,
  Snowflake,
  Flame,
  Key,
  Zap as ZapIcon,
  Triangle,
  Share2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useSecureProfessionals } from "@/src/features/professionals";
import { ReviewsSection } from "@/src/shared/components/ReviewsSection";
import { PortfolioSection } from "@/src/shared/components/PortfolioSection";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { Footer } from "@/src/shared/components";
import PublicationSkeleton from "@/src/shared/components/PublicationSkeleton";

export default function PublicationPage() {
  const [id, setId] = useState<string>("");
  const [professional, setProfessional] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { browseProfessionals, discoverProfessionals } =
    useSecureProfessionals();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Listen for login modal events
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const routeId = pathParts[pathParts.length - 1];

      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");

      const professionalId =
        routeId && routeId !== "publication" ? routeId : queryId;
      if (professionalId) setId(professionalId);
    }
  }, []);

  const popularServices = [
    { name: "Electricista", icon: Zap },
    { name: "Plomero", icon: Wrench },
    { name: "Carpintero", icon: Hammer },
    { name: "Pintor", icon: Paintbrush },
    { name: "Albañil", icon: HomeIcon },
    { name: "Jardinero", icon: Scissors },
    { name: "Mecánico", icon: Car },
    { name: "Técnico en aires", icon: Snowflake },
    { name: "Gasista", icon: Flame },
    { name: "Cerrajero", icon: Key },
    { name: "Soldador", icon: ZapIcon },
    { name: "Techista", icon: Triangle },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedZone("all");
  };

  useEffect(() => {
    if (id) loadProfessional();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProfessional = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/professionals/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error("No data in response");
      }

      console.log("[Publication] Professional data:", result.data);
      console.log("[Publication] Avatar URL:", result.data.profile_avatar_url);

      setProfessional(result.data);
      setAvatarUrl(result.data.profile_avatar_url);
      return;
    } catch (fetchError) {
      console.error("[Publication] Error fetching from API:", fetchError);

      // Fallback to browseProfessionals
      try {
        const { data, error } = user
          ? await browseProfessionals()
          : await discoverProfessionals();

        if (error) {
          toast({
            title: "Error",
            description: "No se pudo cargar la publicación",
            variant: "destructive",
          });
          return;
        }

        const prof = data?.find((p: any) => p.id === id);
        if (prof) {
          setProfessional(prof);
          setAvatarUrl(prof.profile_avatar_url);
        } else {
          toast({
            title: "No encontrado",
            description: "La publicación no existe",
            variant: "destructive",
          });
          navigate("/buscar");
        }
      } catch (fallbackError) {
        console.error("[Publication] Fallback error:", fallbackError);
        toast({
          title: "Error",
          description: "Error al cargar la publicación",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const [contactLoading, setContactLoading] = useState(false);
  const handleContact = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      return;
    }
    if (professional?.whatsapp_phone) {
      setContactLoading(true);
      const cleanPhone = professional.whatsapp_phone.replace(/[^0-9]/g, "");
      const publicationUrl = typeof window !== 'undefined' ? window.location.href : '';
      const message = encodeURIComponent(
        `Hola ${professional.profile_full_name}, me gustaría tener más información sobre la siguiente publicación en Experto Cerca: ${publicationUrl}`
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      toast({ title: "WhatsApp", description: "Abriendo conversación..." });
      setTimeout(() => setContactLoading(false), 600);
    } else if (professional?.has_contact_info) {
      toast({
        title: "Contacto disponible",
        description: "Información disponible para usuarios registrados",
      });
    } else {
      toast({
        title: "Contacto",
        description: "WhatsApp no disponible",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (newUrl: string | null) => {
    setAvatarUrl(newUrl);
    if (professional)
      setProfessional({ ...professional, profile_avatar_url: newUrl });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Mira el perfil de ${professional.profile_full_name} - ${professional.specialty || professional.trade_name
      } en Experto Cerca`;

    // Check if mobile device has native share API
    if (
      navigator.share &&
      /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: `${professional.profile_full_name} - Experto Cerca`,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Compartido",
          description: "Publicación compartida exitosamente",
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Desktop: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "URL copiada",
          description: "El enlace ha sido copiado al portapapeles",
        });
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <SharedHeader
          showBackButton={true}
          showSearch={false}
          variant='default'
        />
        <PublicationSkeleton />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className='min-h-screen bg-background px-4 py-8'>
        <div className='container mx-auto max-w-4xl text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Publicación no encontrada
          </h1>
          <Button onClick={() => navigate("/buscar")}>Volver a buscar</Button>
        </div>
      </div>
    );
  }

  const isOwner = user && professional && professional.user_id === user?.id;

  return (
    <div className='min-h-screen'>
      {/* Custom header for publication page - Mobile only */}
      <header className='lg:hidden sticky top-0 z-40 bg-primary'>
        <div className='flex items-center justify-between h-10 px-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors'
          >
            <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </button>

          <img
            src='/logo-bco-experto-cerca.svg'
            alt='Experto Cerca'
            className='h-6'
          />

          <button
            onClick={handleShare}
            className='p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors'
          >
            <Share2 className='h-5 w-5 text-white' />
          </button>
        </div>
      </header>

      {/* Desktop header */}
      <div className='hidden lg:block'>
        <SharedHeader
          showBackButton={true}
          showSearch={false}
          searchCollapsed={true}
          variant='default'
          rightAction={
            <button
              onClick={handleShare}
              className='p-2 h-8 w-8 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center'
              aria-label='Compartir publicación'
            >
              <Share2 className='h-4 w-4 text-white' />
            </button>
          }
          searchProps={{
            searchTerm,
            setSearchTerm,
            selectedZone,
            setSelectedZone,
            popularServices,
            clearFilters,
          }}
        />
      </div>

      <div className='max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-8'>
        {/* Mobile Gallery - Show first */}
        <div className='lg:hidden mb-6'>
          <PortfolioSection
            professionalProfileId={professional?.id}
            isOwner={user?.id === professional?.user_id}
            initialMainImage={professional?.main_portfolio_image}
          />
        </div>

        {/* Mobile Hero Section */}
        <div className='lg:hidden mb-6'>
          <div className='bg-card rounded-xl p-4'>
            <div className='flex items-center gap-3 mb-4'>
              <EditableAvatar
                avatarUrl={avatarUrl}
                userFullName={professional.profile_full_name}
                size='md'
                onAvatarChange={handleAvatarChange}
                showUploadButton={false}
                isOwner={false}
                fallbackAvatarUrl={
                  professional.user_metadata?.avatar_url ||
                  professional.user_metadata?.picture
                }
              />
              <div className='flex-1'>
                <h1 className='text-lg font-bold text-foreground leading-tight'>
                  {professional.profile_full_name}
                </h1>
                {professional.specialty && (
                  <p className='text-sm text-primary font-medium mt-1'>
                    {professional.specialty}
                  </p>
                )}
                {professional.profile_location_city && (
                  <div className='flex items-center gap-1 mt-1'>
                    <MapPin className='w-3 h-3 text-gray-500' />
                    <span className='text-sm text-gray-600'>
                      {professional.profile_location_city}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Specialties */}
            {professional.profile_skills &&
              professional.profile_skills.length > 0 && (
                <div className='mb-4'>
                  <div className='flex flex-wrap gap-1.5'>
                    {professional.profile_skills
                      .slice(0, 3)
                      .map((skill: string, index: number) => (
                        <span
                          key={index}
                          className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
                        >
                          {skill}
                        </span>
                      ))}
                    {professional.profile_skills.length > 3 && (
                      <span className='px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200'>
                        +{professional.profile_skills.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            {professional.whatsapp_phone && user && (
              <div className='p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                    <Phone className='w-3 h-3 text-green-600' />
                  </div>
                  <span className='font-medium text-green-800 text-sm'>
                    WhatsApp
                  </span>
                </div>
                <p className='text-green-700 font-mono text-xs mt-1 ml-8'>
                  {professional.whatsapp_phone}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4'>
          {/* Main Content - Gallery and Description */}
          <div className='lg:col-span-7 space-y-6 lg:order-1'>
            {/* Desktop Gallery - Hidden on mobile */}
            <div className='hidden lg:block'>
              <PortfolioSection
                professionalProfileId={professional?.id}
                isOwner={user?.id === professional?.user_id}
                initialMainImage={professional?.main_portfolio_image}
              />
            </div>

            <div>
              <h2 className='text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-8 px-1'>
                Sobre mi trabajo
              </h2>
              <div className='bg-white rounded-xl lg:rounded-2xl p-4 lg:p-8'>
                <p className='text-gray-700 leading-relaxed text-base lg:text-lg'>
                  {professional.description ||
                    "Profesional comprometido con la excelencia y la satisfacción del cliente. Brindo servicios de alta calidad con atención al detalle y dedicación en cada proyecto."}
                </p>
              </div>
            </div>

            <div>
              <ReviewsSection
                professionalProfileId={professional?.id}
                professionalUserId={professional?.user_id}
              />
            </div>
          </div>

          {/* Desktop Sidebar - Profile Info */}
          <div className='hidden lg:block lg:col-span-5 xl:col-span-4 lg:order-2'>
            <div className='lg:sticky lg:top-20 space-y-6'>
              <div className='bg-card rounded-2xl p-6'>
                <div className='flex items-center gap-4 mb-6 mt-8'>
                  <EditableAvatar
                    avatarUrl={avatarUrl}
                    userFullName={professional.profile_full_name}
                    size='lg'
                    onAvatarChange={handleAvatarChange}
                    showUploadButton={false}
                    isOwner={false}
                    fallbackAvatarUrl={
                      professional.user_metadata?.avatar_url ||
                      professional.user_metadata?.picture
                    }
                  />
                  <div>
                    <h3 className='text-xl font-bold text-foreground'>
                      {professional.profile_full_name}
                    </h3>
                    {professional.specialty && (
                      <p className='text-sm text-primary font-medium mt-1'>
                        {professional.specialty}
                      </p>
                    )}
                  </div>
                </div>
                {professional.profile_skills &&
                  professional.profile_skills.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='font-semibold text-foreground mb-3'>
                        Especialidades
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {professional.profile_skills
                          .slice(0, 4)
                          .map((skill: string, index: number) => (
                            <span
                              key={index}
                              className='px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors'
                            >
                              {skill}
                            </span>
                          ))}
                        {professional.profile_skills.length > 4 && (
                          <span className='px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200'>
                            +{professional.profile_skills.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                {professional.profile_location_city && (
                  <div className='mb-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Zona de trabajo
                    </h4>
                    <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                        <MapPin className='w-4 h-4 text-red-600' />
                      </div>
                      <span className='text-gray-700 font-medium'>
                        {professional.profile_location_city}
                      </span>
                    </div>
                  </div>
                )}
                <div className='space-y-4'>
                  {professional.whatsapp_phone && user && (
                    <div className='p-4 bg-green-50 rounded-xl mb-4'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <Phone className='w-4 h-4 text-green-600' />
                        </div>
                        <span className='font-semibold text-green-800'>
                          WhatsApp
                        </span>
                      </div>
                      <p className='text-green-700 font-mono text-sm ml-11'>
                        {professional.whatsapp_phone}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleContact}
                    className='w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3.5 px-6 rounded-xl transition-all duration-200'
                  >
                    {user
                      ? "Contactar por WhatsApp"
                      : "Inicia sesión para contactar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-white border-t border-gray-200 shadow-lg' style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className='max-w-6xl mx-auto px-3 sm:px-6 py-3'>
          <LoadingButton
            onClick={handleContact}
            className='w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md'
            loading={contactLoading}
            loadingText={user ? "Abriendo WhatsApp" : "Inicia sesión"}
          >
            <MessageCircle className='w-5 h-5' />
            <span className='text-sm'>
              {user ? "Contactar por WhatsApp" : "Inicia sesión para contactar"}
            </span>
          </LoadingButton>
        </div>
      </div>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
