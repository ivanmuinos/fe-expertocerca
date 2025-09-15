import { motion, AnimatePresence } from "framer-motion";
import { useLoadingStore } from "@/src/shared/stores/useLoadingStore";

export function GlobalLoading() {
  const isLoading = useLoadingStore(state => state.isLoading);
  const loadingMessage = useLoadingStore(state => state.loadingMessage);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {loadingMessage}
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor espera un momento
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}