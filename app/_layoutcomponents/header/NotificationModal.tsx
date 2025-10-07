'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import styles from '../../sass/transaction/notification.module.scss'

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  notificationType: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const NotificationModal = () => {
    const { isAuthenticated, userId, userRole } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && userId && userRole) {
            fetchRecentNotifications();
        }
    }, [isAuthenticated, userId, userRole]);

    const fetchRecentNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            // Use role-based endpoints
            const endpoint = userRole === 'vendor' 
                ? `${baseUrl}/orders/notifications/vendor/${userId}`
                : `${baseUrl}/orders/notifications/user/${userId}`;
            
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Filter to show only notifications from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentNotifications = response.data.notifications
                .filter((notif: Notification) => new Date(notif.createdAt) >= sevenDaysAgo)
                .slice(0, 5); // Show only 5 most recent
            
            setNotifications(recentNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.patch(
                `${baseUrl}/orders/notifications/${notificationId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            // Update local state
            setNotifications(prev => 
                prev.map(n => 
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const handleViewAll = () => {
        console.log('Navigating to notifications page');
        
        // Close any open modal or dropdown first
        const modal = document.querySelector('[data-modal="notification"]');
        if (modal) {
            (modal as HTMLElement).style.display = 'none';
        }
        
        // Use setTimeout to ensure smooth navigation
        setTimeout(() => {
            try {
                console.log('Attempting router.push to /notification');
                router.push('/notification');
            } catch (error) {
                console.error('Router navigation failed, using window.location:', error);
                window.location.href = '/notification';
            }
        }, 50);
    };

    return (
        <div className={styles.notice_con} data-modal="notification">  
            <div className={styles.modal}>
                <div className={styles.modal_header}>
                    <p className={styles.notice}>Recent Notifications</p>
                    <small>
                        Last 7 days • 
                        <button 
                            type="button"
                            className={styles.view_all}
                            onClick={handleViewAll}
                        >
                            View All
                        </button>
                    </small>
                </div>
                {loading ? (
                    <div className={styles.loading_state}>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className={styles.empty_state}>
                        <p>No recent notifications</p>
                        <small>New notifications will appear here</small>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        return(
                            <div 
                                key={notification._id} 
                                className={`${styles.msg} ${!notification.isRead ? styles.unread_msg : ''}`}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification._id);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <p>{notification.message}</p>
                                <div className={styles.date_time}>
                                    <p>{formatDate(notification.createdAt)}</p>
                                    <p className={styles.notification_time}>{formatTime(notification.createdAt)}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}

export default NotificationModal