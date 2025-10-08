'use client'
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TbNotification, TbBell, TbBellRinging } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import Image from "next/image";
import axios from "axios";
import styles from "../../sass/layout/layout.module.scss";
import * as jwt_decode from "jwt-decode";
import { FaFirstOrder, FaUserCircle } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { GrClose, GrTransaction } from "react-icons/gr";
import Link from "next/link";
import { MdDashboard, MdTrackChanges, MdLogout, MdSettings, MdAdminPanelSettings, MdInsights, MdShoppingCart } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import { BiUser } from "react-icons/bi";
import { useSearch } from "../searchContext";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import ProfileAvatar from "../../_components/ProfileAvatar";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Modal Component
interface Order {
  _id: string;
  serviceName: string;
  quantity: number;
  firstname: string;
   vendorName: string;
}

interface Notification {
  _id: string;
  orderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  order: Order; 
}

interface ModalProps {
  order: Order | null;
  onClose: () => void;
  onAction: (orderId: string, status: string) => void;
}

interface UserPaymentModalProps {
  order: Order;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ order, onClose, onAction }) => {
  if (!order) return null;
  

  const handleAction = (status: string) => {
    onAction(order._id, status); // Handle accept or reject action
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Order Details</h2>
        <p>Service: {order.serviceName}</p>
        <p>Quantity: {order.quantity}</p>
        <p>User: {order.firstname}</p>
        <div className={styles.modalActions}>
          <button onClick={() => handleAction("Approved")}>Accept</button>
          <button onClick={() => handleAction("Rejected")}>Reject</button>
        </div>
        <button className={styles.closeModal} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


const UserPaymentModal: React.FC<UserPaymentModalProps> = ({ order, onClose },  orderId:string) => {
  const handlePaymentChoice = async (method: 'online' | 'offline') => {
    try {
      // Step 1: Update payment method
      const res = await axios.patch(`${baseUrl}/orders/payment-method/${orderId}`, {
        method,
      });
  console.log(res.data)
      if (method === 'online') {
        // Step 2: Initiate Paystack payment
        const initiateRes = await axios.post(`${baseUrl}/orders/payments/initiate`, {
          orderId: order._id,
        });

        const paymentUrl = initiateRes.data.authorization_url;
        window.location.href = paymentUrl;
      } else {
        alert('Offline payment selected. Follow vendor instructions.');
        onClose();
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      alert('Payment process failed. Try again.');
    }
  };


  
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Choose Payment Method</h2>
        <p>Service: {order.serviceName}</p>
        <p>Quantity: {order.quantity}</p>
        <p>Vendor: {order.firstname}</p>
        <div className={styles.modalActions}>
          <button onClick={() => handlePaymentChoice('online')}>Pay Online</button>
          <button onClick={() => handlePaymentChoice('offline')}>Pay Offline</button>
        </div>
        <button className={styles.closeModal} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ serviceOwnerId }: { serviceOwnerId: string }) => {
  const router = useRouter();
  const { userRole } = useAuth(); // Get userRole from AuthContext
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [showMenu, setShowMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);


const handleVendorAction = async (orderId: string, status: string) => {
  try {
    await axios.patch(`${baseUrl}/orders/status/${orderId}`, { status });
    alert(`Order ${status}`);
    fetchVendorOrders(); // Refresh order list
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Failed to update order status");
  }
};



    // Fetch vendor's orders
  const fetchVendorOrders = async () => {
    const serviceOwnerId = localStorage.getItem("userId");
    if (serviceOwnerId) {
    try {
      const response = await axios.get(
        `${baseUrl}/orders/notifications/${serviceOwnerId}`,
      );
      setOrders(response.data); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating order status:", error.message);
      } else {
        console.error("Unknown error occurred while updating order status.");
      }
    }
  }
  };

  // Fetch notifications for the vendor
  const fetchNotifications = async () => {
  const serviceOwnerId = localStorage.getItem("userId");

  if (serviceOwnerId) {
    try {
      console.log("Fetching vendor notifications for serviceOwnerId:", serviceOwnerId);
      const response = await axios.get(
        `${baseUrl}/orders/notifications/${serviceOwnerId}`
      );

      console.log("Raw vendor notification response:", response.data);

      // Backend returns array directly for this legacy endpoint
      const notificationsData = Array.isArray(response.data) ? response.data : response.data.notifications || [];

      const formattedNotifications = notificationsData.map((notification: any) => {
        const user = notification.orderId?.userId;
        const service = notification.orderId?.serviceId;

        return {
          _id: notification._id, // Include the notification ID
          orderId: notification.orderId?._id,
          message: notification.message,
          isRead: notification.isRead || false, // Include read status
          createdAt: notification.createdAt,
          order: {
            _id: notification.orderId?._id,
            serviceName: service?.serviceName || notification.message.split(":")[1]?.trim() || "Unknown Service",
            quantity: notification.orderId?.quantity || 1,
            userName: user
              ? `${user.firstname} ${user.lastname}`
              : "Unknown Customer",
          },
        };
      });

      setNotifications(formattedNotifications);
      console.log("Formatted vendor notifications:", formattedNotifications);
    } catch (error) {
      console.error("Error fetching vendor notifications:", error);
    }
  }
};

  
  //fetch notification for customer
  const fetchUserNotifications = async () => {
  const userId = localStorage.getItem("userId"); // this should be the ID of the customer
  if (userId) {
    try {
      console.log("Fetching customer notifications for userId:", userId);
      const response = await axios.get(`${baseUrl}/orders/notifications/user/${userId}`);
      
      // Handle new response format { notifications: [...] }
      const notificationsData = response.data.notifications || response.data || [];
      console.log("Raw customer notification response:", response.data);
      
      const formattedNotifications = notificationsData.map((notification: any) => ({
        _id: notification._id, // Include the notification ID
        orderId: notification.orderId?._id,
        message: notification.message,
        isRead: notification.isRead || false, // Include read status
        createdAt: notification.createdAt,
        order: {
          _id: notification.orderId?._id,
          serviceName: notification.orderId?.serviceId?.serviceName || notification.message.split(":")[1]?.trim() || '',
          quantity: notification.orderId?.quantity || 1,
          vendorName: "Service Provider",
        },
      }));
      setNotifications(formattedNotifications);
      console.log("Formatted customer notifications:", formattedNotifications);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
    }
  }
};

  const handleNotificationClick = async (notification: Notification) => {
  // Mark notification as read if it's unread
  if (!notification.isRead && notification._id) {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${baseUrl}/orders/notifications/${notification._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // For vendors, just close the dropdown - no modal popup
  if (userRole === "vendor") {
    setShowDropdown(false);
    // Optionally redirect to notifications page to see all details
    // window.location.href = '/notification';
  } else {
    // For customers, redirect to notifications page for payment actions
    window.location.href = '/notification';
  }
};

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Fetch user profile data
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      try {
        // Use appropriate endpoint based on user role
        const endpoint = userRole === 'admin' ? '/api/adminProfile' : '/api/profile';
        const response = await axios.get(
          `${baseUrl}${endpoint}`, 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
  }, [userRole]);

  // useEffect(() => {
  //   fetchNotifications();
  //   fetchUserData();
  //   fetchVendorOrders();
  //   fetchUserNotifications()
  // }, [serviceOwnerId]);

  useEffect(() => {
    fetchUserData();

    if (userRole === "vendor") {
      setIsVendor(true);
      fetchNotifications(); // vendor
      fetchVendorOrders();
    } else if (userRole === "customer") {
      setIsVendor(false);
      fetchUserNotifications(); // customer
    } else if (userRole === "admin") {
      setIsVendor(false);
      // Admins don't need order notifications for now
      // Can be extended later if needed
    }
}, [userRole, serviceOwnerId, fetchUserData]);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    router.push('/sign-in');
  }, [router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  console.log("Fetching notifications for serviceOwnerId:", serviceOwnerId);

  return (
    <header className={styles.layout_header}>
      {/* Enhanced Search Section */}
      <div className={`${styles.searchbox} ${isSearchFocused ? styles.focused : ''}`}>
        <div className={styles.search_input_wrapper}>
          <IoSearchOutline size={20} className={styles.search_icon} />
          <input 
            ref={searchRef}
            placeholder="Search services, orders, or anything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className={styles.search_input}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className={styles.clear_search}
              aria-label="Clear search"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
        
        {/* Search Suggestions Dropdown */}
        {isSearchFocused && (
          <div className={styles.search_suggestions}>
            <div className={styles.suggestions_header}>
              <span>Quick Actions</span>
            </div>
            <div className={styles.suggestion_item}>
              <Link href="/servicelist">
                <MdShoppingCart size={16} />
                <span>Browse Services</span>
              </Link>
            </div>
            <div className={styles.suggestion_item}>
              <Link href="/orders">
                <FaFirstOrder size={16} />
                <span>My Orders</span>
              </Link>
            </div>
            <div className={styles.suggestion_item}>
              <Link href="/ordertracking">
                <MdTrackChanges size={16} />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Action Buttons Section */}
      <div className={styles.header_actions}>
        {/* Notifications */}
        <div className={styles.notification_wrapper} ref={notificationRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`${styles.notificationButton} ${notifications.length > 0 ? styles.hasNotifications : ''}`}
            aria-label="Notifications"
          >
            {notifications.length > 0 ? (
              <TbBellRinging size={24} className={styles.notification_icon_active} />
            ) : (
              <TbBell size={24} className={styles.notification_icon} />
            )}
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className={styles.badge}>{notifications.filter(n => !n.isRead).length}</span>
            )}
          </button>

          {/* Enhanced Notification Dropdown */}
          {showDropdown && (
            <>
              <div className={styles.dropdown_overlay} onClick={() => setShowDropdown(false)} />
              <div className={styles.notificationDropdown}>
                <div className={styles.notification_header}>
                  <h3>Notifications</h3>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className={styles.notification_count}>{notifications.filter(n => !n.isRead).length} new</span>
                  )}
                </div>
                <div className={styles.notification_list}>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={styles.notificationItem}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={styles.notification_icon_wrapper}>
                          <FaFirstOrder size={16} />
                        </div>
                        <div className={styles.notification_content}>
                          <p className={styles.notification_message}>{notification.message}</p>
                          <span className={styles.notification_time}>Just now</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noNotifications}>
                      <TbBell size={32} className={styles.empty_icon} />
                      <p>No new notifications</p>
                      <span>You&apos;re all caught up!</span>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className={styles.notification_footer}>
                    <Link href="/notification" className={styles.view_all}>
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className={styles.profile_wrapper} ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={styles.profile_button}
            aria-label="Profile menu"
          >
            <ProfileAvatar
              src={profile.profileImage}
              firstname={profile.firstname}
              lastname={profile.lastname}
              width={36}
              height={36}
              className={styles.profileimg}
            />
            <div className={styles.profile_info}>
              <span className={styles.profile_name}>
                {profile.firstname ? `${profile.firstname} ${profile.lastname}` : 'User'}
              </span>
              <span className={styles.profile_role}>
                {userRole === 'admin' ? 'Administrator' : userRole === 'vendor' ? 'Service Provider' : 'Customer'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div className={styles.dropdown_overlay} onClick={() => setShowProfileMenu(false)} />
              <div className={styles.profile_dropdown}>
                <div className={styles.profile_header}>
                  <div className={styles.profile_avatar}>
                    <ProfileAvatar
                      src={profile.profileImage}
                      firstname={profile.firstname}
                      lastname={profile.lastname}
                      width={48}
                      height={48}
                      className={styles.profile_dropdown_img}
                    />
                  </div>
                  <div className={styles.profile_details}>
                    <h4>{profile.firstname ? `${profile.firstname} ${profile.lastname}` : 'User Name'}</h4>
                    <p>{profile.email || 'user@example.com'}</p>
                    <span className={styles.role_badge}>
                      {userRole === 'admin' ? '🛡️ Administrator' : userRole === 'vendor' ? '🏪 Service Provider' : '👤 Customer'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.profile_menu_items}>
                  <Link href="/userprofile" className={styles.profile_menu_item}>
                    <BiUser size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link href="/settings" className={styles.profile_menu_item}>
                    <MdSettings size={18} />
                    <span>Settings</span>
                  </Link>
                  {userRole === 'admin' && (
                    <>
                      <Link href="/admin" className={`${styles.profile_menu_item} ${styles.admin_item}`}>
                        <MdAdminPanelSettings size={18} />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link href="/analytics" className={`${styles.profile_menu_item} ${styles.analytics_item}`}>
                        <MdInsights size={18} />
                        <span>Analytics</span>
                      </Link>
                    </>
                  )}
                  <Link href="/orders" className={styles.profile_menu_item}>
                    <FaFirstOrder size={18} />
                    <span>My Orders</span>
                  </Link>
                  <div className={styles.menu_divider} />
                  <button 
                    onClick={handleLogout}
                    className={`${styles.profile_menu_item} ${styles.logout_item}`}
                  >
                    <MdLogout size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.hamburger} 
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle menu"
        >
          {showMenu ? (
            <GrClose size={20} />
          ) : (
            <GiHamburgerMenu size={24} />
          )}
        </button>
      </div>
      {/* Enhanced Mobile Menu */}
      {showMenu && (
        <>
          <div className={styles.mobile_overlay} onClick={() => setShowMenu(false)} />
          <div className={`${styles.mobileMenu} ${showMenu ? styles.showMenu : ''}`}>
            {/* Mobile Header */}
            <div className={styles.mobile_header}>
              <div className={styles.mobile_profile}>
                <ProfileAvatar
                  src={profile.profileImage}
                  firstname={profile.firstname}
                  lastname={profile.lastname}
                  width={40}
                  height={40}
                  className={styles.mobile_profile_img}
                />
                <div className={styles.mobile_profile_info}>
                  <h4>{profile.firstname ? `${profile.firstname} ${profile.lastname}` : 'User'}</h4>
                  <span>{userRole === 'admin' ? 'Administrator' : userRole === 'vendor' ? 'Service Provider' : 'Customer'}</span>
                </div>
              </div>
              <button 
                className={styles.mobile_close}
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
              >
                <GrClose size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className={styles.mobile_nav}>
              <Link href="/" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                <HiHome size={20} />
                <span>Home</span>
              </Link>
              <Link href="/dashboard" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                <MdDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              
              {/* Admin-specific navigation */}
              {userRole === 'admin' ? (
                <>
                  <Link href="/admin" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <MdAdminPanelSettings size={20} />
                    <span>Admin Panel</span>
                  </Link>
                  <Link href="/analytics" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <MdInsights size={20} />
                    <span>Analytics</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/servicelist" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <MdShoppingCart size={20} />
                    <span>Services</span>
                  </Link>
                  <Link href="/orders" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <FaFirstOrder size={20} />
                    <span>Orders</span>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className={styles.mobile_badge}>{notifications.filter(n => !n.isRead).length}</span>
                    )}
                  </Link>
                  <Link href="/ordertracking" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <MdTrackChanges size={20} />
                    <span>Tracking</span>
                  </Link>
                  <Link href="/transaction" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                    <GrTransaction size={20} />
                    <span>Transaction</span>
                  </Link>
                </>
              )}
              
              <Link href="/userprofile" className={styles.mobile_nav_item} onClick={() => setShowMenu(false)}>
                <BiUser size={20} />
                <span>Profile</span>
              </Link>
            </nav>

            {/* Mobile Footer */}
            <div className={styles.mobile_footer}>
              <button 
                onClick={handleLogout}
                className={styles.mobile_logout}
              >
                <MdLogout size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}


      {/* Modals */}
      {isModalOpen && selectedOrder && (
        isVendor ? (
          <Modal
            order={selectedOrder}
            onClose={handleCloseModal}
            onAction={handleVendorAction}
          />
        ) : (
          <UserPaymentModal
            order={selectedOrder}
            onClose={handleCloseModal}
          />
        )
      )}
    </header>
  );
};

export default Header;
