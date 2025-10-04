"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed =
      (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show banner if not installed, not dismissed recently (7 days), and on mobile
    const shouldShow =
      !isInStandaloneMode && daysSinceDismissed > 7 && window.innerWidth <= 768;

    if (shouldShow) {
      // For Android/Chrome
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowBanner(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // For iOS, show banner after 3 seconds
      if (iOS && !isInStandaloneMode) {
        setTimeout(() => setShowBanner(true), 3000);
      }

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className='fixed bottom-20 left-0 right-0 z-50 mx-4 mb-4 animate-slide-up'>
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-4 text-white'>
        <button
          onClick={handleDismiss}
          className='absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors'
          aria-label='Cerrar'
        >
          <X className='w-4 h-4' />
        </button>

        <div className='flex items-start gap-3 pr-6'>
          <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-2'>
            <img
              src='/isologo-color-experto-cerca.svg'
              alt='Experto Cerca'
              className='w-full h-full object-contain'
            />
          </div>

          <div className='flex-1'>
            <h3 className='font-bold text-base mb-1'>Instala Experto Cerca</h3>
            <p className='text-sm text-blue-100 mb-3'>
              {isIOS
                ? "Agrega esta app a tu pantalla de inicio para acceso rápido"
                : "Instala nuestra app para una experiencia más rápida"}
            </p>

            {isIOS ? (
              <div className='bg-white/10 rounded-lg p-3 text-xs space-y-2'>
                <div className='flex items-center gap-2'>
                  <Share className='w-4 h-4 flex-shrink-0' />
                  <span>
                    1. Toca el botón <strong>Compartir</strong> (abajo)
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Download className='w-4 h-4 flex-shrink-0' />
                  <span>
                    2. Selecciona{" "}
                    <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
                  </span>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleInstallClick}
                className='w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold'
                size='sm'
              >
                <Download className='w-4 h-4 mr-2' />
                Instalar App
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
