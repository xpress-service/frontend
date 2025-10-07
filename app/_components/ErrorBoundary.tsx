'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            background: 'white',
            borderRadius: '16px',
            padding: '3rem 2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              marginBottom: '1.5rem'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="#ef4444"
                />
              </svg>
            </div>
            
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 700, 
              color: '#1f2937', 
              marginBottom: '1rem',
              margin: '0 0 1rem'
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#6b7280', 
              lineHeight: 1.6, 
              marginBottom: '2rem',
              margin: '0 0 2rem'
            }}>
              We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  minWidth: '120px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Try Again
              </button>
              <button 
                onClick={this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  minWidth: '120px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Go Home
              </button>
            </div>

            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.5rem',
              marginTop: '2rem'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem'
              }}>
                If this problem persists, please contact our support team.
              </p>
              <a 
                href="mailto:support@servicexpress.com" 
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
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