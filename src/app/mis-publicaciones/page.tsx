"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Plus, Trash2, Eye, Copy, Briefcase } from "lucide-react";
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
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";

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
  const { setCurrentStep } = useOnboardingProgress();

  const [hasLoadedProfiles, setHasLoadedProfiles] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.id && !hasLoadedProfiles) {
      loadMyProfiles().then(() => setHasLoadedProfiles(true));
    }
  }, [user?.id, loading, loadMyProfiles, hasLoadedProfiles]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDeleteProfile = async (profileId: string) => {
    try {
      setDeletingId(profileId);
      const success = await deleteProfessionalProfile(profileId);
      if (success) {
        setHasLoadedProfiles(false);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const [createLoading, setCreateLoading] = useState(false);
  const handleCreateNew = () => {
    setCurrentStep(OnboardingStep.SPECIALTY_SELECTION);
    setCreateLoading(true);
    navigate("/onboarding/specialty-selection");
    setTimeout(() => setCreateLoading(false), 600);
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/publication?id=${profileId}`);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={`${myProfiles.length > 0 ? 'min-h-screen pb-24 md:pb-8' : 'h-screen flex flex-col overflow-hidden'} bg-background`}>
        <SharedHeader
          showBackButton={false}
          title='Mis Publicaciones'
          rightAction={
            myProfiles.length > 0 ? (
              <LoadingButton
                onClick={handleCreateNew}
                size="sm"
                className='bg-primary hover:bg-primary-dark text-primary-foreground font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2'
                loading={createLoading}
                loadingText='Abriendo'
              >
                <Plus className='w-4 h-4' />
                <span className="hidden sm:inline">Nueva</span>
              </LoadingButton>
            ) : undefined
          }
        />

        {myProfiles.length > 0 ? (
          <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6'>
          {profilesLoading ? (
            <MisPublicationsSkeleton />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {myProfiles.map((profile) => (
              <div
                key={profile.id}
                className='bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200'
              >
                {/* Main image preview */}
                <div className='aspect-video bg-gray-100 overflow-hidden relative'>
                  {profile.main_portfolio_image ? (
                    <img
                      src={profile.main_portfolio_image}
                      alt={profile.trade_name || "Publicación"}
                      className='w-full h-full object-cover'
                      loading='lazy'
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
                  {profile.profile_skills && profile.profile_skills.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                      {profile.profile_skills.slice(0, 3).map((skill, index) => (
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
                      onClick={() => handleViewProfile(profile.id)}
                      className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm'
                    >
                      <Eye className='w-4 h-4' />
                      Ver
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/publication/?id=${profile.id}`
                          );
                          toast({
                            title: "Enlace copiado",
                            description: "El enlace ha sido copiado al portapapeles",
                          });
                        } catch {
                          toast({
                            title: "Error",
                            description: "No se pudo copiar el enlace",
                            variant: "destructive",
                          });
                        }
                      }}
                      className='p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors'
                      title='Copiar enlace'
                    >
                      <Copy className='w-4 h-4' />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className='p-2 border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar publicación?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente tu publicación.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProfile(profile.id)}
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
                Creá tu primera publicación para empezar a ofrecer tus servicios profesionales
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
