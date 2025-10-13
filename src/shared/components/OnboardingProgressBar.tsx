"use client";

import { useOnboardingProgress } from '@/src/shared/stores/useOnboardingProgressStore';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OnboardingProgressBarProps {
  className?: string;
  fixed?: boolean;
}

export const OnboardingProgressBar = ({ className = '', fixed = false }: OnboardingProgressBarProps) => {
  const store = useOnboardingProgress();
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();

  // Subscribe to store changes
  const currentStep = store.currentStep;
  const targetProgress = store.getProgressPercentage();
  const previousProgress = store.getPreviousProgress();

  // Prevent hydration issues by only running on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle progress updates with smooth animation
  useEffect(() => {
    if (!isMounted || !store.isHydrated) return;

    // Animate to target progress
    const timer = setTimeout(() => {
      controls.start({
        width: `${targetProgress}%`,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [targetProgress, currentStep, controls, isMounted, store.isHydrated]);

  // Don't render anything until mounted (prevents SSR mismatch)
  if (!isMounted) {
    return (
      <div className={`${fixed ? 'fixed bottom-24 left-0 right-0 z-30' : 'flex-shrink-0 w-full'} bg-gray-200/80 ${className}`}>
        <div className="h-2 bg-gray-300"></div>
      </div>
    );
  }

  const currentTargetProgress = targetProgress;

  const progressBarContent = (
    <div className="h-2 bg-gray-200 relative overflow-hidden">
      <motion.div
        className="h-full bg-primary relative overflow-hidden"
        animate={controls}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.4,
            repeat: currentTargetProgress < 100 ? Infinity : 0,
            repeatDelay: 2.5
          }}
        />
      </motion.div>
    </div>
  );

  if (fixed) {
    return (
      <div className={`fixed bottom-24 left-0 right-0 z-30 bg-gray-200/80 backdrop-blur-sm ${className}`}>
        {progressBarContent}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 w-full bg-gray-200/80 ${className}`}>
      {progressBarContent}
    </div>
  );
};