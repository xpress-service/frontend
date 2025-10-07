'use client'
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import styles from '../../sass/signin/signup.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiEye, FiEyeOff, FiCheck, FiX, FiUser, FiMail, FiLock } from 'react-icons/fi';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface FormValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'customer' | 'vendor';
}

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    score
  };
};

const getPasswordStrengthText = (score: number): { text: string; color: string } => {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Very Weak', color: '#dc3545' };
    case 2:
      return { text: 'Weak', color: '#fd7e14' };
    case 3:
      return { text: 'Fair', color: '#ffc107' };
    case 4:
      return { text: 'Good', color: '#20c997' };
    case 5:
      return { text: 'Strong', color: '#28a745' };
    default:
      return { text: 'Very Weak', color: '#dc3545' };
  }
};

const SignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    score: 0
  });
  
  const initialValues: FormValues = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'customer',
  };

  const validationSchema = Yup.object({
    firstname: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .matches(/^[A-Za-z]+$/, 'First name should only contain letters')
      .required('First name is required'),
    lastname: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .matches(/^[A-Za-z]+$/, 'Last name should only contain letters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
      .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
      .matches(/^(?=.*\d)/, 'Password must contain at least one number')
      .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'Password must contain at least one special character')
      .required('Password is required'),
    role: Yup.string()
      .oneOf(['customer', 'vendor'], 'Please select a valid role')
      .required('Please select your account type'),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/auth/register`, 
        values);
      
      const { requiresVerification, message, role } = response.data;
      
      if (requiresVerification) {
        const roleText = role === 'vendor' ? 'Vendor' : 'Customer';
        const additionalText = role === 'vendor' ? 
          ' After verification, an admin will review your application.' : 
          ' After verification, you can start booking services immediately.';
          
        Swal.fire({
          title: `${roleText} Registration Successful!`,
          text: `Please check your email to verify your account.${additionalText}`,
          icon: 'info',
          confirmButtonText: 'Check Email & Verify',
          confirmButtonColor: '#667eea',
          showCancelButton: true,
          cancelButtonText: 'I\'ll verify later'
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/verify-email');
          } else {
            router.push('/sign-in');
          }
        });
      } else {
        // Fallback for any edge cases
        Swal.fire({
          title: 'Account Created!',
          text: message || 'Welcome to ServiceXpress! Please verify your email to continue.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
        
        setTimeout(() => router.push('/verify-email'), 3000);
      }
    } catch (error: any) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      const errorField = error.response?.data?.field;
      
      Swal.fire({
        title: 'Registration Failed',
        text: errorMessage,
        icon: 'error',
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#667eea'
      });
      
      // Focus on the problematic field if specified
      if (errorField) {
        const field = document.getElementsByName(errorField)[0];
        if (field) {
          field.focus();
        }
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
            <h1 className={styles.page_title}>Create Account</h1>
            <p className={styles.page_subtitle}>Join ServiceXpress and start connecting with service providers</p>
          </div>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form className={styles.auth_form}>
                <div className={styles.name_fields}>
                  <div className={styles.input_group}>
                    <div className={styles.input_wrapper}>
                      <FiUser className={styles.input_icon} />
                      <Field 
                        type="text" 
                        name="firstname" 
                        placeholder="First name" 
                        className={`${styles.inputField} ${errors.firstname && touched.firstname ? styles.error_field : ''}`}
                      />
                    </div>
                    <ErrorMessage name="firstname" component="div" className={styles.error_message} />
                  </div>

                  <div className={styles.input_group}>
                    <div className={styles.input_wrapper}>
                      <FiUser className={styles.input_icon} />
                      <Field 
                        type="text" 
                        name="lastname" 
                        placeholder="Last name" 
                        className={`${styles.inputField} ${errors.lastname && touched.lastname ? styles.error_field : ''}`}
                      />
                    </div>
                    <ErrorMessage name="lastname" component="div" className={styles.error_message} />
                  </div>
                </div>

                <div className={styles.input_group}>
                  <div className={styles.input_wrapper}>
                    <FiMail className={styles.input_icon} />
                    <Field 
                      type="email" 
                      name="email" 
                      placeholder="Enter your email address" 
                      className={`${styles.inputField} ${errors.email && touched.email ? styles.error_field : ''}`}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className={styles.error_message} />
                </div>

                {/* Role Selection */}
                <div className={styles.input_group}>
                  <label className={styles.role_label}>I want to:</label>
                  <div className={styles.role_options}>
                    <Field name="role">
                      {({ field }: any) => (
                        <div className={styles.radio_group}>
                          <label className={styles.radio_option}>
                            <input
                              {...field}
                              type="radio"
                              value="customer"
                              checked={field.value === 'customer'}
                              className={styles.radio_input}
                            />
                            <div className={styles.radio_custom}>
                              <div className={styles.radio_content}>
                                <span className={styles.radio_icon}>🛍️</span>
                                <div>
                                  <h4>Find Services</h4>
                                  <p>Browse and book services from providers</p>
                                </div>
                              </div>
                            </div>
                          </label>
                          
                          <label className={styles.radio_option}>
                            <input
                              {...field}
                              type="radio"
                              value="vendor"
                              checked={field.value === 'vendor'}
                              className={styles.radio_input}
                            />
                            <div className={styles.radio_custom}>
                              <div className={styles.radio_content}>
                                <span className={styles.radio_icon}>💼</span>
                                <div>
                                  <h4>Offer Services</h4>
                                  <p>Provide services and earn money</p>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="role" component="div" className={styles.error_message} />
                </div>

                <div className={styles.input_group}>
                  <div className={styles.input_wrapper}>
                    <FiLock className={styles.input_icon} />
                    <Field name="password">
                      {({ field, form }: any) => (
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className={`${styles.inputField} ${errors.password && touched.password ? styles.error_field : ''}`}
                          onChange={(e) => {
                            field.onChange(e);
                            const strength = checkPasswordStrength(e.target.value);
                            setPasswordStrength(strength);
                          }}
                        />
                      )}
                    </Field>
                    <button 
                      type="button" 
                      className={styles.password_toggle}
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className={styles.password_strength}>
                    <div className={styles.strength_header}>
                      <span className={styles.strength_label}>Password Strength:</span>
                      <span 
                        className={styles.strength_text}
                        style={{ color: getPasswordStrengthText(passwordStrength.score).color }}
                      >
                        {getPasswordStrengthText(passwordStrength.score).text}
                      </span>
                    </div>
                    <div className={styles.strength_bar}>
                      <div 
                        className={styles.strength_fill}
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthText(passwordStrength.score).color
                        }}
                      ></div>
                    </div>
                  </div>

                  <ErrorMessage name="password" component="div" className={styles.error_message} />
                  
                  {/* Real-time Password Requirements */}
                  <div className={styles.password_requirements}>
                    <p className={styles.requirements_title}>Password Requirements:</p>
                    <ul className={styles.requirements_list}>
                      <li className={passwordStrength.minLength ? styles.requirement_met : styles.requirement_unmet}>
                        {passwordStrength.minLength ? <FiCheck /> : <FiX />}
                        At least 8 characters
                      </li>
                      <li className={passwordStrength.hasUppercase ? styles.requirement_met : styles.requirement_unmet}>
                        {passwordStrength.hasUppercase ? <FiCheck /> : <FiX />}
                        One uppercase letter (A-Z)
                      </li>
                      <li className={passwordStrength.hasLowercase ? styles.requirement_met : styles.requirement_unmet}>
                        {passwordStrength.hasLowercase ? <FiCheck /> : <FiX />}
                        One lowercase letter (a-z)
                      </li>
                      <li className={passwordStrength.hasNumber ? styles.requirement_met : styles.requirement_unmet}>
                        {passwordStrength.hasNumber ? <FiCheck /> : <FiX />}
                        One number (0-9)
                      </li>
                      <li className={passwordStrength.hasSpecialChar ? styles.requirement_met : styles.requirement_unmet}>
                        {passwordStrength.hasSpecialChar ? <FiCheck /> : <FiX />}
                        One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className={styles.terms_agreement}>
                  <p className={styles.terms_text}>
                    By creating an account, you agree to our 
                    <Link href="/terms" className={styles.terms_link}> Terms of Service </Link>
                    and 
                    <Link href="/privacy" className={styles.terms_link}> Privacy Policy</Link>
                  </p>
                </div>

                <button 
                  type="submit" 
                  className={`${styles.loginBtn} ${(isSubmitting || isLoading) ? styles.loading : ''}`} 
                  disabled={isSubmitting || isLoading}
                >
                  {(isSubmitting || isLoading) ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className={styles.divider}>
                  <span className={styles.divider_text}>Already have an account?</span>
                </div>

                <div className={styles.auth_footer}>
                  <Link href="/sign-in" className={styles.auth_switch_link}>
                    Sign in instead
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className={styles.rightside_login}>
          <div className={styles.illustration_content}>
            <h2 className={styles.illustration_title}>Start Your Journey</h2>
            <p className={styles.illustration_text}>
              Join thousands of satisfied customers who trust ServiceXpress 
              for their daily service needs.
            </p>
            <div className={styles.benefits_list}>
              <div className={styles.benefit_item}>
                <span className={styles.benefit_icon}>🎆</span>
                <div className={styles.benefit_content}>
                  <h3>Instant Access</h3>
                  <p>Connect with service providers immediately</p>
                </div>
              </div>
              <div className={styles.benefit_item}>
                <span className={styles.benefit_icon}>💰</span>
                <div className={styles.benefit_content}>
                  <h3>Best Rates</h3>
                  <p>Competitive pricing from verified providers</p>
                </div>
              </div>
              <div className={styles.benefit_item}>
                <span className={styles.benefit_icon}>⭐</span>
                <div className={styles.benefit_content}>
                  <h3>Quality Assured</h3>
                  <p>Rated and reviewed by real customers</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cloudsbox}>
            <Image src='/signupIcon/twemoji_cloud.svg' alt='Decorative cloud' width={50} height={50} />
            <Image src='/signupIcon/twemoji_cloud.svg' alt='Decorative cloud' width={20} height={20} />
            <Image src='/signupIcon/noto_cloud.svg' alt='Decorative cloud' width={50} height={50} />
          </div>
          <div className={styles.bikeman}>
            <Image src='/signupIcon/delivery-guy.svg' alt='Service provider illustration' width={270} height={270} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
