'use client';

import { SearchProvider } from './searchContext';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration - simplified
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't show loading during hydration to improve perceived performance
  if (!isHydrated) {
    return (
      <SearchProvider>
        {children}
      </SearchProvider>
    );
  }

  return (
    <SearchProvider>
      {children}
    </SearchProvider>
  );
}
