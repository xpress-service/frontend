'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from '../sass/layout/error.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service
    if (typeof window !== 'undefined') {
      // You can integrate with services like Sentry here
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="#ef4444"
                />
              </svg>
            </div>
            
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            
            <p className={styles.errorMessage}>
              We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.errorActions}>
              <button 
                onClick={this.handleReload}
                className={`${styles.errorButton} ${styles.primary}`}
              >
                Try Again
              </button>
              <button 
                onClick={this.handleGoHome}
                className={`${styles.errorButton} ${styles.secondary}`}
              >
                Go Home
              </button>
            </div>

            <div className={styles.errorFooter}>
              <p>If this problem persists, please contact our support team.</p>
              <a href="mailto:support@servicexpress.com" className={styles.supportLink}>
                support@servicexpress.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;