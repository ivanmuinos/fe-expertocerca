"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useAuthState } from '@/src/features/auth'
import { useProfiles } from '@/src/features/user-profile';
import { supabase } from '@/src/config/supabase';
import { ProfessionalServiceForm, ProfessionalServiceData } from '@/src/shared/components/ProfessionalServiceForm';
import { SharedHeader } from '@/src/shared/components/SharedHeader';

export default function Publicar() {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { user, loading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const { getProfile } = useProfiles();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?next=/publicar');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profileResult = await getProfile(user.id);
      setUserProfile(profileResult.data);

      // Check if onboarding is completed
      if (!profileResult.data?.onboarding_completed) {
        console.log('Profile onboarding not completed, redirecting...');
        navigate('/onboarding');
        return;
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: ProfessionalServiceData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: user.id,
          trade_name: data.tradeName,
          description: data.description,
          years_experience: data.yearsExperience,
          hourly_rate: data.hourlyRate,
          work_phone: data.workPhone || null,
          whatsapp_phone: data.whatsappPhone || null,
        });

      if (error) throw error;

      console.log('Publication created successfully');
      
      navigate('/mis-publicaciones');
    } catch (error: any) {
      console.error('Error creating publication:', error);
      console.error('Error creating publication:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/mis-publicaciones');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader showBackButton={true} title="Nueva publicación" />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title="Nueva publicación" />
      <ProfessionalServiceForm
        onSave={handleSave}
        onCancel={handleCancel}
        loading={saving}
        title="Nueva publicación"
        subtitle="Crea un nuevo servicio profesional para ofrecer a tus clientes"
      />
    </div>
  );
}