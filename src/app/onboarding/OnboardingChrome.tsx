"use client";

import Link from "next/link";
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
  const hideAllChrome = normalized === "/onboarding/user-type-selection";
  const headerOnly = normalized === "/onboarding/completion";
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
        <div className='fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border'>
          <div className='mx-2 px-4 py-4 flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2'>
              <img
                src='/logo-color-experto-cerca.svg'
                alt='Experto Cerca'
                className='h-12 md:h-14'
              />
            </Link>
            {!headerOnly && (
              <Link
                href='/'
                className='px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200'
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
            ? "pt-20 pb-0"
            : "pt-20 pb-24"
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
        <div className='fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border'>
          <div className='w-full'>
            {/* Progress bar flush to top, full width */}
            <div className='w-full'>
              <OnboardingProgressBar />
            </div>
            {/* Footer controls row */}
            <div className='w-full px-4 py-3'>
              <div className='flex items-center justify-between'>
                <LoadingButton
                  onClick={leftButton?.onClick}
                  variant='link'
                  className={`text-sm underline font-medium px-0 ${
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
                  className='px-8 h-11 text-sm md:px-8 md:h-12 md:text-base font-medium bg-primary text-white rounded-xl disabled:opacity-50'
                >
                  {rightButton?.label || "Continuar"}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
