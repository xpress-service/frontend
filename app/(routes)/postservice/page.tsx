'use client';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';
import { useRouter } from 'next/navigation';
import styles from '../../sass/postservice/service.module.scss';
import { useAuth } from '@/app/contexts/AuthContext';
import { FiUpload, FiDollarSign, FiType, FiFileText, FiTag, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { MdCloudUpload, MdDescription } from 'react-icons/md';
import Link from 'next/link';
import Swal from 'sweetalert2';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { userId } = useAuth();
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null);

  // Common service categories
  const serviceCategories = [
    'Cleaning', 'Tutoring', 'Delivery', 'Repair', 'Beauty', 'Fitness',
    'Photography', 'Catering', 'Transportation', 'Pet Care', 'Gardening', 'Other'
  ]; 

  const initialValues: ServiceFormValues = {
    serviceName: '',
    category: '',
    description: '',
    price: 0,
    availability: true,
    imageUrl: null,
  };

  const validationSchema = Yup.object({
    serviceName: Yup.string()
      .min(3, 'Service name must be at least 3 characters')
      .max(50, 'Service name cannot exceed 50 characters')
      .required('Service Name is required'),
    category: Yup.string().required('Category is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description cannot exceed 500 characters')
      .required('Description is required'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive')
      .max(10000, 'Price cannot exceed $10,000'),
    availability: Yup.boolean(),
    imageUrl: Yup.mixed().required('Image is required'),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue('imageUrl', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        `${baseUrl}/services`,
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
          title: 'Success',
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
      Swal.fire({
    title: 'Error!',
    text: 'Failed to post the order. Please try again.',
    icon: 'error',
    timer: 2000,
    showConfirmButton: false
  });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.service_container}>
      {/* Header */}
      <div className={styles.page_header}>
        <Link href="/servicelist" className={styles.back_link}>
          <FiArrowLeft className={styles.back_icon} />
          Back to Services
        </Link>
        <div className={styles.header_content}>
          <h1>Post a New Service</h1>
          <p>Share your skills and connect with customers who need your expertise</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values, errors, touched }) => (
          <Form className={styles.modern_form}>
            {errorMessage && (
              <div className={styles.error_banner}>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.form_grid}>
              {/* Left Column */}
              <div className={styles.form_column}>
                <div className={styles.form_section}>
                  <h3 className={styles.section_title}>
                    <FiType className={styles.section_icon} />
                    Service Details
                  </h3>
                  
                  <div className={styles.input_group}>
                    <label className={styles.modern_label}>
                      <FiTag className={styles.label_icon} />
                      Service Name *
                    </label>
                    <Field 
                      type="text" 
                      name="serviceName" 
                      className={`${styles.modern_input} ${errors.serviceName && touched.serviceName ? styles.error_input : ''}`}
                      placeholder="e.g., Professional House Cleaning"
                    />
                    <ErrorMessage name="serviceName" component="div" className={styles.field_error}/>
                  </div>

                  <div className={styles.input_group}>
                    <label className={styles.modern_label}>
                      <MdDescription className={styles.label_icon} />
                      Category *
                    </label>
                    <Field 
                      as="select" 
                      name="category" 
                      className={`${styles.modern_select} ${errors.category && touched.category ? styles.error_input : ''}`}
                    >
                      <option value="">Select a category</option>
                      {serviceCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="category" component="div" className={styles.field_error} />
                  </div>

                  <div className={styles.input_group}>
                    <label className={styles.modern_label}>
                      <FiFileText className={styles.label_icon} />
                      Description * 
                      <span className={styles.char_count}>
                        {values.description.length}/500
                      </span>
                    </label>
                    <Field 
                      as="textarea" 
                      name="description" 
                      className={`${styles.modern_textarea} ${errors.description && touched.description ? styles.error_input : ''}`}
                      placeholder="Describe your service in detail. What makes it special? What's included?"
                      rows={4}
                    />
                    <ErrorMessage name="description" component="div" className={styles.field_error}/>
                  </div>

                  <div className={styles.input_row}>
                    <div className={styles.input_group}>
                      <label className={styles.modern_label}>
                        <FiDollarSign className={styles.label_icon} />
                        Price (USD) *
                      </label>
                      <div className={styles.price_input_wrapper}>
                        <span className={styles.currency_symbol}>$</span>
                        <Field 
                          type="number" 
                          name="price" 
                          className={`${styles.modern_input} ${styles.price_input} ${errors.price && touched.price ? styles.error_input : ''}`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <ErrorMessage name="price" component="div" className={styles.field_error}/>
                    </div>

                    <div className={styles.availability_group}>
                      <label className={styles.checkbox_label}>
                        <Field type="checkbox" name="availability" className={styles.modern_checkbox} />
                        <span className={styles.checkbox_custom}>
                          <FiCheck className={styles.check_icon} />
                        </span>
                        <span className={styles.checkbox_text}>Service Available</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className={styles.form_column}>
                <div className={styles.form_section}>
                  <h3 className={styles.section_title}>
                    <MdCloudUpload className={styles.section_icon} />
                    Service Image
                  </h3>
                  
                  <div className={styles.image_upload_section}>
                    <div className={`${styles.upload_area} ${imagePreview ? styles.has_image : ''}`}>
                      {imagePreview ? (
                        <div className={styles.image_preview_container}>
                          <img src={imagePreview} alt="Preview" className={styles.image_preview} />
                          <div className={styles.image_overlay}>
                            <label htmlFor="file" className={styles.change_image_btn}>
                              <FiUpload className={styles.upload_icon} />
                              Change Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="file" className={styles.upload_prompt}>
                          <MdCloudUpload className={styles.upload_icon_large} />
                          <span className={styles.upload_text}>Click to upload image</span>
                          <span className={styles.upload_subtext}>PNG, JPG up to 5MB</span>
                        </label>
                      )}
                      
                      <input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageChange(event, setFieldValue)}
                        className={styles.hidden_input}
                      />
                    </div>
                    <ErrorMessage name="imageUrl" component="div" className={styles.field_error}/>
                  </div>

                  <div className={styles.tips_section}>
                    <h4 className={styles.tips_title}>📸 Photo Tips</h4>
                    <ul className={styles.tips_list}>
                      <li>Use high-quality, well-lit images</li>
                      <li>Show your work or service in action</li>
                      <li>Keep the image relevant to your service</li>
                      <li>Avoid watermarks or text overlays</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={styles.submit_section}>
              <button 
                type="submit" 
                disabled={isSubmitting || loading}
                className={`${styles.submit_btn} ${(isSubmitting || loading) ? styles.loading : ''}`}
              >
                {loading ? (
                  <>
                    <div className={styles.btn_spinner}></div>
                    <span>Publishing Service...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className={styles.btn_icon} />
                    <span>Publish Service</span>
                  </>
                )}
              </button>
              
              <p className={styles.submit_note}>
                By publishing, you agree to our terms of service and will be available to fulfill orders.
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddService;
