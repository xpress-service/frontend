'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useCallback } from 'react';

// Optimized navigation hook with better performance
export const useOptimizedNavigation = () => {
  const router = useRouter();

  const navigateTo = useCallback((path: string, replace: boolean = false) => {
    // Use React's startTransition to mark navigation as non-urgent
    startTransition(() => {
      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    });
  }, [router]);

  const navigateWithPreload = useCallback((path: string) => {
    // Preload the route before navigation
    router.prefetch(path);
    
    // Small delay to allow prefetching
    setTimeout(() => {
      startTransition(() => {
        router.push(path);
      });
    }, 50);
  }, [router]);

  return {
    navigateTo,
    navigateWithPreload,
    prefetch: router.prefetch
  };
};