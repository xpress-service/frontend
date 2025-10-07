'use client'
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MdAdminPanelSettings, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FiMail, FiLock } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from '../../sass/admin/adminLogin.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const AdminLogin = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/adminAuth/admin-login`, {
        email: formData.email,
        password: formData.password
      });

      const { token, userId } = response.data;

      // Store token and login with admin role
      login(token, userId, 'admin');

      // Success message
      Swal.fire({
        title: 'Welcome Admin!',
        text: 'Successfully logged in to admin dashboard',
        icon: 'success',
        confirmButtonColor: '#667eea',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirect to admin dashboard
      router.push('/admin');

    } catch (error: any) {
      console.error('Admin login error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || 'Login failed';
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      Swal.fire({
        title: 'Login Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.admin_login_container}>
      <div className={styles.admin_login_card}>
        <div className={styles.admin_header}>
          <div className={styles.admin_icon}>
            <MdAdminPanelSettings />
          </div>
          <h1>Admin Portal</h1>
          <p>Secure administrator access</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.admin_form}>
          <div className={styles.form_group}>
            <label htmlFor="email">
              <FiMail />
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your admin email"
              disabled={loading}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="password">
              <FiLock />
              Password
            </label>
            <div className={styles.password_input}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.password_toggle}
                disabled={loading}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.admin_login_btn}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Authenticating...
              </>
            ) : (
              <>
                <MdAdminPanelSettings />
                Admin Login
              </>
            )}
          </button>
        </form>

        <div className={styles.admin_footer}>
          <div className={styles.security_notice}>
            <h4>🔒 Secure Access</h4>
            <p>This portal is restricted to authorized administrators only. All access attempts are logged and monitored.</p>
          </div>
          
          <div className={styles.support_info}>
            <p>Need help? Contact system administrator</p>
            <a href="mailto:admin@servicexpress.com">admin@servicexpress.com</a>
          </div>
        </div>
      </div>

      <div className={styles.background_pattern}></div>
    </div>
  );
};

export default AdminLogin;