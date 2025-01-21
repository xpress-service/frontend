'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../../../sass/userprofile/userprofile.module.scss'
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const CreateProfile = () => {
  // Initialize state for profile image, preview, form data, and messages
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    birthdate: '',
    nin: '',
    phone: '',
    location: '',
    gender: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch the user data 
   useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);  // Log the token to see if it's there
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      console.log("Decoded user:", decodedUser);  // Log the decoded token to ensure it's valid
      try {
        const response = await axios.get(`http://localhost:5000/api/adminProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Response:", response);  // Log the response to see what the server returns
        const userData = response.data;
        setFormData({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          birthdate: userData.birthdate || '',
          nin: userData.nin || '',
          phone: userData.phone || '',
          location: userData.location || '',
          gender: userData.gender || '',
        });
        if (userData.profileImage) {
          setProfileImagePreview(userData.profileImage);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    } else {
      console.log("No token found");
    }
  };
  fetchUserData();
}, []);

  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      }
    };
  
    const handleFieldChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
  
      try {
        const data = new FormData();
        if (profileImage) {
          data.append('profileImage', profileImage);
        }
  
        Object.keys(formData).forEach((key) => {
          if (formData[key as keyof typeof formData]) {
            data.append(key, formData[key as keyof typeof formData] as string);
          }
        });
  
        // Get the token from sessionStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("You must be logged in to update your profile.");
          return;
        }
  
        // Decode the token and check for expiration
        const decoded: any = jwt_decode.jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          setErrorMessage("Session expired. Please log in again.");
          return;
        }
  
        // Proceed with the profile update if token is valid
        const response = await axios.put('http://localhost:5000/api/adminProfile', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          swal.fire({
            title: 'Success',
            text: 'Profile updated was successful',
            type: 'success', 
            confirmButtonText: 'OK',
          });
        }
      router.push('/admin/profile')
      } catch (error: any) {
        if (error.response) {
          setErrorMessage(error.response.data.message || "Error updating profile.");
        } else {
          setErrorMessage(error.message || "An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className={styles.create_profileBox}>
      <main>
        <form className={styles.create_profileForm} onSubmit={handleSubmit}>
          <div className={styles.profileImageContainer}>
            <label htmlFor="profileImageUpload" className={styles.uploadLabel}>
              Upload Profile Image
            </label>
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.uploadInput}
            />
            {profileImagePreview && (
              <div className={styles.imagePreview}>
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className={styles.previewImg}
                />
              </div>
            )}
          </div>

          {/* Name and Email fields will be pre-filled from localStorage */}
          <input
            type="text"
            placeholder="First Name"
            className={styles.items}
            value={formData.firstname}
            onChange={handleFieldChange('firstname')}
          />
          <input
            type="text"
            placeholder="Last Name"
            className={styles.items}
            value={formData.lastname}
            onChange={handleFieldChange('lastname')}
          />
          <input
            type="email"
            placeholder="Email"
            className={styles.emailitems}
            value={formData.email}
            onChange={handleFieldChange('email')}
            readOnly
          />
          <div className={styles.datebox}>
            <label htmlFor="birthdate">Date of Birth</label>
            <input
              type="date"
              className={styles.item}
              value={formData.birthdate}
              onChange={handleFieldChange('birthdate')}
            />
          </div>
          <input
            type="number"
            placeholder="NIN"
            className={styles.items}
            value={formData.nin}
            onChange={handleFieldChange('nin')}
          />
          <input
            type="number"
            placeholder="Phone Number"
            className={styles.items}
            value={formData.phone}
            onChange={handleFieldChange('phone')}
          />
          <input
            type="text"
            placeholder="Location"
            className={styles.items}
            value={formData.location}
            onChange={handleFieldChange('location')}
          />
          <input
            type="text"
            placeholder="Gender"
            className={styles.items}
            value={formData.gender}
            onChange={handleFieldChange('gender')}
          />

          {/* {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>} */}

          <button className={styles.createbtn} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateProfile;
