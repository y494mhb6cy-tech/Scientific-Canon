import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'rse-onboarding-complete';

export default function useOnboarding() {
  const [showHero, setShowHero] = useState(false);
  const [tourStep, setTourStep] = useState(-1); // -1 = not started

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setShowHero(true);
    }
  }, []);

  const dismissHero = useCallback(() => {
    setShowHero(false);
    setTourStep(0);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep((s) => {
      if (s >= 3) {
        localStorage.setItem(STORAGE_KEY, 'true');
        return -1;
      }
      return s + 1;
    });
  }, []);

  const skipTour = useCallback(() => {
    setTourStep(-1);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowHero(true);
    setTourStep(-1);
  }, []);

  return {
    showHero,
    tourStep,
    isTourActive: tourStep >= 0,
    dismissHero,
    nextTourStep,
    skipTour,
    resetOnboarding,
  };
}
