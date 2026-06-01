import React, { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '@/lib/storage';
import { THEMES, CTheme, ThemeName, DEFAULT_THEME } from '@/constants/themes';

interface ThemeContextType {
  theme: CTheme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[DEFAULT_THEME],
  themeName: DEFAULT_THEME,
  setThemeName: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    storage.getItem('cercles_theme').then((stored) => {
      if (stored && stored in THEMES) {
        setThemeNameState(stored as ThemeName);
      }
    });
  }, []);

  const setThemeName = async (name: ThemeName) => {
    setThemeNameState(name);
    await storage.setItem('cercles_theme', name);
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeName], themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
