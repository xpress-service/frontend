'use client';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../sass/signin/signin.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Please enter a valid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/auth/login`,
         values);
      const { token, userId, role } = response.data;
  
      if (token) {
        login(token, userId, role); 
  
        // Show success message
        Swal.fire({
          title: 'Welcome Back!',
          text: 'Login successful. Redirecting...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Fetch user profile to check if it is complete
        const profileResponse = await axios.get(
          `${baseUrl}/profile`, 
          {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfile = profileResponse.data;
        
        // Check if required profile fields are filled
        const isProfileComplete = userProfile && 
          userProfile.firstname && 
          userProfile.lastname && 
          userProfile.email && 
          userProfile.country &&
          userProfile.location &&
          userProfile.birthdate &&
          userProfile.gender &&
          userProfile.phone &&
          // NIN is only required for Nigerian users
          (userProfile.country !== 'nigeria' || userProfile.nin);
          
        if (isProfileComplete) {
          setTimeout(() => router.push('/servicelist'), 1500); 
        } else {
          setTimeout(() => router.push('/userprofile/complete-profile'), 1500); 
        }
      } else {
        console.error('Token or User ID missing in the response');
        Swal.fire({
          title: 'Login Failed',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      const { message, requiresVerification, email } = error.response?.data || {};
      
      if (requiresVerification) {
        // Handle email verification required
        Swal.fire({
          title: 'Email Verification Required',
          text: message || 'Please verify your email address before logging in.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Verify Email',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#667eea'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to verification page or resend verification
            router.push('/verify-email');
          }
        });
      } else {
        // Handle other login errors
        const errorMessage = message || 'Invalid email or password. Please try again.';
        Swal.fire({
          title: 'Login Failed',
          text: errorMessage,
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.signIn_container}>
      <main>
        <div className={styles.form_container}>
          <div className={styles.form_header}>
            <h1 className={styles.page_title}>Welcome Back</h1>
            <p className={styles.page_subtitle}>Sign in to your ServiceXpress account</p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className={styles.auth_form}>
                <div className={styles.input_group}>
                  <div className={styles.input_wrapper}>
                    <span className={styles.input_icon}>📧</span>
                    <Field 
                      type="email" 
                      name="email" 
                      placeholder="Enter your email address" 
                      className={`${styles.inputField} ${errors.email && touched.email ? styles.error_field : ''}`}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className={styles.error_message} />
                </div>

                <div className={styles.input_group}>
                  <div className={styles.input_wrapper}>
                    <span className={styles.input_icon}>🔒</span>
                    <Field 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Enter your password" 
                      className={`${styles.inputField} ${errors.password && touched.password ? styles.error_field : ''}`}
                    />
                    <button 
                      type="button" 
                      className={styles.password_toggle}
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className={styles.error_message} />
                </div>

                <button 
                  type="submit" 
                  className={`${styles.loginBtn} ${(isSubmitting || isLoading) ? styles.loading : ''}`} 
                  disabled={isSubmitting || isLoading}
                >
                  {(isSubmitting || isLoading) ? (
                    <>
                      <span className={styles.spinner}></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <Link href="/forgot-password" className={styles.forgot_password}>
                  Forgot your password?
                </Link>

                <div className={styles.divider}>
                  <span className={styles.divider_text}>Or continue with</span>
                </div>

                <div className={styles.auth_footer}>
                  <p className={styles.auth_switch_text}>
                    Don't have an account? 
                    <Link href="/sign-up" className={styles.auth_switch_link}>
                      Create one now
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className={styles.rightside_login}>
          <div className={styles.illustration_content}>
            <h2 className={styles.illustration_title}>Join ServiceXpress</h2>
            <p className={styles.illustration_text}>
              Connect with trusted service providers in your area. 
              From food delivery to home services - we've got you covered.
            </p>
            <div className={styles.features_list}>
              <div className={styles.feature_item}>
                <span className={styles.feature_icon}>⚡</span>
                <span>Fast & Reliable</span>
              </div>
              <div className={styles.feature_item}>
                <span className={styles.feature_icon}>🛡️</span>
                <span>Secure & Trusted</span>
              </div>
              <div className={styles.feature_item}>
                <span className={styles.feature_icon}>📱</span>
                <span>Easy to Use</span>
              </div>
            </div>
          </div>
          <div className={styles.clouds}>
            <Image src="/signupIcon/twemoji_cloud.svg" alt="Decorative cloud" width={50} height={50} />
            <Image src="/signupIcon/twemoji_cloud.svg" alt="Decorative cloud" width={20} height={20} />
            <Image src="/signupIcon/noto_cloud.svg" alt="Decorative cloud" width={50} height={50} />
          </div>
          <div className={styles.bike}>
            <Image src="/signupIcon/motoboy-celular.svg" alt="Delivery service illustration" width={280} height={280} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
