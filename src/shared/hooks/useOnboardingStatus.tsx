import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/src/integrations/supabase/client';

export interface OnboardingStatus {
  isLoading: boolean;
  hasProfile: boolean;
  isCompleted: boolean;
  userType: 'customer' | 'professional' | null;
  needsOnboarding: boolean;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    isLoading: true,
    hasProfile: false,
    isCompleted: false,
    userType: null,
    needsOnboarding: false,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) {
        setStatus(prev => ({ ...prev, isLoading: true }));
        return;
      }

      if (!user) {
        setStatus({
          isLoading: false,
          hasProfile: false,
          isCompleted: false,
          userType: null,
          needsOnboarding: false,
        });
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, user_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking onboarding status:', error);
          setStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const hasProfile = !!profile;
        const isCompleted = profile?.onboarding_completed || false;
        const userType = profile?.user_type || null;
        const needsOnboarding = hasProfile && !isCompleted && userType === 'professional';

        console.log('Onboarding Status Check:', {
          hasProfile,
          isCompleted,
          userType,
          needsOnboarding,
          profileData: profile
        });

        setStatus({
          isLoading: false,
          hasProfile,
          isCompleted,
          userType,
          needsOnboarding,
        });
      } catch (error) {
        console.error('Error in onboarding status check:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  return status;
}