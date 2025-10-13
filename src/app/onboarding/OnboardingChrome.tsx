"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OnboardingProgressBar } from "@/src/shared/components/OnboardingProgressBar";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";

export default function OnboardingChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const normalized = (pathname || "").replace(/\/+$/, "");
  const hideAllChrome = false; // Mostrar header en todas las páginas
  const headerOnly = normalized === "/onboarding/completion" || normalized === "/onboarding/user-type-selection";
  const hideExitButton = normalized === "/onboarding/completion";
  const { leftButton, rightButton } = useOnboardingFooterStore();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const compute = () => {
      const needsScroll = el.scrollHeight > el.clientHeight + 1;
      setCanScroll(needsScroll);
    };

    // Initial compute
    compute();

    // Recompute on resize
    const onResize = () => compute();
    window.addEventListener("resize", onResize);

    // Observe content size changes
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => compute())
        : null;
    if (ro) {
      ro.observe(el);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [pathname]);

  if (hideAllChrome) {
    return <>{children}</>;
  }

  return (
    <div className='min-h-screen bg-gradient-subtle flex flex-col overflow-hidden'>
      {/* Fixed Header */}
      {!hideAllChrome && (
        <div className='fixed top-0 left-0 right-0 z-40 bg-primary'>
          <div className='mx-2 px-4 h-12 flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2'>
              <Image
                src='/logo-bco-experto-cerca.svg'
                alt='Experto Cerca'
                width={120}
                height={24}
                className='h-6 w-auto'
                priority
              />
            </Link>
            {!hideExitButton && (
              <Link
                href='/'
                className='px-3 py-1.5 text-xs bg-white/10 rounded-full hover:bg-white/20 text-white font-medium transition-all duration-200'
              >
                Salir
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main content with padding to avoid overlap and no body scroll */}
      <div
        className={`flex-1 flex flex-col ${
          hideAllChrome
            ? "pt-0 pb-0"
            : headerOnly
            ? "pt-12 pb-0"
            : "pt-12 pb-16"
        } overflow-hidden`}
      >
        <div
          ref={scrollAreaRef}
          className={`flex-1 ${
            canScroll ? "overflow-auto" : "overflow-hidden"
          } overscroll-none`}
        >
          {children}
        </div>
      </div>

      {/* Fixed Footer with Progress Bar full-width */}
      {!hideAllChrome && !headerOnly && (
        <div className='fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm h-16 flex flex-col'>
          {/* Progress bar flush to top, full width */}
          <div className='w-full h-1'>
            <OnboardingProgressBar />
          </div>
          {/* Footer controls row - takes remaining space */}
          <div className='flex-1 w-full px-4 flex items-center justify-between'>
            <LoadingButton
              onClick={leftButton?.onClick}
              variant='link'
              className={`text-xs underline font-medium px-0 h-auto ${
                leftButton?.hidden ? "invisible" : ""
              }`}
              loading={Boolean(leftButton?.loading)}
              loadingText={leftButton?.label || "Atrás"}
              disabled={leftButton?.disabled}
              showSpinner={Boolean(leftButton?.loading)}
            >
              {leftButton?.label || "Atrás"}
            </LoadingButton>
            <LoadingButton
              onClick={rightButton?.onClick}
              loading={Boolean(rightButton?.loading)}
              loadingText={rightButton?.label || "Continuar"}
              disabled={rightButton?.disabled}
              className='px-6 h-10 text-sm font-medium bg-primary text-white rounded-lg disabled:opacity-50'
            >
              {rightButton?.label || "Continuar"}
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
