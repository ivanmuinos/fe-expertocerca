"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // No mostrar si ya fue cerrado en esta sesión
    if (isDismissed) return;

    // Mostrar después de 10 segundos de navegar
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(showTimer);
  }, [isDismissed]);

  useEffect(() => {
    // Auto-ocultar después de 8 segundos
    if (isVisible) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(hideTimer);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-40 md:max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Publicá gratis sin comisiones
              </p>
              <p className="text-xs text-muted-foreground">
                Conectá con clientes sin costos ocultos
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
