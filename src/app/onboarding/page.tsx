"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the appropriate onboarding flow
    router.push("/onboarding/user-type-selection");
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-4'>Configurando tu perfil...</h1>
      </div>
    </div>
  );
}
