'use client';

import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

export function useVABranding(vaId: string | null) {
  const { setVABranding, resetBranding } = useBranding();

  useEffect(() => {
    if (!vaId) {
      resetBranding();
      return;
    }

    // Fetch VA details including branding
    const fetchVABranding = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/virtual-airlines/${vaId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const responseData = await response.json();
          const data = responseData.virtualAirline || responseData; // Support both formats
          
          setVABranding(
            {
              primary: data.primary_color || '#00c853',
              secondary: data.secondary_color || '#00a843',
              accent: data.accent_color || '#00ff7f',
              textOnPrimary: data.text_on_primary || '#ffffff',
            },
            data.logo_url,
            data.name
          );
        } else {
          console.error('Failed to fetch VA branding');
          resetBranding();
        }
      } catch (error) {
        console.error('Error fetching VA branding:', error);
        resetBranding();
      }
    };

    fetchVABranding();
  }, [vaId, setVABranding, resetBranding]);
}
