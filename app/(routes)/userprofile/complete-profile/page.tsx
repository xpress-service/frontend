'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../../sass/userprofile/complete-profile.module.scss';
import { MdCloudUpload, MdPerson, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FiCalendar, FiUser, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface FormData {
  role: string;
  servicesOffered: string[];
}
const CreateProfile = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    nin: string;
    phone: string;
    location: string;
    gender: string;
    role: string;
    servicesOffered: string[];
  }>({
    firstname: '',
    lastname: '',
    email: '',
    birthdate: '',
    nin: '',
    phone: '',
    location: '',
    gender: '',
    role: '',
    servicesOffered: [],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch the user data 
   useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token); 
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      console.log("Decoded user:", decodedUser);  
      try {
        const response = await axios.get(
          `${baseUrl}/profile`, 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
          role: userData.role || '',
          servicesOffered: userData.servicesOffered || '',
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
  
    const handleFieldChange = (field: keyof typeof formData) => ( e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
  
    const handleFieldGenderChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
    const handleFieldRoleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
    const handleServicesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, servicesOffered: selectedOptions });
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
        const response = await axios.put(
          `${baseUrl}/profile`, 
          data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          Swal.fire({
            title: 'Success!',
            text: 'Profile updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      router.push('/userprofile')
      } catch (error: any) {
        if (error.response) {
          setErrorMessage(error.response.data.message || "Error updating profile.");
        } else {
          setErrorMessage(error.message || "An unknown error occurred.");
        }
         Swal.fire({
            title: 'Error!',
            text: 'Profile update failed',
            icon: 'error',
            confirmButtonText: 'OK'
          });
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className={styles.create_profileBox}>
      <main>
        <form className={styles.create_profileForm} onSubmit={handleSubmit}>
          <div className={styles.form_header}>
            <h1>Complete Your Profile</h1>
            <p>Help us personalize your experience by completing your profile information</p>
          </div>

          {/* Profile Image Upload */}
          <div className={styles.profileImageContainer}>
            <label htmlFor="profileImageUpload" className={styles.uploadLabel}>
              <MdCloudUpload size={20} />
              Upload Profile Picture
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

          {/* Personal Information Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <MdPerson className="inline-icon" />
              Personal Information
            </h3>
            
            <div className={styles.input_items}>
              <input
                type="text"
                placeholder="First Name"
                className={styles.items}
                value={formData.firstname}
                onChange={handleFieldChange('firstname')}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className={styles.items}
                value={formData.lastname}
                onChange={handleFieldChange('lastname')}
                required
              />
            </div>
            
            <div className={styles.input_items}>
              <input
                type="email"
                placeholder="Email Address"
                className={styles.emailitems}
                value={formData.email}
                onChange={handleFieldChange('email')}
                readOnly
              />
            </div>
            
            <div className={styles.input_items}>
              <div className={styles.datebox}>
                <label htmlFor="birthdate">
                  <FiCalendar className="inline-icon" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  className={styles.item}
                  value={formData.birthdate}
                  onChange={handleFieldChange('birthdate')}
                  required
                />
              </div>
              <select
                className={styles.items}
                value={formData.gender}
                onChange={handleFieldGenderChange('gender')}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <MdPhone className="inline-icon" />
              Contact Information
            </h3>
            
            <div className={styles.input_items}>
              <input
                type="text"
                placeholder="National ID Number (NIN)"
                className={styles.items}
                value={formData.nin}
                onChange={handleFieldChange('nin')}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className={styles.items}
                value={formData.phone}
                onChange={handleFieldChange('phone')}
                required
              />
            </div>
            
            <div className={styles.input_items}>
              <input
                type="text"
                placeholder="Your Location"
                className={styles.items}
                value={formData.location}
                onChange={handleFieldChange('location')}
                required
              />
            </div>
          </div>

          {/* Role Selection Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <FiUser className="inline-icon" />
              Account Type
            </h3>
            
            <div className={styles.role_section}>
              <div className={styles.role_options}>
                <div 
                  className={`${styles.role_option} ${formData.role === 'customer' ? styles.selected : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer', servicesOffered: [] }))}
                >
                  <h3>Customer</h3>
                  <p>I want to book and use services</p>
                </div>
                <div 
                  className={`${styles.role_option} ${formData.role === 'vendor' ? styles.selected : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                >
                  <h3>Service Provider</h3>
                  <p>I want to offer services to customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section - Only for Vendors */}
          {formData.role === 'vendor' && (
            <div className={styles.form_section}>
              <h3 className={styles.section_title}>
                <FiCheck className="inline-icon" />
                Services You Offer
              </h3>
              
              <div className={styles.services_section}>
                <div className={styles.services_grid}>
                  {['Cleaning', 'Tutoring', 'Delivery', 'Repair', 'Beauty', 'Fitness', 'Photography', 'Catering', 'Transportation', 'Pet Care', 'Gardening', 'Other'].map((service) => (
                    <div
                      key={service}
                      className={`${styles.service_option} ${
                        formData.servicesOffered.includes(service) ? styles.selected : ''
                      }`}
                      onClick={() => {
                        const isSelected = formData.servicesOffered.includes(service);
                        if (isSelected) {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: prev.servicesOffered.filter(s => s !== service)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: [...prev.servicesOffered, service]
                          }));
                        }
                      }}
                    >
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </div>
                  ))}
                </div>
                
                {formData.servicesOffered.length > 0 && (
                  <div className={styles.pro}>
                    <ul>
                      {formData.servicesOffered.map((service, index) => (
                        <li key={index}>
                          {service.charAt(0).toUpperCase() + service.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.createbtn} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Profile...
              </>
            ) : (
              <>
                <FiCheck size={20} />
                Complete Profile
              </>
            )}
          </button>

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className={styles.error_message}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className={styles.success_message}>
              {successMessage}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default CreateProfile;
