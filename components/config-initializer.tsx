'use client';

import { useEffect } from 'react';
import { config } from '@/lib/config';

export function ConfigInitializer() {
  useEffect(() => {
    // Initialize the configuration when the app loads
    async function initialize() {
      try {
        await config.initializeConfig();
      } catch (error) {
        console.error('Error initializing config:', error);
      }
    }
    
    initialize();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // This component doesn't render anything
  return null;
}
