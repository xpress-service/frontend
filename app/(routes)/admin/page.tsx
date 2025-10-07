'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiUsers, 
  FiUserCheck, 
  FiShoppingBag, 
  FiTrendingUp, 
  FiDollarSign,
  FiEye,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCreditCard
} from 'react-icons/fi';
import { MdAdminPanelSettings, MdVerifiedUser, MdBlock, MdAnalytics } from 'react-icons/md';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileAvatar from '../../_components/ProfileAvatar';
import styles from '../../sass/admin/admin.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface User {
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
  isActive?: boolean;
  isEmailVerified?: boolean;
  vendorStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  ordersThisMonth: number;
}

interface Vendor {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  location?: string;
  vendorStatus: 'pending' | 'approved' | 'rejected';
  isEmailVerified: boolean;
  dateJoined: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  services?: Array<{
    serviceName: string;
    category: string;
  }>;
}

interface VendorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const AdminDashboard = () => {
  const { userId, userRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'vendor' | 'customer'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Check if user is admin
  useEffect(() => {
    if (!userId || userRole !== 'admin') {
      router.push('/sign-in');
      return;
    }
    fetchDashboardData();
  }, [userId, userRole, router]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usercode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, roleFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard statistics
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get(`${baseUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 403) {
        Swal.fire('Access Denied', 'You do not have admin privileges', 'error');
        router.push('/dashboard');
      } else {
        Swal.fire('Error', 'Failed to load admin dashboard', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'view' | 'edit' | 'delete' | 'toggle-status') => {
    const token = localStorage.getItem('authToken');

    try {
      switch (action) {
        case 'view':
          // Navigate to user details or show modal
          router.push(`/admin/users/${userId}`);
          break;
          
        case 'edit':
          // Navigate to edit user page
          router.push(`/admin/users/${userId}/edit`);
          break;
          
        case 'delete':
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
            await axios.delete(`${baseUrl}/admin/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            fetchDashboardData(); // Refresh data
          }
          break;
          
        case 'toggle-status':
          await axios.patch(`${baseUrl}/admin/users/${userId}/toggle-status`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          Swal.fire('Success', 'User status updated', 'success');
          fetchDashboardData(); // Refresh data
          break;
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      Swal.fire('Error', `Failed to ${action} user`, 'error');
    }
  };

  const exportUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/users/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire('Success', 'Users data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting users:', error);
      Swal.fire('Error', 'Failed to export users data', 'error');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <MdAdminPanelSettings className={styles.loading_icon} />
        <h2>Loading Admin Dashboard...</h2>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.admin_dashboard}>
      <div className={styles.admin_header}>
        <div className={styles.header_content}>
          <div className={styles.title_section}>
            <MdAdminPanelSettings className={styles.admin_icon} />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage users, vendors, and monitor system performance</p>
            </div>
          </div>
          <Link href="/analytics" className={styles.analytics_btn}>
            <MdAnalytics />
            Full Analytics
          </Link>
          <button 
            onClick={fetchDashboardData} 
            className={styles.refresh_btn}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.admin_tabs}>
        <button 
          className={`${styles.tab_button} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiTrendingUp /> Overview
        </button>
        <button 
          className={`${styles.tab_button} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> User Management
        </button>
        <button 
          className={`${styles.tab_button} ${activeTab === 'vendors' ? styles.active : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <FiUserCheck /> Vendor Management
        </button>
        <button 
          className={`${styles.tab_button} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FiShoppingBag /> Orders
        </button>
        <button 
          className={`${styles.tab_button} ${activeTab === 'payments' ? styles.active : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FiCreditCard /> Payments
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className={styles.overview_content}>
          <div className={styles.stats_grid}>
            <div className={styles.stat_card}>
              <div className={styles.stat_icon}>
                <FiUsers />
              </div>
              <div className={styles.stat_info}>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
                <span className={styles.stat_change}>+{stats.newUsersThisMonth} this month</span>
              </div>
            </div>

            <div className={styles.stat_card}>
              <div className={styles.stat_icon}>
                <FiUserCheck />
              </div>
              <div className={styles.stat_info}>
                <h3>{stats.totalVendors}</h3>
                <p>Total Vendors</p>
                <span className={styles.stat_change}>{stats.activeUsers} active</span>
              </div>
            </div>

            <div className={styles.stat_card}>
              <div className={styles.stat_icon}>
                <FiShoppingBag />
              </div>
              <div className={styles.stat_info}>
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
                <span className={styles.stat_change}>+{stats.ordersThisMonth} this month</span>
              </div>
            </div>

            <div className={styles.stat_card}>
              <div className={styles.stat_icon}>
                <FiDollarSign />
              </div>
              <div className={styles.stat_info}>
                <h3>₦{stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
                <span className={styles.stat_change}>Platform earnings</span>
              </div>
            </div>
          </div>

          {/* <div className={styles.overview_charts}>
            <div className={styles.chart_placeholder}>
              <h3>User Growth Chart</h3>
              <p>Chart implementation will be added with analytics dashboard</p>
            </div>
            <div className={styles.chart_placeholder}>
              <h3>Revenue Trends</h3>
              <p>Chart implementation will be added with analytics dashboard</p>
            </div>
          </div> */}

          {/* Charts Section */}
          <div className={styles.charts_section_header}>
            <h2>Analytics Dashboard</h2>
            <p>Real-time insights into your platform performance</p>
          </div>
          
          <div className={styles.charts_section}>
            <UserGrowthChart />
            <RevenueTrendsChart />
            <OrdersAnalyticsChart />
            <PaymentMethodChart />
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className={styles.users_content}>
          <div className={styles.users_controls}>
            <div className={styles.search_filter}>
              <div className={styles.search_box}>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'vendor' | 'customer')}
                className={styles.filter_select}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
              </select>
            </div>
            <button onClick={exportUsers} className={styles.export_btn}>
              <FiDownload /> Export CSV
            </button>
          </div>

          <div className={styles.users_table_container}>
            <table className={styles.users_table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>User ID</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.user_info}>
                        <ProfileAvatar
                          src={user.profileImage}
                          firstname={user.firstname}
                          lastname={user.lastname}
                          width={40}
                          height={40}
                        />
                        <div>
                          <p className={styles.user_name}>{user.firstname} {user.lastname}</p>
                          <p className={styles.user_email}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.role_badge} ${styles[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <p>{user.phone || 'Not provided'}</p>
                      <p className={styles.location}>{user.location || 'Not provided'}</p>
                    </td>
                    <td>
                      <code className={styles.user_code}>{user.usercode}</code>
                    </td>
                    <td>{new Date(user.dateJoined).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.status_badge} ${user.isActive !== false ? styles.active : styles.inactive}`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.action_buttons}>
                        <button 
                          onClick={() => handleUserAction(user._id, 'view')}
                          className={styles.view_btn}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => handleUserAction(user._id, 'edit')}
                          className={styles.edit_btn}
                          title="Edit User"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleUserAction(user._id, 'toggle-status')}
                          className={styles.toggle_btn}
                          title="Toggle Status"
                        >
                          {user.isActive !== false ? <MdBlock /> : <MdVerifiedUser />}
                        </button>
                        <button 
                          onClick={() => handleUserAction(user._id, 'delete')}
                          className={styles.delete_btn}
                          title="Delete User"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.page_btn}
              >
                Previous
              </button>
              
              <div className={styles.page_numbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.page_btn} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.page_btn}
              >
                Next
              </button>
            </div>
          )}

          <div className={styles.table_info}>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
        </div>
      )}

      {/* Vendor Management Tab */}
      {activeTab === 'vendors' && (
        <VendorManagementContent />
      )}

      {activeTab === 'orders' && (
        <OrderManagementContent />
      )}

      {/* Payments Management Tab */}
      {activeTab === 'payments' && (
        <PendingOfflinePayments />
      )}
    </div>
  );
};

// Vendor Management Content Component
const VendorManagementContent = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [vendorStats, setVendorStats] = useState<VendorStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
    fetchVendorStats();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, activeFilter, searchTerm]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      Swal.fire('Error', 'Failed to fetch vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/vendor-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendorStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch vendor stats:', error);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.vendorStatus === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVendors(filtered);
  };

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    setActionLoading(vendorId);
    try {
      const token = localStorage.getItem('authToken');
      const url = `${baseUrl}/admin/vendors/${vendorId}/${action}`;
      const data = action === 'reject' ? { rejectionReason } : {};
      
      await axios.patch(url, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data
      await fetchVendors();
      await fetchVendorStats();
      
      Swal.fire('Success', `Vendor ${action}d successfully!`, 'success');
      setShowModal(false);
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error);
      Swal.fire('Error', `Failed to ${action} vendor. Please try again.`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string, isEmailVerified: boolean) => {
    if (status === 'approved') {
      return <span className={`${styles.status_badge} ${styles.approved}`}>✓ Approved</span>;
    } else if (status === 'rejected') {
      return <span className={`${styles.status_badge} ${styles.rejected}`}>✗ Rejected</span>;
    } else {
      return (
        <span className={`${styles.status_badge} ${styles.pending}`}>
          ⏳ {isEmailVerified ? 'Pending Review' : 'Email Unverified'}
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}></div>
        <p>Loading vendor data...</p>
      </div>
    );
  }

  return (
    <div className={styles.vendor_management}>
      {/* Header */}
      <div className={styles.section_header}>
        <h2>Vendor Management</h2>
        <p>Manage vendor applications, approvals, and performance</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.stats_grid}>
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <FiUsers />
          </div>
          <div className={styles.stat_content}>
            <h3>{vendorStats.total}</h3>
            <p>Total Vendors</p>
          </div>
        </div>
        <div className={styles.stat_card}>
          <div className={`${styles.stat_icon} ${styles.pending}`}>
            <FiRefreshCw />
          </div>
          <div className={styles.stat_content}>
            <h3>{vendorStats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className={styles.stat_card}>
          <div className={`${styles.stat_icon} ${styles.approved}`}>
            <MdVerifiedUser />
          </div>
          <div className={styles.stat_content}>
            <h3>{vendorStats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className={styles.stat_card}>
          <div className={`${styles.stat_icon} ${styles.rejected}`}>
            <MdBlock />
          </div>
          <div className={styles.stat_content}>
            <h3>{vendorStats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.vendor_controls}>
        <div className={styles.filter_buttons}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              className={`${styles.filter_button} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'all' ? ` (${vendorStats.total})` : 
               filter === 'pending' ? ` (${vendorStats.pending})` :
               filter === 'approved' ? ` (${vendorStats.approved})` :
               ` (${vendorStats.rejected})`}
            </button>
          ))}
        </div>
        <div className={styles.search_container}>
          <FiSearch className={styles.search_icon} />
          <input
            type="text"
            placeholder="Search vendors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.search_input}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className={styles.table_container}>
        <table className={styles.vendors_table}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor._id}>
                <td>
                  <div className={styles.vendor_info}>
                    <div className={styles.vendor_avatar}>
                      {vendor.firstname[0]}{vendor.lastname[0]}
                    </div>
                    <div className={styles.vendor_details}>
                      <h4>{vendor.firstname} {vendor.lastname}</h4>
                      <p>{vendor.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.contact_info}>
                    {vendor.phone && (
                      <div className={styles.contact_item}>
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.location && (
                      <div className={styles.contact_item}>
                        <span>{vendor.location}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  {getStatusBadge(vendor.vendorStatus, vendor.isEmailVerified)}
                </td>
                <td>
                  <span className={`${styles.verification_badge} ${vendor.isEmailVerified ? styles.verified : styles.unverified}`}>
                    {vendor.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </td>
                <td>
                  <span className={styles.date_text}>
                    {formatDate(vendor.dateJoined)}
                  </span>
                </td>
                <td>
                  <div className={styles.action_buttons}>
                    <button
                      className={styles.view_button}
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowModal(true);
                      }}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    {vendor.vendorStatus === 'pending' && vendor.isEmailVerified && (
                      <>
                        <button
                          className={styles.approve_button}
                          onClick={() => handleVendorAction(vendor._id, 'approve')}
                          disabled={actionLoading === vendor._id}
                          title="Approve Vendor"
                        >
                          {actionLoading === vendor._id ? <FiRefreshCw className={styles.spinning} /> : '✓'}
                        </button>
                        <button
                          className={styles.reject_button}
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowModal(true);
                          }}
                          disabled={actionLoading === vendor._id}
                          title="Reject Vendor"
                        >
                          ✗
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVendors.length === 0 && (
          <div className={styles.no_data}>
            <p>No vendors found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {showModal && selectedVendor && (
        <VendorModal
          vendor={selectedVendor}
          onClose={() => setShowModal(false)}
          onApprove={() => handleVendorAction(selectedVendor._id, 'approve')}
          onReject={(reason) => handleVendorAction(selectedVendor._id, 'reject', reason)}
          actionLoading={actionLoading === selectedVendor._id}
        />
      )}
    </div>
  );
};

// User Growth Chart Component
const UserGrowthChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchUserGrowthData();
  }, []);

  const fetchUserGrowthData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/analytics/user-growth`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.growth || [];
      
      // If no data, use mock data for demonstration
      if (data.length === 0) {
        const mockData = [
          { period: '5/2024', count: 12 },
          { period: '6/2024', count: 18 },
          { period: '7/2024', count: 25 },
          { period: '8/2024', count: 22 },
          { period: '9/2024', count: 35 },
          { period: '10/2024', count: 28 }
        ];
        setChartData(mockData);
      } else {
        setChartData(data);
      }
      setError(null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch user growth data:', error);
      setError('Failed to load chart data');
      // Use mock data on error
      const mockData = [
        { period: '5/2024', count: 12 },
        { period: '6/2024', count: 18 },
        { period: '7/2024', count: 25 },
        { period: '8/2024', count: 22 },
        { period: '9/2024', count: 35 },
        { period: '10/2024', count: 28 }
      ];
      setChartData(mockData);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.chart_loading}>Loading chart...</div>;

  const maxValue = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className={styles.chart_widget}>
      <div className={styles.chart_header}>
        <div className={styles.chart_title}>
          <h3>User Growth</h3>
          <small>New users over time</small>
          {lastUpdated && (
            <div className={styles.last_updated}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button 
          className={styles.refresh_btn}
          onClick={fetchUserGrowthData}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinning : ''} />
        </button>
      </div>
      {error && (
        <div className={styles.chart_error}>
          <span>{error}</span>
        </div>
      )}
      
      {chartData.length > 0 && (
        <div className={styles.chart_summary}>
          <div className={styles.summary_item}>
            <span className={styles.summary_label}>Total New Users</span>
            <span className={styles.summary_value}>
              {chartData.reduce((sum, d) => sum + d.count, 0)}
            </span>
          </div>
          <div className={styles.summary_item}>
            <span className={styles.summary_label}>Average Growth</span>
            <span className={styles.summary_value}>
              {Math.round(chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length)}
            </span>
          </div>
        </div>
      )}
      
      <div className={styles.line_chart}>
        <div className={styles.chart_grid}>
          {chartData.map((data, index) => (
            <div key={index} className={styles.chart_bar}>
              <div 
                className={styles.bar_fill}
                style={{ 
                  height: `${(data.count / maxValue) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              ></div>
              <span className={styles.bar_label}>{data.period}</span>
              <span className={styles.bar_value}>{data.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Revenue Trends Chart Component
const RevenueTrendsChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueTrends();
  }, []);

  const fetchRevenueTrends = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/analytics/revenue-trends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.trends || [];
      
      // If no data, use mock data for demonstration
      if (data.length === 0) {
        const mockData = [
          { period: '5/2024', revenue: 45000 },
          { period: '6/2024', revenue: 62000 },
          { period: '7/2024', revenue: 58000 },
          { period: '8/2024', revenue: 73000 },
          { period: '9/2024', revenue: 85000 },
          { period: '10/2024', revenue: 91000 }
        ];
        setChartData(mockData);
      } else {
        setChartData(data);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to fetch revenue trends:', error);
      setError('Failed to load chart data');
      // Use mock data on error
      const mockData = [
        { period: '5/2024', revenue: 45000 },
        { period: '6/2024', revenue: 62000 },
        { period: '7/2024', revenue: 58000 },
        { period: '8/2024', revenue: 73000 },
        { period: '9/2024', revenue: 85000 },
        { period: '10/2024', revenue: 91000 }
      ];
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.chart_loading}>Loading chart...</div>;

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className={styles.chart_widget}>
      <div className={styles.chart_header}>
        <div className={styles.chart_title}>
          <h3>Revenue Trends</h3>
          <small>Monthly revenue growth</small>
        </div>
        <button 
          className={styles.refresh_btn}
          onClick={fetchRevenueTrends}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinning : ''} />
        </button>
      </div>
      {error && (
        <div className={styles.chart_error}>
          <span>{error}</span>
        </div>
      )}
      <div className={styles.area_chart}>
        <div className={styles.chart_grid}>
          {chartData.map((data, index) => (
            <div key={index} className={styles.revenue_bar}>
              <div 
                className={styles.revenue_fill}
                style={{ 
                  height: `${(data.revenue / maxRevenue) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              ></div>
              <span className={styles.bar_label}>{data.period}</span>
              <span className={styles.bar_value}>₦{data.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Orders Analytics Chart Component
const OrdersAnalyticsChart = () => {
  const [orderStats, setOrderStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderAnalytics();
  }, []);

  const fetchOrderAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/analytics/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.analytics || {};
      
      // If no data, use mock data
      if (Object.keys(data).length === 0 || Object.values(data).every(v => v === 0)) {
        const mockData = {
          pending: 15,
          approved: 32,
          rejected: 8,
          paid: 45
        };
        setOrderStats(mockData);
      } else {
        setOrderStats(data);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to fetch order analytics:', error);
      setError('Failed to load chart data');
      // Use mock data on error
      const mockData = {
        pending: 15,
        approved: 32,
        rejected: 8,
        paid: 45
      };
      setOrderStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.chart_loading}>Loading chart...</div>;

  const orderData = [
    { label: 'Pending', count: orderStats.pending || 0, color: '#f59e0b' },
    { label: 'Approved', count: orderStats.approved || 0, color: '#10b981' },
    { label: 'Rejected', count: orderStats.rejected || 0, color: '#ef4444' },
    { label: 'Paid', count: orderStats.paid || 0, color: '#3b82f6' }
  ];

  const total = orderData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.chart_widget}>
      <div className={styles.chart_header}>
        <div className={styles.chart_title}>
          <h3>Orders Analytics</h3>
          <small>Order status distribution</small>
        </div>
        <button 
          className={styles.refresh_btn}
          onClick={fetchOrderAnalytics}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinning : ''} />
        </button>
      </div>
      {error && (
        <div className={styles.chart_error}>
          <span>{error}</span>
        </div>
      )}
      <div className={styles.donut_chart}>
        <div className={styles.donut_center}>
          <span className={styles.donut_total}>{total}</span>
          <small>Total Orders</small>
        </div>
        <div className={styles.chart_legend}>
          {orderData.map((item, index) => (
            <div key={index} className={styles.legend_item}>
              <div 
                className={styles.legend_color}
                style={{ backgroundColor: item.color }}
              ></div>
              <span className={styles.legend_label}>{item.label}</span>
              <span className={styles.legend_value}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Payment Method Chart Component
const PaymentMethodChart = () => {
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/analytics/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.methods || [];
      
      // If no data, use mock data
      if (data.length === 0) {
        const mockData = [
          { method: 'online', count: 67 },
          { method: 'offline', count: 33 }
        ];
        setPaymentData(mockData);
      } else {
        setPaymentData(data);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      setError('Failed to load chart data');
      // Use mock data on error
      const mockData = [
        { method: 'online', count: 67 },
        { method: 'offline', count: 33 }
      ];
      setPaymentData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.chart_loading}>Loading chart...</div>;

  const total = paymentData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.chart_widget}>
      <div className={styles.chart_header}>
        <div className={styles.chart_title}>
          <h3>Payment Methods</h3>
          <small>Payment distribution</small>
        </div>
        <button 
          className={styles.refresh_btn}
          onClick={fetchPaymentData}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinning : ''} />
        </button>
      </div>
      {error && (
        <div className={styles.chart_error}>
          <span>{error}</span>
        </div>
      )}
      <div className={styles.horizontal_chart}>
        {paymentData.map((method, index) => {
          const percentage = total > 0 ? (method.count / total) * 100 : 0;
          return (
            <div key={index} className={styles.horizontal_bar}>
              <div className={styles.bar_info}>
                <span className={styles.method_name}>{method.method}</span>
                <span className={styles.method_count}>{method.count}</span>
              </div>
              <div className={styles.progress_bar}>
                <div 
                  className={styles.progress_fill}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: method.method === 'online' ? '#10b981' : '#f59e0b',
                    animationDelay: `${index * 0.2}s`
                  }}
                ></div>
              </div>
              <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Order Management Content Component
const OrderManagementContent = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStats, setOrderStats] = useState<any>({});

  useEffect(() => {
    fetchAllOrders();
    fetchOrderStats();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      Swal.fire('Error', 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/admin/order-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${baseUrl}/orders/status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire('Success', `Order ${newStatus.toLowerCase()} successfully`, 'success');
      fetchAllOrders();
      setShowOrderModal(false);
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update order', 'error');
    }
  };

  const refundOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Process Refund',
      text: 'Are you sure you want to process a refund for this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      confirmButtonText: 'Yes, Process Refund'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.post(
          `${baseUrl}/admin/orders/${orderId}/refund`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        Swal.fire('Success', 'Refund processed successfully', 'success');
        fetchAllOrders();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to process refund', 'error');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = !searchTerm || 
      order.serviceId?.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string, isPaid: boolean) => {
    if (status === 'Rejected') return '#ef4444';
    if (status === 'Approved' && isPaid) return '#10b981';
    if (status === 'Approved' && !isPaid) return '#f59e0b';
    return '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.order_management}>
      {/* Order Stats */}
      <div className={styles.order_stats}>
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <FiShoppingBag />
          </div>
          <div className={styles.stat_content}>
            <h3>{orderStats.totalOrders || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <FiTrendingUp />
          </div>
          <div className={styles.stat_content}>
            <h3>{orderStats.pendingOrders || 0}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <FiUserCheck />
          </div>
          <div className={styles.stat_content}>
            <h3>{orderStats.approvedOrders || 0}</h3>
            <p>Approved</p>
          </div>
        </div>
        
        <div className={styles.stat_card}>
          <div className={styles.stat_icon}>
            <FiDollarSign />
          </div>
          <div className={styles.stat_content}>
            <h3>₦{(orderStats.totalRevenue || 0).toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.order_controls}>
        <div className={styles.search_section}>
          <div className={styles.search_box}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search orders, customers, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filter_section}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.status_filter}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <button 
            onClick={fetchAllOrders}
            className={styles.refresh_btn}
            title="Refresh Orders"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.orders_table_container}>
        <table className={styles.orders_table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className={styles.order_id}>#{order._id.slice(-8)}</span>
                </td>
                <td>
                  <div className={styles.customer_info}>
                    <div className={styles.customer_avatar}>
                      {order.userId?.firstname?.[0]}{order.userId?.lastname?.[0]}
                    </div>
                    <div>
                      <p>{order.userId?.firstname} {order.userId?.lastname}</p>
                      <small>{order.userId?.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.service_info}>
                    <p>{order.serviceId?.serviceName}</p>
                    <small>Qty: {order.quantity}</small>
                  </div>
                </td>
                <td>
                  <div className={styles.vendor_info}>
                    <p>{order.serviceOwnerId?.firstname} {order.serviceOwnerId?.lastname}</p>
                    <small>{order.serviceOwnerId?.email}</small>
                  </div>
                </td>
                <td>
                  <div className={styles.amount_info}>
                    <p>₦{((order.serviceId?.price || 0) * order.quantity).toLocaleString()}</p>
                    {order.platformFee > 0 && (
                      <small>Fee: ₦{order.platformFee.toLocaleString()}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span 
                    className={styles.status_badge}
                    style={{ 
                      backgroundColor: getStatusColor(order.status, order.isPaid),
                      color: 'white'
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className={styles.payment_status}>
                    <span className={`${styles.payment_badge} ${order.isPaid ? styles.paid : styles.unpaid}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    {order.paymentMethod && (
                      <small>{order.paymentMethod}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.date_text}>
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                <td>
                  <div className={styles.action_buttons}>
                    <button
                      className={styles.view_button}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className={styles.no_data}>
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={updateOrderStatus}
          onRefund={refundOrder}
        />
      )}
    </div>
  );
};

// Pending Offline Payments Component
const PendingOfflinePayments = () => {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/orders/payments/pending-offline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingPayments(response.data.pendingPayments || []);
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId: string) => {
    try {
      const confirmedBy = localStorage.getItem('userId');
      const paymentProof = prompt('Enter payment proof/reference (optional):') || '';
      
      if (!confirm('Confirm this offline payment?')) return;

      const response = await axios.patch(
        `${baseUrl}/orders/payments/confirm-offline/${orderId}`,
        { confirmedBy, paymentProof }
      );

      if (response.data.success) {
        Swal.fire('Success', 'Payment confirmed successfully!', 'success');
        fetchPendingPayments();
      }
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to confirm payment', 'error');
    }
  };

  if (loading) return <div className={styles.loading}>Loading pending payments...</div>;

  return (
    <div className={styles.pending_payments}>
      <div className={styles.section_header}>
        <h3>Pending Offline Payments</h3>
        <span className={styles.count_badge}>{pendingPayments.length}</span>
      </div>
      
      {pendingPayments.length === 0 ? (
        <div className={styles.no_data}>
          <p>No pending offline payments.</p>
        </div>
      ) : (
        <div className={styles.payments_list}>
          {pendingPayments.map((payment) => (
            <div key={payment._id} className={styles.payment_card}>
              <div className={styles.payment_info}>
                <h4>{payment.serviceId.serviceName}</h4>
                <p>Customer: {payment.userId.firstname} {payment.userId.lastname}</p>
                <p>Amount: ₦{(payment.platformFee + payment.vendorReceives).toLocaleString()}</p>
                <p>Platform Fee: ₦{payment.platformFee.toLocaleString()}</p>
                <p>Vendor Receives: ₦{payment.vendorReceives.toLocaleString()}</p>
              </div>
              <div className={styles.payment_actions}>
                <button
                  onClick={() => confirmPayment(payment._id)}
                  className={styles.confirm_btn}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ 
  order, 
  onClose, 
  onUpdateStatus, 
  onRefund 
}: {
  order: any;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onRefund: (orderId: string) => void;
}) => {
  const totalAmount = (order.serviceId?.price || 0) * order.quantity;
  
  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h3>Order Details</h3>
          <button onClick={onClose} className={styles.close_button}>×</button>
        </div>
        
        <div className={styles.modal_body}>
          {/* Order Summary */}
          <div className={styles.order_summary}>
            <div className={styles.summary_row}>
              <strong>Order ID:</strong>
              <span>#{order._id}</span>
            </div>
            <div className={styles.summary_row}>
              <strong>Date:</strong>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.summary_row}>
              <strong>Status:</strong>
              <span 
                className={styles.status_badge}
                style={{ 
                  backgroundColor: order.status === 'Approved' ? '#10b981' : 
                                 order.status === 'Rejected' ? '#ef4444' : '#6b7280',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className={styles.detail_section}>
            <h4>Customer Information</h4>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <strong>Name:</strong>
                <span>{order.userId?.firstname} {order.userId?.lastname}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Email:</strong>
                <span>{order.userId?.email}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Phone:</strong>
                <span>{order.userId?.phone || 'Not provided'}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Location:</strong>
                <span>{order.userId?.location || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className={styles.detail_section}>
            <h4>Service Information</h4>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <strong>Service:</strong>
                <span>{order.serviceId?.serviceName}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Quantity:</strong>
                <span>{order.quantity}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Unit Price:</strong>
                <span>₦{(order.serviceId?.price || 0).toLocaleString()}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Total Amount:</strong>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className={styles.detail_section}>
            <h4>Vendor Information</h4>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <strong>Name:</strong>
                <span>{order.serviceOwnerId?.firstname} {order.serviceOwnerId?.lastname}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Email:</strong>
                <span>{order.serviceOwnerId?.email}</span>
              </div>
              <div className={styles.info_item}>
                <strong>Phone:</strong>
                <span>{order.serviceOwnerId?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className={styles.detail_section}>
            <h4>Payment Information</h4>
            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <strong>Payment Status:</strong>
                <span className={`${styles.payment_badge} ${order.isPaid ? styles.paid : styles.unpaid}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className={styles.info_item}>
                <strong>Payment Method:</strong>
                <span>{order.paymentMethod || 'Not selected'}</span>
              </div>
              {order.platformFee > 0 && (
                <>
                  <div className={styles.info_item}>
                    <strong>Platform Fee (10%):</strong>
                    <span>₦{order.platformFee.toLocaleString()}</span>
                  </div>
                  <div className={styles.info_item}>
                    <strong>Vendor Receives:</strong>
                    <span>₦{order.vendorReceives.toLocaleString()}</span>
                  </div>
                </>
              )}
              {order.paymentReference && (
                <div className={styles.info_item}>
                  <strong>Payment Reference:</strong>
                  <span>{order.paymentReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.modal_actions}>
            {order.status === 'Pending' && (
              <>
                <button
                  className={styles.approve_btn}
                  onClick={() => onUpdateStatus(order._id, 'Approved')}
                >
                  Approve Order
                </button>
                <button
                  className={styles.reject_btn}
                  onClick={() => onUpdateStatus(order._id, 'Rejected')}
                >
                  Reject Order
                </button>
              </>
            )}
            
            {order.isPaid && (
              <button
                className={styles.refund_btn}
                onClick={() => onRefund(order._id)}
              >
                Process Refund
              </button>
            )}
            
            <button
              className={styles.cancel_btn}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vendor Details Modal Component
const VendorModal = ({ 
  vendor, 
  onClose, 
  onApprove, 
  onReject, 
  actionLoading 
}: {
  vendor: Vendor;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  actionLoading: boolean;
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Swal.fire('Error', 'Please provide a rejection reason', 'error');
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <h3>Vendor Details</h3>
          <button onClick={onClose} className={styles.close_button}>×</button>
        </div>
        
        <div className={styles.modal_body}>
          <div className={styles.vendor_profile}>
            <div className={styles.profile_avatar}>
              {vendor.firstname[0]}{vendor.lastname[0]}
            </div>
            <div className={styles.profile_info}>
              <h4>{vendor.firstname} {vendor.lastname}</h4>
              <p>{vendor.email}</p>
              {vendor.phone && <p>📞 {vendor.phone}</p>}
              {vendor.location && <p>📍 {vendor.location}</p>}
            </div>
          </div>

          <div className={styles.vendor_status}>
            <div className={styles.status_item}>
              <strong>Status:</strong>
              <span className={`${styles.status_badge} ${styles[vendor.vendorStatus]}`}>
                {vendor.vendorStatus.charAt(0).toUpperCase() + vendor.vendorStatus.slice(1)}
              </span>
            </div>
            <div className={styles.status_item}>
              <strong>Email Verified:</strong>
              <span className={`${styles.verification_badge} ${vendor.isEmailVerified ? styles.verified : styles.unverified}`}>
                {vendor.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
              </span>
            </div>
            <div className={styles.status_item}>
              <strong>Applied:</strong>
              <span>{new Date(vendor.dateJoined).toLocaleString()}</span>
            </div>
            {vendor.approvedAt && (
              <div className={styles.status_item}>
                <strong>Approved:</strong>
                <span>{new Date(vendor.approvedAt).toLocaleString()}</span>
              </div>
            )}
            {vendor.rejectedAt && (
              <div className={styles.status_item}>
                <strong>Rejected:</strong>
                <span>{new Date(vendor.rejectedAt).toLocaleString()}</span>
              </div>
            )}
            {vendor.rejectionReason && (
              <div className={styles.status_item}>
                <strong>Rejection Reason:</strong>
                <span>{vendor.rejectionReason}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modal_actions}>
          {vendor.vendorStatus === 'pending' && vendor.isEmailVerified && (
            <>
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className={styles.approve_btn}
              >
                {actionLoading ? <FiRefreshCw className={styles.spinning} /> : '✓'} Approve
              </button>
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={actionLoading}
                className={styles.reject_btn}
              >
                ✗ Reject
              </button>
            </>
          )}
          <button onClick={onClose} className={styles.cancel_btn}>
            Close
          </button>
        </div>

        {showRejectForm && (
          <div className={styles.reject_form}>
            <h4>Rejection Reason</h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className={styles.reject_textarea}
            />
            <div className={styles.reject_actions}>
              <button onClick={handleReject} disabled={actionLoading} className={styles.confirm_reject_btn}>
                Confirm Rejection
              </button>
              <button onClick={() => setShowRejectForm(false)} className={styles.cancel_reject_btn}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;