'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from '../../sass/signin/verify-email.module.scss';
import { FiCheckCircle, FiXCircle, FiMail, FiLoader } from 'react-icons/fi';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.get(`${baseUrl}/auth/verify-email?token=${token}`);
      
      setVerificationStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 5 seconds (users can click button to go immediately)
      setTimeout(() => {
        router.push('/sign-in');
      }, 5000);
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/resend-verification`, { email });
      alert('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.verify_email_container}>
      <div className={styles.verify_email_card}>
        <div className={styles.verify_header}>
          <div className={styles.email_icon}>
            <FiMail />
          </div>
          <h1 className={styles.verify_title}>Email Verification</h1>
          <p className={styles.verify_subtitle}>Verifying your email address</p>
        </div>

        {/* Progress Indicator */}
        <div className={styles.verification_progress}>
          <div className={styles.progress_steps}>
            <div className={styles.progress_step}>
              <div className={`${styles.step_circle} ${styles.completed}`}>
                1
              </div>
              <span className={styles.step_label}>Register</span>
            </div>
            <div className={`${styles.progress_line} ${styles.completed}`}></div>
            <div className={styles.progress_step}>
              <div className={`${styles.step_circle} ${verificationStatus === 'success' ? styles.completed : styles.active}`}>
                2
              </div>
              <span className={styles.step_label}>Verify Email</span>
            </div>
            <div className={`${styles.progress_line} ${verificationStatus === 'success' ? styles.completed : ''}`}></div>
            <div className={styles.progress_step}>
              <div className={`${styles.step_circle} ${verificationStatus === 'success' ? styles.active : styles.pending}`}>
                3
              </div>
              <span className={styles.step_label}>Admin Approval</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {verificationStatus === 'loading' && (
          <div className={styles.loading_container}>
            <div className={styles.loading_spinner}></div>
            <p className={styles.loading_text}>Verifying your email...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className={`${styles.status_message} ${styles.success}`}>
            <FiCheckCircle className={styles.status_icon} />
            <div>
              <h3>Email Verified Successfully!</h3>
              <p>{message}</p>
            </div>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className={`${styles.status_message} ${styles.error}`}>
            <FiXCircle className={styles.status_icon} />
            <div>
              <h3>Verification Failed</h3>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* Success Info */}
        {verificationStatus === 'success' && (
          <div className={`${styles.status_message} ${styles.info}`}>
            <FiCheckCircle className={styles.status_icon} />
            <div>
              <h4>What's Next?</h4>
              <ul style={{ textAlign: 'left', margin: '0.5rem 0' }}>
                <li>✅ Your email has been verified</li>
                <li>⏳ Admin will review your vendor application</li>
                <li>📧 You'll receive an email once approved</li>
              </ul>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => router.push('/sign-in')}
                  className={styles.action_button}
                  style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#5a67d8'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#667eea'}
                >
                  Continue to Login →
                </button>
                <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                  Or wait 5 seconds for automatic redirect...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resend Section for Error State */}
        {verificationStatus === 'error' && (
          <div className={styles.verification_actions}>
            <h3>Need a new verification email?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className={styles.action_button}
              >
                {isResending ? (
                  <>
                    <div className={styles.spinner}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiMail />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className={styles.verify_footer}>
          <div className={styles.footer_links}>
            <Link href="/sign-in" className={styles.footer_link}>
              ← Back to Login
            </Link>
            <Link href="/" className={styles.footer_link}>
              Go to Homepage →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;