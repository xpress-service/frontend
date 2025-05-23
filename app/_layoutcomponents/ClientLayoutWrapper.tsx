'use client';
import { SearchProvider } from './searchContext';
import { ReactNode } from 'react';
interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return <SearchProvider>{children}</SearchProvider>;
}
