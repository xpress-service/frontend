'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiBell, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdSave, MdCancel } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileAvatar from '../../_components/ProfileAvatar';
import styles from '../../sass/settings/settings.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  usercode?: string;
  dateJoined?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
}

const Settings = () => {
  const { userId, userRole } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false
  });

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setProfile(userData);
      setProfileForm({
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || ''
      });
      
      // Load notification settings if they exist
      if (userData.notificationSettings) {
        setNotificationSettings(userData.notificationSettings);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire('Error', 'Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${baseUrl}/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchUserProfile(); // Refresh profile data
      Swal.fire('Success', 'Profile updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('Error', 'New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters long', 'error');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${baseUrl}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire('Success', 'Password updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating password:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${baseUrl}/profile/notifications`, notificationSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Notification preferences updated!', 'success');
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.profile_box}>
      <div className={styles.profile_container}>
        <div className={styles.settings_header}>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className={styles.settings_tabs}>
          <button 
            className={`${styles.tab_button} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser /> Profile
          </button>
          <button 
            className={`${styles.tab_button} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FiLock /> Security
          </button>
          <button 
            className={`${styles.tab_button} ${activeTab === 'notifications' ? styles.active : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell /> Notifications
          </button>
        </div>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className={styles.settings_content}>
            <div className={styles.profile_section}>
              <div className={styles.profile_avatar_section}>
                <ProfileAvatar
                  src={profile?.profileImage}
                  firstname={profile?.firstname}
                  lastname={profile?.lastname}
                  width={100}
                  height={100}
                  className={styles.settings_avatar}
                />
                <div className={styles.profile_info}>
                  <h3>{profile?.firstname} {profile?.lastname}</h3>
                  <p className={styles.user_role}>{userRole === 'vendor' ? 'Service Provider' : 'Customer'}</p>
                  <p className={styles.user_code}>ID: {profile?.usercode}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className={styles.settings_form}>
              <div className={styles.form_row}>
                <div className={styles.form_group}>
                  <label><FiUser /> First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstname}
                    onChange={(e) => setProfileForm({...profileForm, firstname: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label><FiUser /> Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastname}
                    onChange={(e) => setProfileForm({...profileForm, lastname: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className={styles.form_group}>
                <label><FiMail /> Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  required
                />
              </div>

              <div className={styles.form_group}>
                <label><FiPhone /> Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className={styles.form_group}>
                <label><FiMapPin /> Location</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                  placeholder="Enter your location"
                />
              </div>

              <div className={styles.form_actions}>
                <button type="submit" disabled={saving} className={styles.save_btn}>
                  <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className={styles.settings_content}>
            <div className={styles.security_section}>
              <h3>Change Password</h3>
              <p>Keep your account secure by using a strong password</p>

              <form onSubmit={handlePasswordUpdate} className={styles.settings_form}>
                <div className={styles.form_group}>
                  <label><FiLock /> Current Password</label>
                  <div className={styles.password_input}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={styles.password_toggle}
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className={styles.form_group}>
                  <label><FiLock /> New Password</label>
                  <div className={styles.password_input}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={styles.password_toggle}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className={styles.form_group}>
                  <label><FiLock /> Confirm New Password</label>
                  <div className={styles.password_input}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.password_toggle}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className={styles.form_actions}>
                  <button type="submit" disabled={saving} className={styles.save_btn}>
                    <MdSave /> {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div className={styles.settings_content}>
            <div className={styles.notification_section}>
              <h3>Notification Preferences</h3>
              <p>Choose how you want to be notified about your account activity</p>

              <div className={styles.notification_options}>
                <div className={styles.notification_item}>
                  <div className={styles.notification_info}>
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className={styles.toggle_switch}>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notification_item}>
                  <div className={styles.notification_info}>
                    <h4>Push Notifications</h4>
                    <p>Receive push notifications in your browser</p>
                  </div>
                  <label className={styles.toggle_switch}>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: e.target.checked
                      })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notification_item}>
                  <div className={styles.notification_info}>
                    <h4>Order Updates</h4>
                    <p>Get notified about order status changes</p>
                  </div>
                  <label className={styles.toggle_switch}>
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        orderUpdates: e.target.checked
                      })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notification_item}>
                  <div className={styles.notification_info}>
                    <h4>Promotional Emails</h4>
                    <p>Receive offers, promotions, and marketing emails</p>
                  </div>
                  <label className={styles.toggle_switch}>
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotionalEmails}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        promotionalEmails: e.target.checked
                      })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.form_actions}>
                <button 
                  onClick={handleNotificationUpdate} 
                  disabled={saving} 
                  className={styles.save_btn}
                >
                  <MdSave /> {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;