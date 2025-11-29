"use client";

import { Briefcase, Search, X } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import { useNavigate } from '@/src/shared/lib/navigation';

interface PublishTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishTypeModal({ open, onOpenChange }: PublishTypeModalProps) {
  const navigate = useNavigate();

  const handleProfessionalClick = () => {
    onOpenChange(false);
    navigate('/onboarding/professional-intro');
  };

  const handleRequestClick = () => {
    onOpenChange(false);
    navigate('/requests/new/problem');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 md:hidden'
        onClick={handleClose}
      />
      
      {/* Desktop backdrop */}
      <div
        className='hidden md:block fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'
        onClick={handleClose}
      />

      {/* Mobile Drawer - Bottom Sheet */}
      <div className='md:hidden fixed inset-x-0 bottom-0 z-[100] bg-background shadow-2xl flex flex-col rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300'
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className='w-full flex justify-center pt-3 pb-2'>
          <div className='w-10 h-1 bg-gray-300 rounded-full' />
        </div>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h2 className='text-xl font-bold text-foreground'>
            ¿Qué deseas publicar?
          </h2>
          <Button
            variant='ghost'
            onClick={handleClose}
            className='h-9 w-9 p-0 rounded-full hover:bg-gray-100'
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          <p className='text-sm text-muted-foreground mb-6'>
            Elige el tipo de publicación que quieres crear
          </p>

          <div className='space-y-3'>
            {/* Professional Option */}
            <button
              onClick={handleProfessionalClick}
              className='w-full text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-primary active:bg-gray-50 transition-all duration-200 group'
            >
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center group-active:scale-95 transition-transform duration-200'>
                  <Briefcase className='w-7 h-7 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-foreground mb-1'>
                    Soy Profesional
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Ofrece tus servicios y consigue clientes
                  </p>
                </div>
              </div>
            </button>

            {/* Request Option */}
            <button
              onClick={handleRequestClick}
              className='w-full text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-secondary active:bg-gray-50 transition-all duration-200 group'
            >
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-active:scale-95 transition-transform duration-200'>
                  <Search className='w-7 h-7 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-foreground mb-1'>
                    Necesito un Experto
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Publica tu problema y encuentra profesionales
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Modal - Centered */}
      <div className='hidden md:block fixed inset-0 z-[60] pointer-events-none'>
        <div className='absolute inset-0 flex items-center justify-center p-4'>
          <div
            className='bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 pb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-foreground'>
                ¿Qué deseas publicar?
              </h2>
              <Button
                variant='ghost'
                onClick={handleClose}
                className='h-8 w-8 p-0 hover:bg-gray-100 rounded-full'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* Content */}
            <div className='p-6 space-y-3'>
              <p className='text-sm text-muted-foreground mb-6'>
                Elige el tipo de publicación que quieres crear
              </p>

              {/* Professional Option */}
              <button
                onClick={handleProfessionalClick}
                className='w-full text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-200 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                    <Briefcase className='w-7 h-7 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-foreground mb-1'>
                      Soy Profesional
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Ofrece tus servicios y consigue clientes
                    </p>
                  </div>
                </div>
              </button>

              {/* Request Option */}
              <button
                onClick={handleRequestClick}
                className='w-full text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-secondary hover:shadow-lg transition-all duration-200 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200'>
                    <Search className='w-7 h-7 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-foreground mb-1'>
                      Necesito un Experto
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Publica tu problema y encuentra profesionales
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
