'use client'
import React, {useState} from 'react'
import styles from '../../../sass/userprofile/userprofile.module.scss'
import axios from 'axios'

const CreateProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthdate: '',
    nin: '',
    phone: '',
    location: '',
    gender: '',

    // other fields...
  });

  const handleImageChange = (e:any) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
  
    if (profileImage) {
      data.append('profileImage', profileImage);
    }
  
    // Append form data
    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });
  
    // Retrieve token from localStorage
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
  
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
  
    // Send request with .then and .catch
    axios.put('http://localhost:5000/api/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      // Handle the successful response
      console.log('Profile updated successfully:', response.data);
    })
    .catch(error => {
      // Handle errors
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Error updating profile:', error.response.data.message || error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something else happened in setting up the request
        console.error('Error:', error.message);
      }
    });
  };
  
  
  return (
    <div className={styles.create_profileBox}>
        <main>
        <form  className={styles.create_profileForm} onSubmit={handleSubmit}>
          
        <input type='file' className={styles.profileimage} onChange={handleImageChange} />
        <input type="text" name="name" onChange={e => setFormData({ ...formData, name: e.target.value })} 
        className={styles.items}
        />
        <input type="email" name="email" placeholder='Email'  className={styles.item} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <div className={styles.datebox}>
        <label htmlFor='date'>Date of birth</label>
        <input type="date" name="date" className={styles.item} onChange={e => setFormData({ ...formData, birthdate: e.target.value })} />
        </div>
        <input type="number" name="nin" placeholder='NIN'  className={styles.items} onChange={e => setFormData({ ...formData, nin: e.target.value })} />
        <input type="number" name="phone" placeholder='Phone Number'  className={styles.item} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        <input type="location" name="location" placeholder='Location'  className={styles.item} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        <input type="text" name="gender" placeholder='Gender'  className={styles.item} onChange={e => setFormData({ ...formData, gender: e.target.value })} />
        <button className={styles.createbtn}>Submit</button> 
        </form>
        </main>
    </div>
  )
}

export default CreateProfile