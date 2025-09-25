"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Plus, Trash2, Eye } from "lucide-react";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { useMyProfessionalProfiles } from "@/src/features/professionals";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";

export default function MisPublicacionesPage() {
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
    if (user?.id && !hasLoadedProfiles) {
      console.log("Loading profiles for user:", user.id);
      loadMyProfiles().then(() => {
        setHasLoadedProfiles(true);
      });
    }
  }, [user?.id, loadMyProfiles, hasLoadedProfiles]);

  useEffect(() => {
    console.log("Current profiles:", myProfiles);
    console.log("Profiles loading:", profilesLoading);
  }, [myProfiles, profilesLoading]);

  const handleDeleteProfile = async (profileId: string) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
      )
    ) {
      const success = await deleteProfessionalProfile(profileId);
      if (success) {
        toast({
          title: "Publicación eliminada",
          description: "La publicación ha sido eliminada exitosamente",
        });
        setHasLoadedProfiles(false);
      }
    }
  };

  const handleCreateNew = () => {
    setCurrentStep(OnboardingStep.SPECIALTY_SELECTION);
    navigate("/specialty-selection");
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profesional?id=${profileId}`);
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
    <div className='min-h-screen'>
      <SharedHeader showBackButton={true} title='Mis Publicaciones' />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-semibold text-foreground mb-3'>
              Mis publicaciones
            </h1>
            <p className='text-muted-foreground text-lg'>
              Gestiona tus servicios profesionales y crea nuevas publicaciones
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className='bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Nueva publicación
          </button>
        </div>

        {profilesLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-card border border-border rounded-2xl p-6 animate-pulse'
              >
                <div className='space-y-4'>
                  <div className='flex gap-4'>
                    <div className='h-16 w-16 bg-gray-200 rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                  </div>
                  <div className='h-20 bg-gray-200 rounded-xl'></div>
                  <div className='flex gap-2'>
                    <div className='h-6 bg-gray-200 rounded-full w-16'></div>
                    <div className='h-6 bg-gray-200 rounded-full w-20'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : myProfiles.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {myProfiles.map((profile) => (
              <div
                key={profile.id}
                className='bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]'
              >
                <div className='space-y-5'>
                  <div className='flex gap-4'>
                    <EditableAvatar
                      avatarUrl={profile.profile_avatar_url}
                      userFullName={profile.profile_full_name}
                      size='md'
                      showUploadButton={false}
                      isOwner={true}
                    />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-foreground truncate text-lg'>
                        {profile.trade_name}
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        {profile.profile_location_city}
                      </p>
                    </div>
                  </div>
                  {profile.profile_skills &&
                    profile.profile_skills.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {profile.profile_skills
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className='px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium'
                            >
                              {skill}
                            </span>
                          ))}
                        {profile.profile_skills.length > 3 && (
                          <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm border border-border'>
                            +{profile.profile_skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  {profile.hourly_rate && (
                    <div className='bg-muted border border-border rounded-xl p-3'>
                      <span className='font-semibold text-foreground text-lg'>
                        ${profile.hourly_rate}
                      </span>
                      <span className='text-muted-foreground text-sm ml-1'>
                        ARS / hora
                      </span>
                    </div>
                  )}

                  <div className='flex gap-2 pt-2'>
                    <button
                      onClick={() => handleViewProfile(profile.id)}
                      className='flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 px-2 sm:px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2'
                    >
                      <Eye className='w-4 h-4' />
                      <span className='hidden sm:inline'>Ver</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className='px-2 sm:px-4 py-2.5 border border-destructive/20 hover:border-destructive/40 text-destructive hover:text-destructive/80 rounded-xl transition-colors duration-200 flex items-center justify-center'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-20'>
            <div className='max-w-md mx-auto bg-card border border-border rounded-2xl p-12'>
              <div className='w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center'>
                <Plus className='w-12 h-12 text-muted-foreground' />
              </div>
              <h3 className='text-2xl font-semibold text-foreground mb-3'>
                No tienes publicaciones aún
              </h3>
              <p className='text-muted-foreground mb-8 leading-relaxed'>
                Crea tu primera publicación para empezar a ofrecer tus servicios
                profesionales
              </p>
              <button
                onClick={handleCreateNew}
                className='bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto'
              >
                <Plus className='w-5 h-5' />
                Crear mi primera publicación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
