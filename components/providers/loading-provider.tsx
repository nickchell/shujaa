'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Mark styles as loaded once component mounts on client side
    setStylesLoaded(true);
    
    // Show loading screen on initial load
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Minimum loading time of 1 second

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show loading screen on route changes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Shorter loading time for route changes

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Add an additional delay to ensure styles are loaded
  useEffect(() => {
    if (!stylesLoaded) {
      const styleTimer = setTimeout(() => {
        setStylesLoaded(true);
      }, 200);
      return () => clearTimeout(styleTimer);
    }
  }, [stylesLoaded]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {stylesLoaded ? (
        <>
          {isLoading && <LoadingScreen />}
          {children}
        </>
      ) : (
        <LoadingScreen />
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext); 