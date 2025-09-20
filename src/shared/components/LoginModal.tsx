import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { useLoading } from "@/src/shared/stores/useLoadingStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { user, loading: authLoading } = useAuthState();
  const { signInWithGoogle } = useAuthActions();
  const { setLoading, clearLoading } = useLoading();
  const [hasInitiatedLogin, setHasInitiatedLogin] = useState(false);

  // Effect to handle modal close when authentication completes
  useEffect(() => {
    // If user successfully logs in and we had initiated login, close modal after a small delay
    if (user && hasInitiatedLogin && !authLoading) {
      // Small delay to ensure redirect logic has time to run
      const timeout = setTimeout(() => {
        setHasInitiatedLogin(false);
        clearLoading();
        onClose();
      }, 1000); // Increased delay to ensure everything processes

      return () => clearTimeout(timeout);
    }
  }, [user, hasInitiatedLogin, authLoading, clearLoading, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setHasInitiatedLogin(true);
    setLoading(true, "Iniciando sesión...", false); // false = no mostrar overlay
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setHasInitiatedLogin(false);
        clearLoading();
      }
      
      // Don't close modal here - let the effect handle it when auth completes
      // Keep loading state active until useEffect clears it
    } catch (error) {
      setHasInitiatedLogin(false);
      clearLoading();
    }
  };

  const handleClose = () => {
    // Reset loading states when closing manually
    clearLoading();
    setHasInitiatedLogin(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm md:max-w-2xl h-[75vh] md:h-[80vh] mx-auto overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-end p-6 pb-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col px-6 pb-6 md:px-12 md:pb-12">
            
            {/* Title and Content Container */}
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                  ¡Bienvenido a Experto Cerca!
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Conectamos expertos con personas que necesitan servicios profesionales
                </p>
              </div>

              {/* Google Login Button */}
              <LoadingButton
                onClick={handleGoogleLogin}
                className="w-full h-14 md:h-16 text-base md:text-lg font-medium bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </LoadingButton>

              <p className="text-sm text-center text-muted-foreground mt-6">
                Al continuar, aceptas nuestros términos de servicio
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}