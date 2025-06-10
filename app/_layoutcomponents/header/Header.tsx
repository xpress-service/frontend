 'use client'
import React, { useState, useEffect, FC } from "react";
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
  firstname: string;
   vendorName: string;
}

interface Notification {
  orderId: string;
  message: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false); // Toggle for dropdown
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [showMenu, setShowMenu] = useState(false);
   const { searchQuery, setSearchQuery } = useSearch();
   const [isVendor, setIsVendor] = useState<boolean>(false); 
const [userRole, setUserRole] = useState<string | null>(null);


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
      const response = await axios.get(
        `${baseUrl}/orders/notifications/${serviceOwnerId}`
      );

      console.log("Raw notification response:", response.data);

      const formattedNotifications = response.data.map((notification: any) => {
        const user = notification.orderId.userId;

        return {
          orderId: notification.orderId._id,
          message: notification.message,
          order: {
            _id: notification.orderId._id,
            serviceName: notification.message.split(":")[1]?.trim(),
            quantity: notification.orderId.quantity,
            userName: user
              ? `${user.firstname} ${user.lastname}`
              : "Unknown",
          },
        };
      });

      setNotifications(formattedNotifications);
      console.log("Formatted notifications:", formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }
};

  
  //fetch notification for customer
  const fetchUserNotifications = async () => {
  const userId = localStorage.getItem("userId"); // this should be the ID of the customer
  if (userId) {
    try {
      const response = await axios.get(`${baseUrl}/orders/notifications/user/${userId}`);
      const formattedNotifications = response.data.map((notification: any) => ({
        orderId: notification.orderId._id,
        message: notification.message,
        order: {
          _id: notification.orderId._id,
          serviceName: notification.message.split(":")[1]?.trim() || '',
          quantity: notification.orderId.quantity,
          vendorName: "Unknown",
        },
      }));
      setNotifications(formattedNotifications);
      console.log("User Notifications:", formattedNotifications);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
    }
  }
};

  const handleNotificationClick = (notification: Notification) => {
  setSelectedOrder(notification.order);
  setIsModalOpen(true);

  if (notification.message.toLowerCase().includes("accepted")) {
    setIsVendor(false);
  } else {
    setIsVendor(true);
  }
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

  // useEffect(() => {
  //   fetchNotifications();
  //   fetchUserData();
  //   fetchVendorOrders();
  //   fetchUserNotifications()
  // }, [serviceOwnerId]);

  useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    const decodedUser: any = jwt_decode.jwtDecode(token);
    const role = decodedUser.role;

    setUserRole(role);
    fetchUserData();

    if (role === "vendor") {
      fetchNotifications(); // vendor
      fetchVendorOrders();
    } else {
      fetchUserNotifications(); // customer
    }
  }
}, [serviceOwnerId]);

console.log("Fetching notifications for serviceOwnerId:", serviceOwnerId);

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
          <TbNotification size={16} />
          {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
        </button>

    
        {/* Notification Dropdown */}
        {showDropdown && (
          <>
           <div className="overlay"></div>
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
          </>
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

    {isModalOpen && selectedOrder && (
  isVendor ? (
    <Modal
      order={selectedOrder}
      onClose={handleCloseModal}
      onAction={handleVendorAction} // You'll need to define this
    />
  ) : (
    <UserPaymentModal
      order={selectedOrder}
      onClose={handleCloseModal}
    />
  )
)}


    </div>
  );
};

export default Header;
