"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Plus, Trash2, Copy, Briefcase } from "lucide-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import MisPublicationsSkeleton from "@/src/shared/components/MisPublicationsSkeleton";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { useMyProfessionalProfiles } from "@/src/features/professionals";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/shared/components/ui/alert-dialog";

export default function MyPublicationsPage() {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    loading: profilesLoading,
    myProfiles,
    loadMyProfiles,
    deleteProfessionalProfile,
  } = useMyProfessionalProfiles();

  const [hasLoadedProfiles, setHasLoadedProfiles] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loading || !user) return;
    if (user.id && !hasLoadedProfiles) {
      loadMyProfiles().then(() => setHasLoadedProfiles(true));
    }
  }, [user?.id, loading, loadMyProfiles, hasLoadedProfiles]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  
  const handleDeleteProfile = async (profileId: string) => {
    try {
      setDeletingId(profileId);
      const success = await deleteProfessionalProfile(profileId);
      if (success) {
        // Mark as deleted to prevent any further requests
        setDeletedIds(prev => new Set(prev).add(profileId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const [createLoading, setCreateLoading] = useState(false);
  const handleCreateNew = () => {
    setCreateLoading(true);
    navigate("/onboarding/user-type-selection");
    setTimeout(() => setCreateLoading(false), 600);
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/publication?id=${profileId}`);
  };

  // Show skeleton while auth is loading or while profiles are being loaded for the first time
  if (loading || (profilesLoading && !hasLoadedProfiles)) {
    return (
      <div className='min-h-screen bg-background'>
        {/* Custom header for mis-publicaciones - Mobile only */}
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
              className='h-6 w-auto'
              priority
            />

            <div className='w-9' />
          </div>
        </header>

        {/* Desktop header */}
        <div className='hidden lg:block'>
          <SharedHeader showBackButton={false} title='Mis Publicaciones' />
        </div>

        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6'>
          <MisPublicationsSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div
        className={`${
          myProfiles.length > 0
            ? "min-h-screen pb-24 md:pb-8"
            : "h-screen flex flex-col overflow-hidden"
        } bg-background`}
      >
        {/* Custom header for mis-publicaciones - Mobile only */}
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
              className='h-6 w-auto'
              priority
            />

            <div className='w-9' />
          </div>
        </header>

        {/* Desktop header */}
        <div className='hidden lg:block'>
          <SharedHeader showBackButton={false} title='Mis Publicaciones' />
        </div>

        {myProfiles.length > 0 ? (
          <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6'>
            {profilesLoading ? (
              <MisPublicationsSkeleton />
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* New Publication Card */}
                <button
                  onClick={handleCreateNew}
                  disabled={createLoading}
                  className='bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center min-h-[200px] sm:aspect-[4/5] group'
                >
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-16 h-16 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors'>
                      <Plus className='w-8 h-8 text-gray-400 group-hover:text-gray-500 transition-colors' />
                    </div>
                    <span className='text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors'>
                      {createLoading ? "Cargando..." : "Nueva publicación"}
                    </span>
                  </div>
                </button>

                {myProfiles.filter(p => !deletedIds.has(p.id)).map((profile) => (
                  <div
                    key={`${profile.id}-${profile.updated_at}`}
                    className='bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer group'
                    onClick={() => handleViewProfile(profile.id)}
                  >
                    {/* Main image preview */}
                    <div className='aspect-video bg-gray-100 overflow-hidden relative'>
                      {profile.main_portfolio_image && !imageErrors.has(profile.id) ? (
                        <Image
                          key={`img-${profile.id}`}
                          src={profile.main_portfolio_image}
                          alt={profile.trade_name || "Publicación"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className='object-cover group-hover:scale-105 transition-transform duration-200'
                          quality={85}
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(profile.id));
                          }}
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-400'>
                          <Briefcase className='w-12 h-12' />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='p-4 space-y-3'>
                      {/* Avatar and title */}
                      <div className='flex gap-3'>
                        <EditableAvatar
                          avatarUrl={profile.profile_avatar_url}
                          userFullName={profile.profile_full_name}
                          size='sm'
                          showUploadButton={false}
                          isOwner={true}
                        />
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-gray-900 truncate text-base'>
                            {profile.trade_name}
                          </h3>
                          {profile.profile_location_city && (
                            <p className='text-sm text-gray-500'>
                              {profile.profile_location_city}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      {profile.profile_skills &&
                        profile.profile_skills.length > 0 && (
                          <div className='flex flex-wrap gap-1.5'>
                            {profile.profile_skills
                              .slice(0, 3)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className='px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium'
                                >
                                  {skill}
                                </span>
                              ))}
                            {profile.profile_skills.length > 3 && (
                              <span className='px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-xs border border-gray-200'>
                                +{profile.profile_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                      {/* Actions */}
                      <div className='flex items-center gap-2 pt-2'>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await navigator.clipboard.writeText(
                                `${window.location.origin}/publication/?id=${profile.id}`
                              );
                              toast({
                                title: "Enlace copiado",
                                description:
                                  "El enlace ha sido copiado al portapapeles",
                              });
                            } catch {
                              toast({
                                title: "Error",
                                description: "No se pudo copiar el enlace",
                                variant: "destructive",
                              });
                            }
                          }}
                          className='flex-1 p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2'
                          title='Copiar enlace'
                        >
                          <Copy className='w-4 h-4' />
                          <span className='text-sm font-medium'>Compartir</span>
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className='p-2 border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Eliminar publicación?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará
                                permanentemente tu publicación.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProfile(profile.id);
                                }}
                                disabled={deletingId === profile.id}
                                className='bg-red-600 hover:bg-red-700'
                              >
                                {deletingId === profile.id
                                  ? "Eliminando..."
                                  : "Eliminar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Empty state - centered and no scroll
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center max-w-md px-4 -mt-10 md:mt-0'>
              <div className='w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center'>
                <Briefcase className='w-10 h-10 text-primary' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No tenés publicaciones aún
              </h3>
              <p className='text-gray-600 mb-6 text-sm'>
                Creá tu primera publicación para empezar a ofrecer tus servicios
                profesionales
              </p>
              <LoadingButton
                onClick={handleCreateNew}
                className='bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto'
                loading={createLoading}
                loadingText='Abriendo'
              >
                <Plus className='w-5 h-5' />
                Crear mi primera publicación
              </LoadingButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
