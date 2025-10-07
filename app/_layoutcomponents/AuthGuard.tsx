'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from '../sass/layout/auth.module.scss';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const AuthGuard = ({ 
  children, 
  redirectTo = '/sign-in', 
  requireAuth = true 
}: AuthGuardProps) => {
  const { userId, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated && !userId) {
      // Save the current path to redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/sign-in' && currentPath !== '/sign-up') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      router.push(redirectTo);
      return;
    }

    // If user is authenticated but trying to access auth pages
    if (!requireAuth && isAuthenticated && userId) {
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(savedRedirect);
      } else {
        router.push('/dashboard');
      }
      return;
    }
  }, [isAuthenticated, userId, requireAuth, router, redirectTo]);

  // Show loading while checking authentication
  if (requireAuth && !isAuthenticated && !userId) {
    return (
      <div className={styles.authGuardContainer}>
        <LoadingSpinner 
          text="Verifying authentication..." 
          fullScreen={true}
        />
      </div>
    );
  }

  // Redirect if user shouldn't be here
  if (!requireAuth && isAuthenticated && userId) {
    return (
      <div className={styles.authGuardContainer}>
        <LoadingSpinner 
          text="Redirecting..." 
          fullScreen={true}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;