import { create } from 'zustand';

interface LoadingState {
  // Simple global loading state
  isLoading: boolean;
  
  // Whether to show the global overlay
  showGlobalOverlay: boolean;
  
  // Optional loading message
  loadingMessage: string;
  
  // Actions
  setLoading: (loading: boolean, message?: string, showOverlay?: boolean) => void;
  clearLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  // Initial state
  isLoading: false,
  showGlobalOverlay: false,
  loadingMessage: 'Cargando...',
  
  // Actions
  setLoading: (loading: boolean, message: string = '', showOverlay: boolean = false) => 
    set({ 
      isLoading: loading,
      showGlobalOverlay: loading && showOverlay,
      loadingMessage: message 
    }),
    
  clearLoading: () => 
    set({ 
      isLoading: false,
      showGlobalOverlay: false,
      loadingMessage: 'Cargando...' 
    })
}));

// Hook principal para usar loading
export const useLoading = () => {
  const { isLoading, loadingMessage, setLoading, clearLoading } = useLoadingStore();
  
  // Función que envuelve cualquier operación asíncrona con loading
  const withLoading = async <T,>(
    operation: () => Promise<T>,
    message: string = ''
  ): Promise<T> => {
    try {
      setLoading(true, message);
      const result = await operation();
      return result;
    } finally {
      clearLoading();
    }
  };

  return {
    isLoading,
    loadingMessage,
    setLoading,
    clearLoading,
    withLoading
  };
};