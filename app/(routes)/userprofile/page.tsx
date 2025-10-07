'use client'
import React, {useState, useEffect} from "react";
import Image from "next/image";
import { MdEdit, MdLocationOn, MdVerified } from "react-icons/md";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";
import { BsThreeDots, BsCalendar3 } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import styles from "../../sass/userprofile/userprofile.module.scss";
import { getProfileImageProps } from "../../utils/imageUtils";
import * as jwt_decode from "jwt-decode";
import axios from 'axios';
import Link from "next/link";
import ProfileAvatar from "../../_components/ProfileAvatar";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Use existing default image from public/users folder
const fallbackImage = '/users/Ellipse 24.svg';

interface Order {
  _id: string;
  serviceId: {
    serviceName: string;
    price: number;
  };
  quantity: number;
  status: string;
  userId?: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
    profileImage?: string | null;
    profilePicture?: string | null;
    image?: string | null;
  };
  user?: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
    profileImage?: string | null;
    profilePicture?: string | null;
    image?: string | null;
  };
  serviceProvider?: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
    profileImage?: string | null;
    profilePicture?: string | null;
    image?: string | null;
  };
}

const UserProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [order, setOrder] = useState<any>({ Approved: 0, Pending: 0, Rejected: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [orderCounts, setOrderCounts] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0,
    total: 0
  });
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Helper function to handle image error
  const handleImageError = (orderId: string) => {
    setFailedImages(prev => new Set(prev).add(orderId));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);  
      if (token) {
        try {
          const response = await axios.get(
            `${baseUrl}/profile`, 
            {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200){
            console.log('Full profile response:', response);
            console.log('Profile response.data:', response.data);
            console.log('Profile response.data keys:', Object.keys(response.data || {}));
            
            // Handle different response structures
            let profileData = response.data;
            
            // Check for nested user data
            if (response.data.user) {
              profileData = response.data.user;
            } else if (response.data.profile) {
              profileData = response.data.profile;
            } else if (response.data.data) {
              profileData = response.data.data;
            }
            
            console.log('Profile loaded successfully');
            setProfile(profileData || {});
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Set empty profile to avoid "not provided" messages
          setProfile({});
        }
      } else {
        console.log("No token found");
        setProfile({});
      }
    };


    const fetchOrderSummary = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Try to fetch order summary from a dedicated endpoint
          const response = await axios.get(
            `${baseUrl}/orders/summary`, 
            {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200 && response.data){
            setOrder(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch order summary:", error);
          // Set default order summary
          setOrder({ Approved: 0, Pending: 0, Rejected: 0 });
        }
      } else {
        console.log("No token found for orders");
        setOrder({ Approved: 0, Pending: 0, Rejected: 0 });
      }
    };

    const fetchUserOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Get orders where the current user is the customer
          const response = await axios.get(
            `${baseUrl}/orders/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200 && response.data) {
            const ordersData = response.data.orders || response.data;
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            console.log(`Loaded ${Array.isArray(ordersData) ? ordersData.length : 0} customer orders`);
          }
        } catch (error: unknown) {
          console.error('Error fetching user orders:', error);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchOrderSummary(),
          fetchUserOrders()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate order counts whenever orders array changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Only log once when orders are first loaded or structure changes
      if (orders.length > 0) {
        console.log('Customer orders loaded:', orders.length, 'items');
        console.log('Sample order structure:', {
          id: orders[0]._id,
          status: orders[0].status,
          customerInfo: !!orders[0].userId,
          serviceProviderInfo: !!orders[0].serviceProvider,
          serviceProviderName: orders[0].serviceProvider ? 
            `${orders[0].serviceProvider.firstname} ${orders[0].serviceProvider.lastname}` : 
            'Not available'
        });
      }
      
      const completed = orders.filter(order => 
        order.status?.toLowerCase() === 'completed' || 
        order.status?.toLowerCase() === 'approved'
      ).length;
      
      const pending = orders.filter(order => 
        order.status?.toLowerCase() === 'pending'
      ).length;
      
      const cancelled = orders.filter(order => 
        order.status?.toLowerCase() === 'cancelled' || 
        order.status?.toLowerCase() === 'cancel' || 
        order.status?.toLowerCase() === 'rejected'
      ).length;
      
      setOrderCounts({
        completed,
        pending,
        cancelled,
        total: orders.length
      });
      
      console.log('Order counts:', { completed, pending, cancelled, total: orders.length });
    } else {
      setOrderCounts({ completed: 0, pending: 0, cancelled: 0, total: 0 });
    }
    
    // Reset failed images when orders change (new data might have working images)
    setFailedImages(new Set());
  }, [orders]);

const handleToggleView = () => {
  if (visibleCount >= orders.length) {
    setVisibleCount(10); // Reset back to 10 (View Less)
  } else {
    setVisibleCount(prev => prev + 10); // Show 10 more (View More)
  }
};

  if (loading) {
    return (
      <div className={styles.profile_box}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
      <div className={styles.profile_box}>
        <div className={styles.profile_container}>
          <div className={styles.rightContainer}>
            <ProfileAvatar
              src={profile?.profileImage}
              firstname={profile?.firstname || profile?.firstName}
              lastname={profile?.lastname || profile?.lastName}
              width={120}
              height={120}
              className={styles.profileimg}
            />
            <h2 className={styles.usercode}>{profile?.usercode || profile?.userCode || "USER001"}</h2>
            <p>{profile ? `${profile.firstname || profile.firstName || "User"} ${profile.lastname || profile.lastName || "Name"}` : "Loading..."}</p>
            <p>
              <FiCalendar className="inline-icon" />
              Joined: {profile?.dateJoined ? new Date(profile.dateJoined).toLocaleDateString() : (profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A")}
            </p>
          </div>
          
          <div className={styles.leftContainer}>
            <div className={styles.Basic}>
              <h3 className={styles.basic_info}>Basic Information</h3>
              <Link href="/userprofile/complete-profile" className={styles.edit_btn}>
                <MdEdit size={16} />
                Edit Profile
              </Link>
            </div>
            
            <div className={styles.info}>
              <div className={styles.info_item}>
                <div className={styles.heading}>
                  <FiMail className="inline-icon" />
                  Email Address
                </div>
                <p>{profile?.email || profile?.emailAddress || (profile ? "Not provided" : "Loading...")}</p>
                {(profile?.email || profile?.emailAddress) && <span className={styles.verified}>Verified</span>}
              </div>

              <div className={styles.info_item}>
                <div className={styles.heading}>
                  <FiUser className="inline-icon" />
                  NIN
                </div>
                <p>{profile?.nin || profile?.NIN || (profile ? "Not provided" : "Loading...")}</p>
              </div>

              <div className={styles.info_item}>
                <div className={styles.heading}>
                  <FiPhone className="inline-icon" />
                  Mobile Number
                </div>
                <p>{profile?.phone || profile?.phoneNumber || profile?.mobile || (profile ? "Not provided" : "Loading...")}</p>
              </div>
            </div>
            
            <div className={styles.infobox}>
              <div className={styles.info_item}>
                <div className={styles.heading}>
                  <BsCalendar3 className="inline-icon" />
                  Birthday
                </div>
                <p>{profile?.birthdate || profile?.dateOfBirth || profile?.birthday || (profile ? "Not provided" : "Loading...")}</p>
              </div>
              
              <div className={styles.locationbox}>
                <MdLocationOn className={styles.location_icon} />
                <span className={styles.location_text}>
                  {profile?.location || profile?.address || profile?.city || (profile ? "Location not set" : "Loading...")}
                </span>
              </div>
              
              <div className={styles.info_item}>
                <div className={styles.heading}>
                  <FiUser className="inline-icon" />
                  Gender
                </div>
                <p>{profile?.gender || (profile ? "Not specified" : "Loading...")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.orderContainer}>
          <h3 className={styles.name}>Order Summary & History</h3>
          
          <div className={styles.summary}>
            <div className={styles.statusbox}>
              <p>Completed</p>
              <p>{orderCounts.completed}</p>
            </div>
            <div className={styles.statusbox}>
              <p>Pending</p>
              <p>{orderCounts.pending}</p>
            </div>
            <div className={styles.statusbox}>
              <p>Cancelled</p>
              <p>{orderCounts.cancelled}</p>
            </div>
            <div className={styles.statusbox}>
              <p>Total Orders</p>
              <p>{orderCounts.total}</p>
            </div>
          </div>

          {orders.length > 0 ? (
            <>
              {orders.slice(0, visibleCount).map((item, id) => {
                let statusClass = "";
                const status = item.status?.toLowerCase();
                
                switch (status) {
                  case "completed":
                  case "approved":
                    statusClass = styles.statusCompleted;
                    break;
                  case "pending":
                    statusClass = styles.statusPending;
                    break;
                  case "cancel":
                  case "cancelled":
                  case "rejected":
                    statusClass = styles.statusCanceled;
                    break;
                  default:
                    statusClass = "";
                    // Only log unknown statuses once per session
                    if (!sessionStorage.getItem(`unknown-status-${item.status}`)) {
                      console.log(`Unknown order status: "${item.status}"`);
                      sessionStorage.setItem(`unknown-status-${item.status}`, 'logged');
                    }
                }
                
                return (
                  <div key={id} className={styles.userOrderbox}>
                    <div className={styles.imgContainer}>
                      <ProfileAvatar
                        src={item.serviceProvider?.profileImage}
                        firstname={item.serviceProvider?.firstname}
                        lastname={item.serviceProvider?.lastname}
                        width={48}
                        height={48}
                      />
                      <div>
                        <p>{
                          item.serviceProvider ? 
                          `${item.serviceProvider.firstname} ${item.serviceProvider.lastname}` : 
                          'Service Provider'
                        }</p>
                        <p className={styles.location_text}>{
                          item.serviceProvider?.location || 'Location not available'
                        }</p>
                      </div>
                    </div>
                    
                    <div className={styles.orders_info_box}>
                      <span className={`${styles.status} ${statusClass}`}>
                        {item.status}
                      </span>
                      <p>{item.serviceId.serviceName}</p>
                      <p className="price">${item.serviceId.price}</p>
                      <SlOptionsVertical size={16} />
                    </div>
                  </div>
                );
              })}
              
              <div className={styles.viewbox}>
                {orders.length > 10 && (
                  <button onClick={handleToggleView} className={styles.viewbtn}>
                    {visibleCount >= orders.length ? 'View Less' : 'View More'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="no-orders">
              <p>No orders found</p>
              <p>Start browsing services to place your first order!</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default UserProfile;
