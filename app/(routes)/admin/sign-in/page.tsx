'use client';
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import styles from '../../../sass/signin/signin.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
  });

  const onSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/adminAuth/admin-login', values);

      const { token, userId } = response.data;
      if (token && userId) {
        login(token, userId); // Call the Auth context login function
        router.push('/admin/profile/update-admin'); // Redirect user
      } else {
        console.error('Token or Vendor ID missing in the response');
        alert('Login failed. Please try again later.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false); // Stop the Formik submitting state
    }
  };

  return (
    <div className={styles.signIn_container}>
      <main>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <button type="button" className={styles.closeIcon}>X</button>

              <Field type="text" name="email" placeholder="Email or Phone number" className={styles.inputField} />
              <ErrorMessage name="email" component="div" className={styles.error} />

              <Field type="password" name="password" placeholder="Password" className={styles.inputField} />
              <ErrorMessage name="password" component="div" className={styles.error} />

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <p className={styles.forgot_password}>Forgotten Password</p>

              <div className={styles.Orbox}>
                <div className={styles.left}></div>
                <p className={styles.Or}>Or</p>
                <div className={styles.right}></div>
              </div>

              <Link href="/admin/sign-up">
                <button type="button" className={styles.createAcct}>Create Account</button>
              </Link>
            </Form>
          )}
        </Formik>

        <div className={styles.rightside_login}>
          <div className={styles.clouds}>
            <Image src="/signupIcon/twemoji_cloud.svg" alt="Cloud Icon" width={50} height={50} />
            <Image src="/signupIcon/twemoji_cloud.svg" alt="Small Cloud Icon" width={20} height={20} />
            <Image src="/signupIcon/noto_cloud.svg" alt="Cloud Icon" width={50} height={50} />
          </div>
          <div className={styles.bike}>
            <Image src="/signupIcon/motoboy-celular.svg" alt="Bike Icon" width={280} height={280} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
