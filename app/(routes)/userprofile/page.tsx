'use client'
import React, {useState, useEffect} from "react";
import Image from "next/image";
import { BiPencil } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import styles from "../../sass/userprofile/userprofile.module.scss";
import { BsThreeDots } from "react-icons/bs";
import * as jwt_decode from "jwt-decode";
import axios from 'axios';
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface Order {
  _id: string;
  serviceId: {
    serviceName: string;
    price: number;
  };
  quantity: number;
  status: string;
  userId: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
    profileImage: string | null;
  };
}

const UserProfile = () => {
  const [profile, setProfile] = useState<any>({});
  const [order, setOrder] = useState<any>([]);
  const [orders, setOrders] = useState<Order[]>([])
   const [visibleCount, setVisibleCount] = useState(10);

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
          if (response.status === 200){
            console.log('This is my response:', response)
            setProfile(response.data)
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      } else {
        console.log("No token found");
      }
    };


    const fetchOrderData = async (orderId: string) => {
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
          if (response.status === 200){
            console.log('This is my response:', response)
            setOrder(response.data)
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      } else {
        console.log("No token found");
      }
    };

    const fetchVendorOrders = async () => {
    const serviceOwnerId = localStorage.getItem('userId');
    if (serviceOwnerId) {
      try {
        const response = await axios.get(
          `${baseUrl}/orders/vendor/${serviceOwnerId}`,
        );
        setOrders(response.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching orders:', error.message);
        } else {
          console.error('Unknown error occurred while fetching orders.');
        }
      }
    }
  };
    fetchVendorOrders()
    fetchUserData();
    fetchOrderData(order);
  }, []);

const handleToggleView = () => {
  if (visibleCount >= orders.length) {
    setVisibleCount(10); // Reset back to 10 (View Less)
  } else {
    setVisibleCount(prev => prev + 10); // Show 10 more (View More)
  }
};

  return (
      <div className={styles.profile_box}>
      <div className={styles.profile_container}>
        <div className={styles.rightContainer}>
          <Image src={profile?.profileImage} alt="img" width={80} height={70} className={styles.profileimg}/>
          <p className={styles.name}>{`${profile?.firstname} ${profile?.lastname}`}</p>
          <p className={styles.usercode}>{profile?.usercode}</p>
          <p>Joined: {new Date(profile?.dateJoined).toLocaleDateString()}</p>
        </div>
        <div className={styles.leftContainer}>
          <div className={styles.Basic}>
            <p  className={styles.basic_info}>Basic Info</p>
            <Link href="/userprofile/complete-profile">
            <BiPencil size={12} />
            </Link>
          </div>
          <div className={styles.info}>
            <div>
              <p className={styles.heading}>Email</p>
              <p>{profile?.email}</p>
              <p className={styles.verified}>verified</p>
            </div>

            <div>
              <p className={styles.heading}>NIN</p>
              <p>{profile?.nin}</p>
            </div>

            <div>
              <p className={styles.heading}>Mobile Number</p>
              <p>{profile?.phone}</p>
            </div>
          </div>
          <div className={styles.infobox}>
            <div>
              <p className={styles.heading}>Birthday</p>
              <p>{profile?.birthdate}</p>
            </div>
            <div>
              <p className={styles.heading}>Location</p>
              <p className={styles.locationbox}>
                <GrLocation />
                {profile?.location}
              </p>
            </div>
            <div>
              <p className={styles.heading}>Gender</p>
              <p>{profile?.gender}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.orderContainer}>
          <p className={styles.name}>Your order summary</p>
          <div className={styles.summary}>
            <div className={styles.statusbox}>
            <p className={styles.orderComplete}>Completed</p>
            <p>{order.Approved}</p>
          </div>
          <div className={styles.statusbox}>
            <p className={styles.orderPending}>Pending</p>
            <p>{order.Pending}</p>
          </div>
          <div className={styles.statusbox}>
            <p className={styles.orderCancel}>Cancel</p>
            <p>{order.Rejected}</p>
          </div>
          </div>
        
        {orders.slice(0, visibleCount).map((item, id) => {
           let statusClass = "";
           switch (item.status) {
             case "Completed":
               statusClass = styles.statusCompleted;
               break;
             case "Pending":
               statusClass = styles.statusPending;
               break;
             case "Cancel":
               statusClass = styles.statusCanceled;
               break;
             default:
               statusClass = "";
           }
          return(
            
            <div key={id} className={styles.userOrderbox}>
              <div className={styles.imgContainer}>
              <Image src={item.userId?.profileImage || "/default-profile.png"} alt="img" width={40} height={40}/>
              <div>
                <p>{item.userId.firstname}</p>
                <p className={styles.location_text}>{item.userId.location}</p>
              </div>
              </div>
              <div className={styles.orders_info_box}>
              <p className={`${styles.status} ${statusClass}`}>
                    {item.status}
                  </p>
              <p>{item.serviceId.serviceName}</p>
              <p>${item.serviceId.price}</p>
              <BsThreeDots size={16}/>
              </div>
            </div>
          
          )
        })}
         {/* View More / View Less Button */}
      <div className={styles.viewbox}>
        {orders.length > 10 && (
          <button onClick={handleToggleView} className={styles.viewbtn}>
            {visibleCount >= orders.length ? 'View Less' : 'View More'}
          </button>
        )}
      </div>
      </div>
      </div>
  );
};

export default UserProfile;
