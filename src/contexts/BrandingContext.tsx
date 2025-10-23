'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  textOnPrimary: string;
}

interface BrandingContextType {
  colors: BrandingColors;
  logoUrl: string | null;
  vaName: string | null;
  setVABranding: (colors: BrandingColors, logoUrl: string | null, vaName: string | null) => void;
  resetBranding: () => void;
}

const defaultColors: BrandingColors = {
  primary: '#00c853',
  secondary: '#00a843',
  accent: '#00ff7f',
  textOnPrimary: '#ffffff',
};

const BrandingContext = createContext<BrandingContextType>({
  colors: defaultColors,
  logoUrl: null,
  vaName: null,
  setVABranding: () => {},
  resetBranding: () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<BrandingColors>(defaultColors);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [vaName, setVaName] = useState<string | null>(null);

  const setVABranding = (
    newColors: BrandingColors,
    newLogoUrl: string | null,
    newVaName: string | null
  ) => {
    setColors(newColors);
    setLogoUrl(newLogoUrl);
    setVaName(newVaName);
    
    // Apply CSS variables for dynamic theming
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary', newColors.primary);
      document.documentElement.style.setProperty('--color-secondary', newColors.secondary);
      document.documentElement.style.setProperty('--color-accent', newColors.accent);
      document.documentElement.style.setProperty('--color-text-on-primary', newColors.textOnPrimary);
      
      // Calculate lighter and darker variants for better UI
      const primaryRgb = hexToRgb(newColors.primary);
      if (primaryRgb) {
        document.documentElement.style.setProperty('--color-primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
        document.documentElement.style.setProperty('--color-primary-medium', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
      }
    }
  };

  const resetBranding = () => {
    setColors(defaultColors);
    setLogoUrl(null);
    setVaName(null);
    
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary', defaultColors.primary);
      document.documentElement.style.setProperty('--color-secondary', defaultColors.secondary);
      document.documentElement.style.setProperty('--color-accent', defaultColors.accent);
      document.documentElement.style.setProperty('--color-text-on-primary', defaultColors.textOnPrimary);
    }
  };

  return (
    <BrandingContext.Provider value={{ colors, logoUrl, vaName, setVABranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
