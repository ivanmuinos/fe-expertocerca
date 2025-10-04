"use client";

import { create } from "zustand";

export interface FooterButtonConfig {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
}

interface OnboardingFooterState {
  leftButton?: FooterButtonConfig;
  rightButton?: FooterButtonConfig;
  setLeftButton: (config?: FooterButtonConfig) => void;
  setRightButton: (config?: FooterButtonConfig) => void;
  reset: () => void;
}

export const useOnboardingFooterStore = create<OnboardingFooterState>(
  (set) => ({
    leftButton: undefined,
    rightButton: undefined,
    setLeftButton: (config) => set({ leftButton: config }),
    setRightButton: (config) => set({ rightButton: config }),
    reset: () => set({ leftButton: undefined, rightButton: undefined }),
  })
);
