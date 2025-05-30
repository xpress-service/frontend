
'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationHeader from '@/app/_layoutcomponents/header/NotificationHeader';
import styles from '../../sass/transaction/notification.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

type NotificationType = {
    _id: string;
    message: string;
    createdAt: string;
    orderId?: string; // optional if not always present
  };
  
const Notification = () => {
  const [messages, setMessages] = useState<NotificationType[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // or from auth context
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/orders/notifications/${userId}`,
        );
        const data: NotificationType[] = res.data;
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className={styles.notification_container}>
      <div className={styles.notificationbox}>
        <NotificationHeader />
        <div className={styles.noticebox}>
          <p className={styles.notice}>Notifications</p>
          {messages.map((item, id) => (
            <div key={id} className={styles.msg}>
              <p>{item.message}</p>
              <div className={styles.date_time}>
                <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                <p className={styles.notification_time}>{new Date(item.createdAt).toLocaleTimeString()}</p>
              </div>
              {item.message.includes('accepted') && (
                <div>
                  <button onClick={() => handlePayment(item.orderId)}>💳 Pay Online</button>
                  <button onClick={() => alert('Offline payment selected')}>🧾 Pay Offline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const handlePayment = async (orderId:string | undefined) => {
    if (!orderId) {
        console.error('Order ID is missing');
        return;
      }
  try {
    const res = await axios.post(
      'https://backend-production-d818.up.railway.app/api/orders/api/payments/initiate', 
      // 'http://localhost:5000/api/orders/api/payments/initiate',
      { orderId });
    window.location.href = res.data.authorization_url; // Redirect to Paystack
  } catch (err) {
    console.error('Payment error:', err);
    alert('Error starting payment');
  }
};

export default Notification;
