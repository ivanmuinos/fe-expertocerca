"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Settings } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a small delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setShowBanner(false);
    // Here you would initialize your tracking tools
    initializeTracking();
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
    // Only essential cookies
  };

  const handleSavePreferences = (analytics: boolean, marketing: boolean) => {
    const preferences = {
      essential: true,
      analytics,
      marketing,
    };
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    
    if (analytics) {
      initializeTracking();
    }
  };

  const initializeTracking = () => {
    // Initialize Google Analytics or other tracking tools here
    // Example: gtag('consent', 'update', { analytics_storage: 'granted' });
    console.log("Tracking initialized");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
          {!showDetails ? (
            // Simple view
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    Usamos cookies
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. 
                    Al hacer clic en "Aceptar todo", aceptás el uso de todas las cookies.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-semibold"
                    >
                      Aceptar todo
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-2.5 font-semibold"
                    >
                      Rechazar todo
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-100 rounded-full px-6 py-2.5 font-semibold"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Personalizar
                    </Button>
                  </div>
                </div>
                <button
                  onClick={handleRejectAll}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            // Detailed view
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cookie className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    Configuración de cookies
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Volver"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <CookieOption
                  title="Cookies esenciales"
                  description="Necesarias para el funcionamiento básico del sitio (inicio de sesión, seguridad). Siempre activas."
                  required
                  checked={true}
                  onChange={() => {}}
                />
                <CookieOption
                  title="Cookies analíticas"
                  description="Nos ayudan a entender cómo usás el sitio para mejorarlo (Google Analytics)."
                  checked={true}
                  onChange={(checked) => {
                    // Handle analytics preference
                  }}
                  id="analytics"
                />
                <CookieOption
                  title="Cookies de marketing"
                  description="Usadas para mostrarte contenido relevante y medir la efectividad de nuestras campañas."
                  checked={false}
                  onChange={(checked) => {
                    // Handle marketing preference
                  }}
                  id="marketing"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-semibold"
                >
                  Aceptar todo
                </Button>
                <Button
                  onClick={() => {
                    // Get checkbox states and save
                    const analytics = (document.getElementById("analytics") as HTMLInputElement)?.checked || false;
                    const marketing = (document.getElementById("marketing") as HTMLInputElement)?.checked || false;
                    handleSavePreferences(analytics, marketing);
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-2.5 font-semibold"
                >
                  Guardar preferencias
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Podés cambiar tus preferencias en cualquier momento desde la configuración de tu cuenta.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface CookieOptionProps {
  title: string;
  description: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

function CookieOption({ title, description, required, checked, onChange, id }: CookieOptionProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {required && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              Requerida
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={required}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        </label>
      </div>
    </div>
  );
}
