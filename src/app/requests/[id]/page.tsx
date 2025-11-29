"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useParams } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Share2,
  MessageCircle,
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
} from "lucide-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { Footer } from "@/src/shared/components";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/src/shared/components/ui/skeleton';
import { trackWhatsAppClick } from "@/src/shared/lib/gtm";

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

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
    if (id) {
      loadServiceRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadServiceRequest = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/service-requests/${id}`);

      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          toast({
            title: "Solicitud no encontrada",
            description: "Esta solicitud ya no existe",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 2000);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error("No data in response");
      }

      setRequest(result.data);
      setAvatarUrl(result.data.profile_avatar_url);
    } catch (error) {
      console.error("Error fetching service request:", error);
      toast({
        title: "Error",
        description: "Error al cargar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      return;
    }
    if (request?.contact_phone) {
      setContactLoading(true);

      // Track WhatsApp contact
      trackWhatsAppClick(
        request.id,
        request.profile_full_name || 'Usuario',
        {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name,
        }
      );

      const cleanPhone = request.contact_phone.replace(/[^0-9]/g, "");
      const publicationUrl = typeof window !== 'undefined' ? window.location.href : '';
      const message = encodeURIComponent(
        `Hola, vi tu solicitud "${request.title}" en Experto Cerca y me gustaría ayudarte: ${publicationUrl}`
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      toast({ title: "WhatsApp", description: "Abriendo conversación..." });
      setTimeout(() => setContactLoading(false), 600);
    } else {
      toast({
        title: "Contacto",
        description: "No hay información de contacto disponible",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Mira esta solicitud: "${request.title}" en Experto Cerca`;

    if (
      navigator.share &&
      /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: request.title,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Compartido",
          description: "Solicitud compartida exitosamente",
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
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
        {/* Mobile header */}
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

            <Image
              src='/logo-bco-experto-cerca.svg'
              alt='Experto Cerca'
              width={120}
              height={40}
              className='h-6 w-auto cursor-pointer'
              onClick={() => navigate("/")}
              priority
              loading="eager"
              style={{ cursor: 'pointer' }}
            />

            <button
              disabled
              className='p-2 -mr-2 rounded-full transition-colors opacity-50 cursor-not-allowed'
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
                aria-label='Compartir solicitud'
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

        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-8 lg:mt-6">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className='min-h-screen bg-background px-4 py-8'>
        <div className='container mx-auto max-w-4xl text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Solicitud no encontrada
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && request && request.user_id === user?.id;
  const photos = request.photos || [];

  return (
    <div className='min-h-screen'>
      {/* Mobile header */}
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

          <Image
            src='/logo-bco-experto-cerca.svg'
            alt='Experto Cerca'
            width={120}
            height={40}
            className='h-6 w-auto cursor-pointer'
            onClick={() => navigate("/")}
            priority
            style={{ cursor: 'pointer' }}
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
              aria-label='Compartir solicitud'
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

      <div className='max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-8 lg:mt-6'>
        {/* Mobile Gallery */}
        <div className='lg:hidden mb-6'>
          {photos.length > 0 && (
            <div className="space-y-4">
              {/* Main image */}
              <div className='aspect-square relative bg-gray-200 overflow-hidden rounded-xl mt-4 md:mt-0'>
                <Image
                  src={photos[selectedImageIndex]}
                  alt={`Foto ${selectedImageIndex + 1}`}
                  fill
                  className='object-cover'
                  priority
                />
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`Miniatura ${index + 1}`}
                        width={80}
                        height={80}
                        className='object-cover w-full h-full'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hero Section */}
        <div className='lg:hidden mb-6'>
          <div className='bg-card rounded-xl p-4'>
            <div className='flex items-center gap-3 mb-4'>
              <EditableAvatar
                avatarUrl={avatarUrl}
                userFullName={request.profile_full_name || 'Usuario'}
                size='md'
                onAvatarChange={() => {}}
                showUploadButton={false}
                isOwner={false}
              />
              <div className='flex-1'>
                <h1 className='text-lg font-bold text-foreground leading-tight'>
                  {request.profile_full_name || 'Usuario'}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Publicado {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: es
                  })}
                </p>
              </div>
            </div>

            {/* Category badge */}
            <div className='mb-3'>
              <span className='inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium'>
                {request.category}
              </span>
            </div>

            {/* Location */}
            {request.location_city && (
              <div className='flex items-center gap-1 mb-3'>
                <MapPin className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-600'>
                  {request.location_city}, {request.location_province}
                </span>
              </div>
            )}

            {/* WhatsApp contact info */}
            {request.contact_phone && user && (
              <div className='p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                    <MessageCircle className='w-3 h-3 text-green-600' />
                  </div>
                  <span className='font-medium text-green-800 text-sm'>
                    WhatsApp
                  </span>
                </div>
                <p className='text-green-700 font-mono text-xs mt-1 ml-8'>
                  {request.contact_phone}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4'>
          {/* Main Content */}
          <div className='lg:col-span-7 space-y-6 lg:order-1'>
            {/* Desktop Gallery */}
            <div className='hidden lg:block'>
              {photos.length > 0 && (
                <div className="space-y-4">
                  <div className='aspect-[4/3] relative bg-gray-200 overflow-hidden rounded-2xl'>
                    <Image
                      src={photos[selectedImageIndex]}
                      alt={`Foto ${selectedImageIndex + 1}`}
                      fill
                      className='object-cover'
                      priority
                    />
                  </div>

                  {photos.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {photos.map((photo: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 ${
                            selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <Image
                            src={photo}
                            alt={`Miniatura ${index + 1}`}
                            width={200}
                            height={200}
                            className='object-cover w-full h-full'
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title and description */}
            <div>
              <h2 className='text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-8 px-1'>
                {request.title}
              </h2>
              <div className='bg-white rounded-xl lg:rounded-2xl p-4 lg:p-8'>
                <p className='text-gray-700 leading-relaxed text-base lg:text-lg break-words whitespace-pre-wrap'>
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className='hidden lg:block lg:col-span-5 xl:col-span-4 lg:order-2'>
            <div className='lg:sticky lg:top-20 space-y-6'>
              <div className='bg-card rounded-2xl p-6'>
                <div className='flex items-center gap-4 mb-6 mt-8'>
                  <EditableAvatar
                    avatarUrl={avatarUrl}
                    userFullName={request.profile_full_name || 'Usuario'}
                    size='lg'
                    onAvatarChange={() => {}}
                    showUploadButton={false}
                    isOwner={false}
                  />
                  <div>
                    <h3 className='text-xl font-bold text-foreground'>
                      {request.profile_full_name || 'Usuario'}
                    </h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Publicado {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className='mb-6'>
                  <h4 className='font-semibold text-foreground mb-3'>
                    Categoría
                  </h4>
                  <span className='inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium'>
                    {request.category}
                  </span>
                </div>

                {/* Location */}
                {request.location_city && (
                  <div className='mb-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Ubicación
                    </h4>
                    <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl'>
                      <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                        <MapPin className='w-4 h-4 text-red-600' />
                      </div>
                      <span className='text-gray-700 font-medium'>
                        {request.location_city}, {request.location_province}
                      </span>
                    </div>
                  </div>
                )}

                <div className='space-y-4'>
                  {request.contact_phone && user && (
                    <div className='p-4 bg-green-50 rounded-xl mb-4'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <MessageCircle className='w-4 h-4 text-green-600' />
                        </div>
                        <span className='font-semibold text-green-800'>
                          WhatsApp
                        </span>
                      </div>
                      <p className='text-green-700 font-mono text-sm ml-11'>
                        {request.contact_phone}
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

      {/* Mobile fixed bottom button */}
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
