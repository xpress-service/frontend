'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Performance monitoring component
const PerformanceMonitor = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    // Monitor route changes
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log(`Navigation to ${pathname} took ${entry.duration}ms`);
        }
        
        if (entry.entryType === 'paint') {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        }
        
        // Monitor Long Tasks (blocking the main thread)
        if (entry.entryType === 'longtask') {
          console.warn(`Long task detected: ${entry.duration}ms at ${entry.startTime}ms`);
        }
      });
    });

    // Observe different performance metrics
    observer.observe({ entryTypes: ['navigation', 'paint', 'longtask', 'measure'] });

    // Log route change timing
    const endTime = performance.now();
    console.log(`Route change processing: ${endTime - startTime}ms`);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Monitor component mounting time
  useEffect(() => {
    const mountTime = performance.now();
    console.log(`PerformanceMonitor mounted at: ${mountTime}ms`);
    
    return () => {
      const unmountTime = performance.now();
      console.log(`PerformanceMonitor unmounted after: ${unmountTime - mountTime}ms`);
    };
  }, []);

  return <>{children}</>;
};

export default PerformanceMonitor;