import { create } from 'zustand';

export const useStep = create((set) => ({
  currentStep: 1,
  nextStep: () => set((state: any) => ({ currentStep: state.currentStep + 1 })),
  previousStep: () =>
    set((state: any) => ({ currentStep: state.currentStep - 1 })),
}));
