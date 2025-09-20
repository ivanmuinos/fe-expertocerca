import { useEffect, useState } from 'react';
import { useAuthState } from '@/src/features/auth';
import { apiClient } from '@/src/shared/lib/api-client';

export interface OnboardingStatus {
  isLoading: boolean;
  hasProfile: boolean;
  isCompleted: boolean;
  userType: 'customer' | 'professional' | null;
  needsOnboarding: boolean;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user, loading: authLoading } = useAuthState();
  const [status, setStatus] = useState<OnboardingStatus>({
    isLoading: true,
    hasProfile: false,
    isCompleted: false,
    userType: null,
    needsOnboarding: false,
  });
  const [hasChecked, setHasChecked] = useState(false);

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
        setHasChecked(true);
        return;
      }

      // Prevent multiple calls for the same user
      if (hasChecked) {
        return;
      }

      try {
        const statusData = await apiClient.getOnboardingStatus();


        setStatus({
          isLoading: false,
          hasProfile: statusData.hasProfile,
          isCompleted: statusData.isCompleted,
          userType: statusData.userType,
          needsOnboarding: statusData.needsOnboarding,
        });
        setHasChecked(true);
      } catch (error) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        setHasChecked(true);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, hasChecked]);

  // Reset hasChecked when user changes
  useEffect(() => {
    setHasChecked(false);
  }, [user?.id]);

  return status;
}