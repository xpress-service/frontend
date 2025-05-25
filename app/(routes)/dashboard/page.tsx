'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import styles from "../../sass/layout/dashboard.module.scss";
import axios from 'axios';
import { useSearch } from "../../_layoutcomponents/searchContext";


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

const Dashboard = ({ serviceOwnerId }: any) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
    const { searchQuery } = useSearch();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    } else {
      fetchVendorOrders();
    }
  }, [isAuthenticated]);

  const fetchVendorOrders = async () => {
    const serviceOwnerId = localStorage.getItem('userId');
    if (serviceOwnerId) {
      try {
        const response = await axios.get(
          `https://backend-production-d818.up.railway.app/api/orders/vendor/${serviceOwnerId}`,
          // `http://localhost:5000/api/orders/vendor/${serviceOwnerId}`,
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

  const calculateProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '0%';
      case 'approved':
        return '50%';
      case 'completed':  
        return '100%';
      case 'rejected':
        return '0%';
      default:
        return '0%';
    }
  };

 const filteredOrders = orders.filter((order) =>
  order?.serviceId?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
);
  return (
  
      <div className={styles.dashboard_container}>
        <div className={styles.order_wrapper}>
          {(searchQuery ? filteredOrders : orders).map((order, id) => {
            const progress = calculateProgress(order.status);
            return (
              <div key={id} className={styles.order_container}>
                <div>
                  <p className={styles.item_name}>Order {orders.indexOf(order) + 1}</p>
                  <p className={styles.item_name}>Task: {order.serviceId.serviceName}</p>
                </div>
                <div>
                  <p>{progress}</p>
                  <div className={styles.progressbar}>
                     <div
                      style={{
                        width: progress,
                        background: order.status === 'approved' ? 'green' : 'gray',
                        height: '2px',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease-in-out'
                      }}
                    />
                  </div>
                </div>
                <button>View</button>
              </div>
            );
          })}
        </div>

        <div className={styles.orderDetails}>
          <h3>ORDER DETAILS</h3>
         {orders.map((item, id) => {
            let statusClass = "";
            switch (item.status) {
              case "approved":
                statusClass = styles.statusApproved; // Define this class in your CSS
                break;
              case "pending":
                statusClass = styles.statusPending;
                break;
              case "rejected":
                statusClass = styles.statusRejected; // Or statusCanceled if preferred
                break;
              default:
                statusClass = "";
            }

            const fullName = `${item.userId.firstname} ${item.userId.lastname}`;


            return (
              <div key={id} className={styles.details_wrapper}>
                <div className={styles.userbox}>
                 {item.userId?.profileImage ? (
  <Image
    src={item.userId.profileImage}
    alt="Profile"
    width={30}
    height={30}
  />
) : (
  <div style={{ width: 30, height: 30, backgroundColor: '#ccc', borderRadius: '50%' }} />
)}
                  <div>
                    <p className={styles.item_name}>{fullName}</p>
                    <p className={styles.location}>{item.userId.location}</p>
                  </div>
                </div>

                <div className={styles.itembox_container}>
                  <div className={styles.itembox}>
                    <p className={`${styles.status} ${statusClass}`}>{item.status}</p>
                  </div>
                  <div className={styles.itembox}>
                    <p className={styles.item_name}>{item.serviceId.serviceName}</p>
                  </div>
                  <div className={styles.itembox}>
                    <p className={styles.item_name}>${item.serviceId.price}</p>
                  </div>
                  <BsThreeDots className={styles.dots} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
};

export default Dashboard;
