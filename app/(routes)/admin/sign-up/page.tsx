'use client'
import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import styles from '../../../sass/signin/signup.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormValues {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const router =useRouter()
  const initialValues: FormValues = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const onSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      await axios.post('http://localhost:5000/api/adminAuth/admin-register', values);
      alert('User registered successfully');
      router.push('/admin/sign-in')
    } catch (error) {
      console.error('Error registering user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.signIn_container}>
      <main>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <button type="button" className={styles.closeIcon}>X</button>
              
              <div>
                <Field type="text" name="firstname" placeholder="First name" />
                <ErrorMessage name="firstname" component="div" />
              </div>

              <div>
                <Field type="text" name="lastname" placeholder="Last name" />
                <ErrorMessage name="lastname" component="div" />
              </div>

              <div>
                <Field type="email" name="email" placeholder="Email or Phone number" />
                <ErrorMessage name="email" component="div" />
              </div>

              <div>
                <Field type="password" name="password" placeholder="Password" />
                <ErrorMessage name="password" component="div" />
              </div>

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>Signup</button>

              <div className={styles.Orbox}>
                <div className={styles.left}></div>
                <p className={styles.Or}>Or</p>
                <div className={styles.right}></div>
              </div>

              <p className={styles.forgot_password}>Already have an account?</p>
              <Link href="/admin/sign-in">
              <button type="button" className={styles.createAcct}>Login</button>
              </Link>
            </Form>
          )}
        </Formik>

        <div className={styles.rightside_login}>
          <div className={styles.cloudsbox}>
            <Image src='/signupIcon/twemoji_cloud.svg' alt='img' width={50} height={50} />
            <Image src='/signupIcon/twemoji_cloud.svg' alt='img' width={20} height={20} />
            <Image src='/signupIcon/noto_cloud.svg' alt='img' width={50} height={50} />
          </div>
          <div className={styles.bikeman}>
            <Image src='/signupIcon/delivery-guy.svg' alt='img' width={480} height={480} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
