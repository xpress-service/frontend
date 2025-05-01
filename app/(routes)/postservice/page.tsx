'use client';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';
import { useRouter } from 'next/navigation';
import styles from '../../sass/postservice/service.module.scss';
import { useAuth } from '@/app/contexts/AuthContext';
import DefaultLayout from '@/app/_layoutcomponents/DefaultLayout';
import Swal from 'sweetalert2';

interface ServiceFormValues {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  availability: boolean;
  imageUrl: File | null;
}

const AddService: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
   const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null); // Add state for serviceOwnerId

  const initialValues: ServiceFormValues = {
    serviceName: '',
    category: '',
    description: '',
    price: 0,
    availability: true,
    imageUrl: null,
  };

  const validationSchema = Yup.object({
    serviceName: Yup.string().required('Service Name is required'),
    category: Yup.string().required('Category is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive'),
    availability: Yup.boolean(),
    imageUrl: Yup.mixed().required('Image is required'),
  });

  const handleSubmit = async (values: ServiceFormValues) => {
    setLoading(true);
    setErrorMessage(null);
  
    try {
      const formData = new FormData();
      formData.append('serviceName', values.serviceName);
      formData.append('category', values.category);
      formData.append('description', values.description);
      formData.append('price', values.price.toString());
      formData.append('availability', values.availability.toString());
      
      // Check if imageUrl exists and append the image file
      if (values.imageUrl) {
        formData.append('imageUrl', values.imageUrl);
      }
  
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to create a service.');
      }
  
      const decoded: any = jwt_decode.jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Session expired. Please log in again.');
      }

       // Add serviceOwnerId from the decoded token
       if (!userId) {
        throw new Error('User is not authenticated. Please log in again.');
      }
      formData.append('serviceOwnerId', userId);

  
      const response = await axios.post(
        'https://backend-production-d818.up.railway.app/api/services',
        // 'http://localhost:5000/api/services',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'Order placed successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
      router.push('/servicelist');
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || error.message || 'An error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <DefaultLayout serviceOwnerId={serviceOwnerId || ''}>
    <div className={styles.service_container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className={styles.addService_form}>
            <h1>Add a New Service</h1>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <div className={styles.input_box}>
              <label>Service Name</label>
              <Field type="text" name="serviceName" className={styles.formfields} />
              <ErrorMessage name="serviceName" component="div" className={styles.error}/>
            </div>

            <div className={styles.input_box}>
              <label>Category</label>
              <Field type="text" name="category" className={styles.formfields} />
              <ErrorMessage name="category" component="div" className={styles.error} />
            </div>

            <div className={styles.input_box}>
              <label>Description</label>
              <Field as="textarea" name="description" className={styles.formfields} />
              <ErrorMessage name="description" component="div" className={styles.error}/>
            </div>

            <div className={styles.input_box}>
              <label>Price</label>
              <Field type="number" name="price" className={styles.formfields} />
              <ErrorMessage name="price" component="div" className={styles.error}/>
            </div>

            <div className={styles.availability}>
              <label>Available</label>
              <Field type="checkbox" name="availability" />
            </div>

            <div className={styles.input_box}>
              <label htmlFor="file">Upload Image</label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setFieldValue('imageUrl', file);
                  }
                }}
              />
              <ErrorMessage name="imageUrl" component="div" className={styles.error}/>
            </div>

            <div className={styles.add_servicebtn_con}>
              <button type="submit" disabled={isSubmitting || loading}>
                {loading ? 'Submitting...' : 'Add Service'}
              </button>
            </div>
          </Form>
          
        )}
      </Formik>
      
    </div>
    </DefaultLayout>
  );
};

export default AddService;
