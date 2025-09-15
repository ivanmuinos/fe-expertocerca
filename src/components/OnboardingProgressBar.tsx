import { useOnboardingProgress } from '@/stores/useOnboardingProgressStore';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface OnboardingProgressBarProps {
  className?: string;
  fixed?: boolean;
}

export const OnboardingProgressBar = ({ className = '', fixed = false }: OnboardingProgressBarProps) => {
  const { getProgressPercentage, getPreviousProgress } = useOnboardingProgress();
  const targetProgress = getProgressPercentage();
  const startProgress = getPreviousProgress();
  const controls = useAnimation();

  useEffect(() => {
    // Start from the stored previous progress, animate to current
    controls.set({ width: `${startProgress}%` });
    
    // Then animate to target after a small delay
    const timer = setTimeout(() => {
      controls.start({
        width: `${targetProgress}%`,
        transition: {
          duration: 1.0,
          ease: [0.25, 0.1, 0.25, 1], // Airbnb cubic bezier
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [targetProgress, startProgress, controls]);

  const progressBarContent = (
    <>
      <motion.div 
        className="h-2 bg-primary relative overflow-hidden"
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
            repeat: targetProgress < 100 ? Infinity : 0,
            repeatDelay: 2.5
          }}
        />
      </motion.div>
    </>
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