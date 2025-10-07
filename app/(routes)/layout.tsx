'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import DefaultLayout from '../_layoutcomponents/DefaultLayout';
import ClientLayoutWrapper from '../_layoutcomponents/ClientLayoutWrapper';
import { useAuth } from '../contexts/AuthContext';

// Optimized lightweight LoadingSpinner
const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }: { text?: string; fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  return null; // No loading spinner for non-fullscreen to improve performance
};

// Optimized AuthGuard with minimal overhead
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { userId, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if we're sure user is not authenticated and not loading
    if (!isLoading && !isAuthenticated && !userId) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/sign-in' && currentPath !== '/sign-up') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.replace('/sign-in'); // Use replace instead of push for better performance
    }
  }, [isAuthenticated, userId, isLoading, router]);
  
  // Show loading only if we're actually checking auth status
  if (isLoading) {
    return <LoadingSpinner text="Verifying..." fullScreen={true} />;
  }
  
  // If not authenticated, don't render children (redirect is in progress)
  if (!isAuthenticated && !userId) {
    return null;
  }
  
  return <>{children}</>;
};

interface RoutesLayoutProps {
  children: React.ReactNode;
}

export default function RoutesLayout({ children }: RoutesLayoutProps) {
  const pathname = usePathname();
  const { userId, isLoading: authLoading, isAuthenticated } = useAuth();

  // Define paths that don't need the dashboard layout (memoized)
  const excludedPaths = ['/', '/sign-in', '/sign-up'];
  
  // Define paths that require authentication (memoized)
  const protectedPaths = [
    '/dashboard',
    '/orders',
    '/ordertracking', 
    '/servicelist',
    '/postservice',
    '/transaction',
    '/userprofile',
    '/notification'
  ];

  const shouldExcludeLayout = excludedPaths.includes(pathname);
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));

  // Simplified loading check - only show if auth is actually loading
  const showAuthLoading = authLoading && requiresAuth;

  // Show loading only if auth is actually loading for protected routes
  if (showAuthLoading) {
    return <LoadingSpinner text="Checking authentication..." fullScreen={true} />;
  }

  // For excluded paths (landing, sign-in, sign-up), render without layout
  if (shouldExcludeLayout) {
    return (
      <Suspense fallback={null}>
        {children}
      </Suspense>
    );
  }

  // For protected routes, wrap with auth guard
  if (requiresAuth) {
    return (
      <AuthGuard>
        <ClientLayoutWrapper>
          <DefaultLayout serviceOwnerId={userId || ''}>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </DefaultLayout>
        </ClientLayoutWrapper>
      </AuthGuard>
    );
  }

  // For other routes that need layout but don't require auth
  return (
    <ClientLayoutWrapper>
      <DefaultLayout serviceOwnerId={userId || ''}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </DefaultLayout>
    </ClientLayoutWrapper>
  );
}
