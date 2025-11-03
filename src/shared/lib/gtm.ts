// Google Tag Manager utilities
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pageview',
      page: url,
    });
  }
};

// Set user data in dataLayer
export const setUserData = (userData: {
  userId?: string;
  email?: string;
  fullName?: string;
  userType?: 'professional' | 'client';
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'user_data_set',
      user_id: userData.userId,
      user_email: userData.email,
      user_name: userData.fullName,
      user_type: userData.userType,
    });
  }
};

// Event tracking functions
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
};

// Specific event trackers
export const trackUserTypeSelection = (userType: 'professional' | 'client') => {
  trackEvent('user_type_selected', {
    user_type: userType,
  });
};

export const trackLoginAttempt = (method: 'google' | 'email') => {
  trackEvent('login_attempt', {
    method,
  });
};

export const trackWhatsAppClick = (
  professionalId: string, 
  professionalName: string,
  userData?: {
    userId?: string;
    email?: string;
    fullName?: string;
  }
) => {
  trackEvent('whatsapp_contact', {
    professional_id: professionalId,
    professional_name: professionalName,
    // User data who is contacting
    contact_user_id: userData?.userId,
    contact_user_email: userData?.email,
    contact_user_name: userData?.fullName,
  });
};

export const trackSearch = (specialty?: string, zone?: string) => {
  trackEvent('search_performed', {
    specialty,
    zone,
  });
};

export const trackProfileView = (professionalId: string, specialty: string) => {
  trackEvent('profile_view', {
    professional_id: professionalId,
    specialty,
  });
};

export const trackOnboardingStep = (step: string) => {
  trackEvent('onboarding_step', {
    step,
  });
};

export const trackOnboardingComplete = () => {
  trackEvent('onboarding_complete');
};

// TypeScript declaration for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
