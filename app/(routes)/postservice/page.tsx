// 'use client'
// import React, { useState } from 'react';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import axios from 'axios';
// import { useAuth } from '../../contexts/AuthContext';
// import styles from '../../sass/postservice/service.module.scss'

// interface ServiceFormValues {
//   serviceName: string;
//   category: string;
//   description: string;
//   price: number;
//   availability: boolean;
//   image: File | null;
// }

// const AddService: React.FC = () => {
//   const { vendorId } = useAuth();

  
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [res, setRes] = useState({});
//   const handleSelectFile = (e) => setFile(e.target.files[0]);

//   const handleUpload = async () => {
//     try {
//       setLoading(true);
//       const data = new FormData();
//       data.append("my_file", file);
//       const res = await axios.post("http://localhost:5000/upload", data);
//       setRes(res.data);
//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const initialValues: ServiceFormValues = {
//     serviceName: '',
//     category: '',
//     description: '',
//     price: 0,
//     availability: true,
//     image: null,
//   };

//   const validationSchema = Yup.object({
//     serviceName: Yup.string().required('Service Name is required'),
//     category: Yup.string().required('Category is required'),
//     description: Yup.string().required('Description is required'),
//     price: Yup.number().required('Price is required').positive('Price must be positive'),
//     availability: Yup.boolean(),
//     image: Yup.mixed().required('Image is required'),
//   });

//   const handleSubmit = async (values: ServiceFormValues) => {
//     if (!vendorId) {
//       alert('Vendor ID is missing');
//       return;
//     }

//     const formData = new FormData();
//     // formData.append('vendorId', vendorId);
//     formData.append('serviceName', values.serviceName);
//     formData.append('category', values.category);
//     formData.append('description', values.description);
//     formData.append('price', values.price.toString());
//     formData.append('availability', values.availability.toString());
//     if (values.image) {
//       formData.append('image', values.image);
//     }

//     try {
//       await axios.post('http://localhost:5000/api/services', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       alert('Service added successfully');
//     } catch (error) {
//       console.error('Error adding service:', error);
//       alert('Failed to add service');
//     }

//     if (!vendorId) {
//       alert('Vendor ID is missing');
//       return;
//     }
//     console.log('Vendor ID during submission:', vendorId);
//   };



  
//   return (
//     <div className={styles.service_container}>
 
//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting, setFieldValue }) => (
//           <Form className={styles.addService_form}>
//                  <h1>Add a New Service</h1>
//             <div>
//               <label>Service Name</label>
//               <Field type="text" name="serviceName" className={styles.formfields}/>
//               <ErrorMessage name="serviceName" component="div" />
//             </div>
//             <div>
//               <label>Category</label>
//               <Field type="text" name="category" className={styles.formfields} />
//               <ErrorMessage name="category" component="div" />
//             </div>
//             <div>
//               <label>Description</label>
//               <Field as="textarea" name="description" className={styles.formfields} />
//               <ErrorMessage name="description" component="div" />
//             </div>
//             <div>
//               <label>Price</label>
//               <Field type="number" name="price" className={styles.formfields}/>
//               <ErrorMessage name="price" component="div" />
//             </div>
//             <div className={styles.availability}>
//               <label>
//               Available
//               </label>
//                 <Field type="checkbox" name="availability" />
//             </div>
//             <div>
//               {/* <label>Image</label>
//               <input
//               className={styles.formfields}
//                 type="file"
//                 accept="image/*"
//                 onChange={(event) => {
//                   const file = event.currentTarget.files?.[0];
//                   setFieldValue('image', file);
                  
//                 }}
//               />
//               <ErrorMessage name="image" component="div" /> */}



// <label htmlFor="file" className="btn-grey">
//         {" "}
//         select file
//       </label>
//       {file && <center> {file.name}</center>}
//       <input
//         id="file"
//         type="file"
//         onChange={handleSelectFile}
//         multiple={false}
//       />
//       <code>
//         {Object.keys(res).length > 0
//           ? Object.keys(res).map((key) => (
//               <p className="output-item" key={key}>
//                 <span>{key}:</span>
//                 <span>
//                   {typeof res[key] === "object" ? "object" : res[key]}
//                 </span>
//               </p>
//             ))
//           : null}
//       </code>
//       {file && (
//         <>
//           <button onClick={handleUpload} className="btn-green">
//             {loading ? "uploading..." : "upload to cloudinary"}
//           </button>
//         </>
//       )}

//             </div>
//             <div className={styles.add_servicebtn_con}>
//             <button type="submit" disabled={isSubmitting}>
//               Add Service
//             </button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default AddService;

'use client'
import React, { useState, ChangeEvent } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../sass/postservice/service.module.scss'

interface ServiceFormValues {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  availability: boolean;
  image: File | null;
}

const AddService: React.FC = () => {
  const { vendorId } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      console.log(e.target.files[0])
    }
  };

  const initialValues: ServiceFormValues = {
    serviceName: '',
    category: '',
    description: '',
    price: 0,
    availability: true,
    image: null,
  };

  const validationSchema = Yup.object({
    serviceName: Yup.string().required('Service Name is required'),
    category: Yup.string().required('Category is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number().required('Price is required').positive('Price must be positive'),
    availability: Yup.boolean(),
    image: Yup.mixed().required('Image is required'),
  });

  const handleSubmit = async (values: ServiceFormValues) => {
    console.log('Form submitted', values); // Debugging

    // if (!vendorId) {
    //   alert('Vendor ID is missing');
    //   return;
    // }

    if (!file) {
      alert('Please select an image');
      return;
    }

    setLoading(true);

    try {
      console.log('Uploading image to Cloudinary...'); // Debugging

      // Upload the image to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "my_file"); // Replace with your Cloudinary upload preset
      const response = await axios.post("https://api.cloudinary.com/v1_1/duu0bfv8f/image/upload", data); // Replace with your Cloudinary URL

      console.log('Image uploaded', response.data); // Debugging

      const imageUrl = response.data.secure_url;

      // Prepare the form data
      const formData = {
        serviceName: values.serviceName,
        category: values.category,
        description: values.description,
        price: values.price,
        availability: values.availability,
        image: imageUrl,
        // vendorId: vendorId,
      };

      console.log('Sending form data to backend...', formData); // Debugging

      // Send the form data to the backend
      await axios.post('http://localhost:5000/api/services', formData, {
        headers: {
          // 'Content-Type': 'application/json',
          'Content-Type': 'multipart/form-data',
          
        },
      });

      alert('Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.service_container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className={styles.addService_form} >
            <h1>Add a New Service</h1>
            <div>
              <label>Service Name</label>
              <Field type="text" name="serviceName" className={styles.formfields}/>
              <ErrorMessage name="serviceName" component="div" />
            </div>
            <div>
              <label>Category</label>
              <Field type="text" name="category" className={styles.formfields} />
              <ErrorMessage name="category" component="div" />
            </div>
            <div>
              <label>Description</label>
              <Field as="textarea" name="description" className={styles.formfields} />
              <ErrorMessage name="description" component="div" />
            </div>
            <div>
              <label>Price</label>
              <Field type="number" name="price" className={styles.formfields}/>
              <ErrorMessage name="price" component="div" />
            </div>
            <div className={styles.availability}>
              <label>Available</label>
              <Field type="checkbox" name="availability" />
            </div>
            <div>
              <label htmlFor="file" className="btn-grey">Select file</label>
              {/* {file && <center>{file.name}</center>} */}
              <input
                id="file"
                type="file"
                onChange={handleSelectFile}
                multiple={false}
              />
            </div>
            <div className={styles.add_servicebtn_con}>
              {/* <button type="submit" disabled={isSubmitting || loading}> */}
                {/* {loading ? "Submitting..." : "Add Service"} */}
                <button type='submit'>
                Add Service
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddService;
