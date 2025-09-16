'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { usePathname } from 'next/navigation';
import { useAuthState } from '@/src/features/auth';
import { useOnboardingStatus } from './useOnboardingStatus';

export function useUserRedirect() {
  const { user, loading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const pathname = usePathname();
  const onboardingStatus = useOnboardingStatus();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    const checkUserSetup = async () => {
      // If still loading auth or onboarding status, keep checking state as true
      if (authLoading || onboardingStatus.isLoading) {
        setIsCheckingRedirect(true);
        return;
      }

      // If no user, we're done checking (no redirect needed)
      if (!user) {
        setIsCheckingRedirect(false);
        return;
      }

      console.log('User redirect check:', {
        user: !!user,
        hasProfile: onboardingStatus.hasProfile,
        isCompleted: onboardingStatus.isCompleted,
        userType: onboardingStatus.userType,
        currentPath: pathname
      });
      
      const isOnUserTypeSelection = pathname === '/user-type-selection';
      const isOnOnboardingPage = pathname.includes('/professional-') ||
                                pathname.includes('/specialty-') ||
                                pathname.includes('/photo-') ||
                                pathname.includes('/personal-data') ||
                                pathname === '/completion';

      // If user has no profile, redirect to user type selection
      if (!onboardingStatus.hasProfile) {
        console.log('User has no profile, redirecting to user-type-selection');
        if (!isOnUserTypeSelection) {
          navigate('/user-type-selection');
        }
        setIsCheckingRedirect(false);
        return;
      }

      // If onboarding is completed, don't force user to stay in onboarding flow
      if (onboardingStatus.isCompleted) {
        // If user is on user type selection page and already completed, redirect to home
        if (isOnUserTypeSelection) {
          navigate('/');
        }
        setIsCheckingRedirect(false);
        return;
      }

      // If user has incomplete professional onboarding but is not on onboarding pages,
      // don't force redirect - they can complete later
      if (onboardingStatus.needsOnboarding && !isOnOnboardingPage && !isOnUserTypeSelection) {
        // Just let them stay where they are - they can complete onboarding later
        setIsCheckingRedirect(false);
        return;
      }

      // If user is on user type selection but already has a type, they can go back
      if (isOnUserTypeSelection && onboardingStatus.userType) {
        // Don't force them to complete - let them navigate freely
        setIsCheckingRedirect(false);
        return;
      }
        
      setIsCheckingRedirect(false);
    };

    checkUserSetup();
  }, [user, authLoading, onboardingStatus, navigate, pathname]);

  return { isCheckingRedirect };
}