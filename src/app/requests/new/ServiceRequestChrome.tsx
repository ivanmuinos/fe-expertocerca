"use client";

import Link from "next/link";
import Image from "next/image";

import { useRef } from "react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";

interface ServiceRequestChromeProps {
  children: React.ReactNode;
  footerLeft?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    hidden?: boolean;
  };
  footerRight?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  progress?: number;
}

export default function ServiceRequestChrome({
  children,
  footerLeft,
  footerRight,
  progress = 0,
}: ServiceRequestChromeProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className='h-[100dvh] bg-gradient-subtle flex flex-col overflow-hidden'>
      {/* Fixed Header */}
      <div className='fixed top-0 left-0 right-0 z-40 bg-primary'>
        <div className='mx-2 px-4 h-12 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/logo-bco-experto-cerca.svg'
              alt='Experto Cerca'
              width={120}
              height={40}
              className='h-6 w-auto'
              priority
            />
          </Link>
          <Link
            href='/'
            className='px-3 py-1.5 text-xs bg-white/10 rounded-full hover:bg-white/20 text-white font-medium transition-all duration-200'
          >
            Salir
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-col pt-12 pb-16 overflow-auto'>
        <div ref={scrollAreaRef} className='flex-1 overflow-auto overscroll-none'>
          {children}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className='fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm h-16 flex flex-col'>
        {/* Progress bar */}
        <div className='w-full h-1 bg-gray-100'>
          <div 
            className='h-full bg-primary transition-all duration-500 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Footer controls */}
        <div className='flex-1 w-full px-4 flex items-center justify-between'>
          <LoadingButton
            onClick={footerLeft?.onClick}
            variant='link'
            className={`text-xs underline font-medium px-0 h-auto ${
              footerLeft?.hidden ? "invisible" : ""
            }`}
            loading={Boolean(footerLeft?.loading)}
            loadingText={footerLeft?.label || "Atrás"}
            disabled={footerLeft?.disabled}
            showSpinner={Boolean(footerLeft?.loading)}
          >
            {footerLeft?.label || "Atrás"}
          </LoadingButton>
          
          <LoadingButton
            onClick={footerRight?.onClick}
            loading={Boolean(footerRight?.loading)}
            loadingText={footerRight?.label || "Continuar"}
            disabled={footerRight?.disabled}
            className='px-6 h-10 text-sm font-medium bg-primary text-white rounded-lg disabled:opacity-50'
          >
            {footerRight?.label || "Continuar"}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
