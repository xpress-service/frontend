
'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiBell, FiClock, FiCheckCircle, FiXCircle, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { MdPayment, MdNotifications } from 'react-icons/md';
import Swal from 'sweetalert2';
import styles from '../../sass/transaction/notification.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface NotificationType {
  _id: string;
  message: string;
  createdAt: string;
  orderId?: {
    _id: string;
    serviceId: {
      serviceName: string;
      price: number;
    };
    quantity: number;
    status: string;
    isPaid: boolean;
  };
  notificationType?: string;
  actionRequired?: boolean;
  isRead: boolean;
}
  
const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!userId) return;
    
    setUserRole(role);

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        
        // Use different endpoints based on user role
        const endpoint = role === 'vendor' 
          ? `${baseUrl}/orders/notifications/vendor/${userId}`
          : `${baseUrl}/orders/notifications/user/${userId}`;
        
        const res = await axios.get(
          endpoint,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            }
          }
        );
        
        console.log('Raw notification response:', res.data);
        
        const notificationData = res.data.notifications || res.data;
        console.log('Processed notifications:', notificationData);
        
        setNotifications(Array.isArray(notificationData) ? notificationData : []);
      } catch (err: any) {
        console.error('Failed to fetch notifications', err);
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Failed to load notifications',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handlePayment = async (orderId: string) => {
    if (!orderId) {
      Swal.fire({
        title: 'Error',
        text: 'Order ID is missing',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Show payment method selection
    const { value: paymentMethod } = await Swal.fire({
      title: 'Choose Payment Method',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin-bottom: 15px;">
            <h4>Select how you'd like to pay:</h4>
          </div>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: '💳 Pay Online (Paystack)',
      denyButtonText: '🧾 Pay Offline',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff9b05',
      denyButtonColor: '#6c757d',
      cancelButtonColor: '#dc3545'
    });

    if (paymentMethod === true) {
      // Online payment selected
      await initiateOnlinePayment(orderId);
    } else if (paymentMethod === false) {
      // Offline payment selected
      await selectOfflinePayment(orderId);
    }
  };

  const initiateOnlinePayment = async (orderId: string) => {
    try {
      setPaymentLoading(orderId);
      
      console.log('Initiating payment for order:', orderId);
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${baseUrl}/orders/payments/initiate`,
        { orderId },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment response:', res.data);
      
      if (res.data.authorization_url) {
        // Redirect to Paystack
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error('No authorization URL received from payment gateway');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      Swal.fire({
        title: 'Payment Error',
        text: err.response?.data?.message || 'Failed to initiate payment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ff9b05'
      });
    } finally {
      setPaymentLoading(null);
    }
  };

  const selectOfflinePayment = async (orderId: string) => {
    try {
      const res = await axios.patch(
        `${baseUrl}/orders/payment-method/${orderId}`,
        { method: 'offline' }
      );

      Swal.fire({
        title: 'Offline Payment Selected',
        html: `
          <div style="text-align: left; margin: 16px 0;">
            <p>You have selected offline payment. Please arrange payment with the service provider.</p>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
              <strong>📋 Important:</strong>
              <ul style="margin: 8px 0 0 20px; color: #6c757d;">
                <li>Contact the vendor to arrange payment</li>
                <li>Keep proof of payment for verification</li>
                <li>Payment will be confirmed once received</li>
                <li>Service will begin after payment confirmation</li>
              </ul>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#ff9b05',
        confirmButtonText: 'I Understand'
      });

      // Refresh notifications
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (userId) {
        const notificationRes = await axios.get(
          `${baseUrl}/orders/notifications/user/${userId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            }
          }
        );
        setNotifications(notificationRes.data.notifications || notificationRes.data);
      }
    } catch (err: any) {
      console.error('Error selecting offline payment:', err);
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'Failed to select payment method',
        icon: 'error',
        confirmButtonColor: '#ff9b05'
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${baseUrl}/orders/notifications/${notificationId}`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'order_approved':
        return <FiCheckCircle className={styles.icon_success} />;
      case 'order_rejected':
        return <FiXCircle className={styles.icon_error} />;
      case 'payment_required':
        return <FiCreditCard className={styles.icon_warning} />;
      default:
        return <FiBell className={styles.icon_default} />;
    }
  };

  const getNotificationStyle = (type?: string) => {
    switch (type) {
      case 'order_approved':
        return styles.notification_success;
      case 'order_rejected':
        return styles.notification_error;
      case 'payment_required':
        return styles.notification_warning;
      default:
        return styles.notification_default;
    }
  };

  if (loading) {
    return (
      <div className={styles.notification_container}>
        <div className={styles.loading_container}>
          <div className={styles.spinner}></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.notification_container}>
      <div className={styles.notificationbox}>
        <div className={styles.noticebox}>
          <div className={styles.notice_header}>
            <MdNotifications className={styles.header_icon} />
            <h2>Notifications</h2>
            <span className={styles.count}>{notifications.filter(n => !n.isRead).length} unread</span>
          </div>
          
          {notifications.length === 0 ? (
            <div className={styles.empty_notifications}>
              <FiBell className={styles.empty_icon} />
              <h3>No notifications yet</h3>
              <p>You'll see updates about your orders here</p>
            </div>
          ) : (
            <div className={styles.notifications_list}>
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`${styles.notification_item} ${getNotificationStyle(notification.notificationType)} ${!notification.isRead ? styles.unread : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className={styles.notification_header}>
                    {getNotificationIcon(notification.notificationType)}
                    <div className={styles.notification_content}>
                      <p className={styles.notification_message}>{notification.message}</p>
                      <div className={styles.notification_meta}>
                        <FiClock className={styles.time_icon} />
                        <span className={styles.time}>
                          {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && <div className={styles.unread_dot}></div>}
                  </div>
                  
                  {/* Order Details */}
                  {notification.orderId ? (
                    <div className={styles.order_details}>
                      <div className={styles.service_info}>
                        <h4>
                          {notification.orderId.serviceId?.serviceName || 'Service details not available'}
                        </h4>
                        <div className={styles.order_meta}>
                          <span>Quantity: {notification.orderId.quantity || 1}</span>
                          {notification.orderId.serviceId?.price && (
                            <span className={styles.price}>
                              <FiDollarSign />
                              ${notification.orderId.serviceId.price * (notification.orderId.quantity || 1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    notification.notificationType === 'order_approved' || notification.notificationType === 'order_rejected' ? (
                      <div className={styles.order_details}>
                        <div className={styles.service_info}>
                          <h4>Order details unavailable</h4>
                          <div className={styles.order_meta}>
                            <span>Please contact support if you need more details</span>
                          </div>
                        </div>
                      </div>
                    ) : null
                  )}
                  
                  {/* Payment Action - Only show for customers */}
                  {notification.actionRequired && 
                   notification.notificationType === 'order_approved' && 
                   notification.orderId && 
                   notification.orderId.serviceId &&
                   !notification.orderId.isPaid && 
                   userRole === 'customer' && (
                    <div className={styles.payment_section}>
                      <div className={styles.payment_prompt}>
                        <FiCreditCard className={styles.payment_icon} />
                        <div className={styles.payment_text}>
                          <p><strong>Payment Required</strong></p>
                          <p>Complete your payment to confirm this service booking</p>
                        </div>
                      </div>
                      <div className={styles.action_buttons}>
                        <button 
                          className={styles.pay_online_btn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment(notification.orderId!._id);
                          }}
                          disabled={paymentLoading === notification.orderId._id}
                        >
                          {paymentLoading === notification.orderId._id ? (
                            <>
                              <div className={styles.btn_spinner}></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <MdPayment />
                              <span>Pay Now - ${notification.orderId.serviceId.price * notification.orderId.quantity}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Status */}
                  {notification.orderId?.isPaid && (
                    <div className={styles.paid_status}>
                      <FiCheckCircle className={styles.paid_icon} />
                      <span>✅ Payment Completed Successfully</span>
                    </div>
                  )}
                  
                  {/* Rejected Order Status */}
                  {notification.notificationType === 'order_rejected' && (
                    <div className={styles.rejected_status}>
                      <FiXCircle className={styles.rejected_icon} />
                      <span>❌ Order Rejected - No payment required</span>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
