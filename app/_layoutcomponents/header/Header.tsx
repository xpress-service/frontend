 'use client'
import React, { useState, useEffect } from "react";
import { TbNotification } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import axios from "axios";
import styles from "../../sass/layout/layout.module.scss";
import * as jwt_decode from "jwt-decode";
import { FaFirstOrder } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { GrClose, GrTransaction } from "react-icons/gr";
import Link from "next/link";
import { MdDashboard, MdTrackChanges } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import { BiUser } from "react-icons/bi";
import { useSearch } from "../searchContext";
import { CgShoppingCart } from "react-icons/cg";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Modal Component
interface Order {
  _id: string;
  serviceName: string;
  quantity: number;
  userName: string;
}

interface ModalProps {
  order: Order | null;
  onClose: () => void;
  onAction: (orderId: string, status: string) => void;
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
        <p>User: {order.userName}</p>
        <div className={styles.modalActions}>
          <button onClick={() => handleAction("Approved")}>Accept</button>
          <button onClick={() => handleAction("Rejected")}>Reject</button>
        </div>
        <button className={styles.closeModal} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


interface Order {
  _id: string;
  serviceName: string;
  quantity: number;
  userName: string;
}

interface Notification {
  orderId: string;
  message: string;
  order: Order; 
}


// Header Component
const Header = ({ serviceOwnerId }: { serviceOwnerId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false); // Toggle for dropdown
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [showMenu, setShowMenu] = useState(false);
   const { searchQuery, setSearchQuery } = useSearch();


    // Fetch vendor's orders
  const fetchVendorOrders = async () => {
    const serviceOwnerId = localStorage.getItem("userId");
    if (serviceOwnerId) {
    try {
      const response = await axios.get(
        `${baseUrl}/orders/vendor/${serviceOwnerId}`,
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
        const response = await axios.get(
          `${baseUrl}/orders/notifications/${serviceOwnerId}`,
        );
        const formattedNotifications = response.data.map((notification: any) => ({
          orderId: notification.orderId._id,
          message: notification.message,
          order: {
            _id: notification.orderId._id,
            serviceName: notification.message.split(":")[1].trim(),
            quantity: 1,
            userName: "Unknown",
          },
        }));
        setNotifications(formattedNotifications);
        console.log("Notifications:", formattedNotifications); 
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };
  

  // Open modal with the selected order
  const handleNotificationClick = (notification: Notification) => {
    setSelectedOrder(notification.order);
    setIsModalOpen(true);
    setShowDropdown(false);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Fetch user profile data
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      try {
        const response = await axios.get(
          `${baseUrl}/profile`, 
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
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserData();
    fetchVendorOrders();
  }, [serviceOwnerId]);

  return (
    <div className={styles.layout_header}>
      <div className={styles.searchbox}>
        <CiSearch size={24} />
        <input placeholder="Search..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Hamburger Icon - Mobile Only */}
      <div className={styles.hamburger} onClick={() => setShowMenu(!showMenu)}>
  {showMenu ? (
    <GrClose size={18} />
  ) : (
    <GiHamburgerMenu size={24} style={{ marginRight: '6px' }} />
  )}
</div>
{/* Mobile Menu */}
      {showMenu && (
        <div className={`${styles.mobileMenu} ${showMenu ? styles.showMenu : ''}`}>
                    <div className={styles.userbox_mobile}>
        {/* Notification Icon */}
        <button
          onClick={() => setShowDropdown((prev) => !prev)} // Toggle dropdown
          className={styles.notificationButton}
        >
          <TbNotification size={12} />
          {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
        </button>

    
        {/* Notification Dropdown */}
        {showDropdown && (
          <div className={styles.notificationDropdown}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.orderId}
                  className={styles.notificationItem}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>{notification.message}</p>
                </div>
              ))
            ) : (
              <p className={styles.noNotifications}>No notifications</p>
            )}
          </div>
        )}

        {/* Profile Image */}
        <Image
          src={profile.profileImage}
          alt="Profile"
          width={30}
          height={30}
          className={styles.profileimg}
        />
      </div>
          <Link href="/">
          <HiHome size={16}/> Home</Link>
          <Link href="/dashboard">
          <MdDashboard size={16}/> Dashboard</Link>
          <Link href="/servicelist">
          <CgShoppingCart size={16}/> Services</Link>
          <Link href="/orders">
          <FaFirstOrder size={16}/> Orders</Link>
          <Link href="/ordertracking">
          <MdTrackChanges size={16}/> Tracking</Link>
          <Link href="/transaction">
          <GrTransaction size={16} /> Transaction</Link>
          <Link href="/userprofile">
          <BiUser size={16}/> Profile</Link>
        </div>
      )}
      <div className={styles.userbox}>
        {/* Notification Icon */}
        <button
          onClick={() => setShowDropdown((prev) => !prev)} // Toggle dropdown
          className={styles.notificationButton}
        >
          <TbNotification size={26} />
          {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
        </button>

    
        {/* Notification Dropdown */}
        {showDropdown && (
          <div className={styles.notificationDropdown}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.orderId}
                  className={styles.notificationItem}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>{notification.message}</p>
                </div>
              ))
            ) : (
              <p className={styles.noNotifications}>No notifications</p>
            )}
          </div>
        )}

        {/* Profile Image */}
        <Image
          src={profile.profileImage}
          alt="Profile"
          width={30}
          height={30}
          className={styles.profileimg}
        />
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <Modal order={selectedOrder} onClose={handleCloseModal} onAction={() => {}} />
      )}
    </div>
  );
};

export default Header;
