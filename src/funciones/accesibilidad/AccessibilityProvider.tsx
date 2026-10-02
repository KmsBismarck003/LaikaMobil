import React, { createContext, useEffect, useState } from 'react';
import { AccessibilityPreferences, loadAccessibilityPrefs, saveAccessibilityPrefs } from './store';

interface AccessibilityContextData extends AccessibilityPreferences {
  setTextScale: (scale: number) => void;
  setReduceMotion: (reduce: boolean) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextData>({
  textScale: 1.0,
  reduceMotion: false,
  setTextScale: () => {},
  setReduceMotion: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    textScale: 1.0,
    reduceMotion: false,
  });

  useEffect(() => {
    loadAccessibilityPrefs().then(setPrefs);
  }, []);

  const setTextScale = (scale: number) => {
    const newPrefs = { ...prefs, textScale: scale };
    setPrefs(newPrefs);
    saveAccessibilityPrefs(newPrefs);
  };

  const setReduceMotion = (reduce: boolean) => {
    const newPrefs = { ...prefs, reduceMotion: reduce };
    setPrefs(newPrefs);
    saveAccessibilityPrefs(newPrefs);
  };

  return (
    <AccessibilityContext.Provider value={{ ...prefs, setTextScale, setReduceMotion }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
