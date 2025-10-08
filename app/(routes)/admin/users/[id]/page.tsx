'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiTool,
  FiSave
} from 'react-icons/fi';
import { MdAdminPanelSettings, MdVerifiedUser, MdBlock } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileAvatar from '../../../../_components/ProfileAvatar';
import styles from '../../../../sass/admin/userDetails.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface UserDetails {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'vendor' | 'customer';
  phone?: string;
  location?: string;
  profileImage?: string;
  usercode: string;
  dateJoined: string;
  isActive: boolean;
  stats: {
    totalOrders: number;
    totalServices: number;
  };
}

const UserDetailsPage = () => {
  const { userId, userRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userDetailsId = params.id as string;
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: '',
    role: 'customer' as 'vendor' | 'customer'
  });

  // Check if user is admin
  useEffect(() => {
    if (!userId || userRole !== 'admin') {
      router.push('/sign-in');
      return;
    }
    if (userDetailsId) {
      fetchUserDetails();
    }
  }, [userId, userRole, router, userDetailsId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/users/${userDetailsId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setUser(userData);
      setEditForm({
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone || '',
        location: userData.location || '',
        role: userData.role
      });
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 404) {
        Swal.fire('User Not Found', 'The requested user could not be found', 'error');
        router.push('/admin');
      } else {
        Swal.fire('Error', 'Failed to load user details', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${baseUrl}/admin/users/${userDetailsId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'User updated successfully', 'success');
      setEditMode(false);
      fetchUserDetails(); // Refresh data
    } catch (error: any) {
      console.error('Error updating user:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${baseUrl}/admin/users/${userDetailsId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'User status updated', 'success');
      fetchUserDetails(); // Refresh data
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      Swal.fire('Error', 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Yes, delete user!'
    });

    if (confirmDelete.isConfirmed) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${baseUrl}/admin/users/${userDetailsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        router.push('/admin');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        Swal.fire('Error', 'Failed to delete user', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.spinner}></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error_container}>
        <h2>User Not Found</h2>
        <button onClick={() => router.push('/admin')} className={styles.back_btn}>
          <FiArrowLeft /> Back to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.user_details_container}>
      <div className={styles.user_details_header}>
        <button onClick={() => router.push('/admin')} className={styles.back_btn}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1>User Details</h1>
      </div>

      <div className={styles.user_card}>
        <div className={styles.user_header}>
          <div className={styles.user_avatar_section}>
            <ProfileAvatar
              src={user.profileImage}
              firstname={user.firstname}
              lastname={user.lastname}
              width={100}
              height={100}
              className={styles.user_avatar}
            />
            <div className={styles.user_basic_info}>
              <h2>{user.firstname} {user.lastname}</h2>
              <span className={`${styles.role_badge} ${styles[user.role]}`}>
                {user.role === 'vendor' ? '🏪 Service Provider' : '👤 Customer'}
              </span>
              <code className={styles.user_code}>{user.usercode}</code>
              <span className={`${styles.status_badge} ${user.isActive ? styles.active : styles.inactive}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className={styles.action_buttons}>
            <button 
              onClick={() => setEditMode(!editMode)} 
              className={styles.edit_btn}
            >
              <FiEdit /> {editMode ? 'Cancel Edit' : 'Edit User'}
            </button>
            <button 
              onClick={handleToggleStatus}
              className={styles.toggle_btn}
            >
              {user.isActive ? <MdBlock /> : <MdVerifiedUser />}
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button 
              onClick={handleDeleteUser}
              className={styles.delete_btn}
            >
              <FiTrash2 /> Delete User
            </button>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleEditSubmit} className={styles.edit_form}>
            <div className={styles.form_grid}>
              <div className={styles.form_group}>
                <label><FiUser /> First Name</label>
                <input
                  type="text"
                  value={editForm.firstname}
                  onChange={(e) => setEditForm({...editForm, firstname: e.target.value})}
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label><FiUser /> Last Name</label>
                <input
                  type="text"
                  value={editForm.lastname}
                  onChange={(e) => setEditForm({...editForm, lastname: e.target.value})}
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label><FiMail /> Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value as 'vendor' | 'customer'})}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div className={styles.form_group}>
                <label><FiPhone /> Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div className={styles.form_group}>
                <label><FiMapPin /> Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                />
              </div>
            </div>
            <div className={styles.form_actions}>
              <button type="submit" className={styles.save_btn}>
                <FiSave /> Save Changes
              </button>
              <button type="button" onClick={() => setEditMode(false)} className={styles.cancel_btn}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.user_details_content}>
            <div className={styles.details_grid}>
              <div className={styles.detail_card}>
                <div className={styles.detail_header}>
                  <FiUser className={styles.detail_icon} />
                  <h3>Personal Information</h3>
                </div>
                <div className={styles.detail_content}>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Full Name:</span>
                    <span className={styles.value}>{user.firstname} {user.lastname}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>{user.email}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>{user.phone || 'Not provided'}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Location:</span>
                    <span className={styles.value}>{user.location || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detail_card}>
                <div className={styles.detail_header}>
                  <FiCalendar className={styles.detail_icon} />
                  <h3>Account Information</h3>
                </div>
                <div className={styles.detail_content}>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>User ID:</span>
                    <span className={styles.value}><code>{user._id}</code></span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>User Code:</span>
                    <span className={styles.value}><code>{user.usercode}</code></span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Date Joined:</span>
                    <span className={styles.value}>{new Date(user.dateJoined).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Account Role:</span>
                    <span className={styles.value}>
                      <span className={`${styles.role_badge} ${styles[user.role]}`}>
                        {user.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detail_card}>
                <div className={styles.detail_header}>
                  <FiShoppingBag className={styles.detail_icon} />
                  <h3>Activity Statistics</h3>
                </div>
                <div className={styles.detail_content}>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Total Orders:</span>
                    <span className={styles.value}>{user.stats.totalOrders}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Services Posted:</span>
                    <span className={styles.value}>{user.stats.totalServices}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Account Status:</span>
                    <span className={`${styles.status_badge} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;