"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MdLocationOn,
  MdTrackChanges,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdAccessTime,
  MdEmail,
  MdPhone,
  MdFeedback,
  MdVisibility,
  MdClose
} from "react-icons/md";
import {
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaThumbsUp,
  FaThumbsDown,
  FaHandPaper
} from "react-icons/fa";
import { BiPackage, BiTime } from "react-icons/bi";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import styles from "./tracking.module.scss";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface Order {
  _id: string;
  serviceId: {
    serviceName: string;
    price?: number;
  };
  quantity: number;
  status: string;
  createdAt?: string;
  userId: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
    profileImage?: string;
  };
}

interface TrackingSteps {
  [key: string]: string;
}

const Tracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingSteps, setTrackingSteps] = useState<TrackingSteps>({});
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: string]: boolean}>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{[key: string]: boolean}>({});

  // Fetch serviceOwnerId and orders
  useEffect(() => {
    const storedServiceOwnerId = localStorage.getItem("userId");
    if (storedServiceOwnerId) {
      setServiceOwnerId(storedServiceOwnerId);
    }
  }, []);

  useEffect(() => {
    if (serviceOwnerId) {
      fetchOrders(serviceOwnerId);
    }
  }, [serviceOwnerId]);

  const fetchOrders = async (ownerId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/orders/vendor/${ownerId}`,
      );
      setOrders(response.data);
      // Fetch tracking for each order
      await Promise.all(
        response.data.map((order: Order) => fetchTracking(order._id))
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (orderId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/orders/tracking/order/${orderId}`,
      );
  
      if (response.status === 200) {
        const orderStatus = response.data?.status || "Pending";
        setTrackingSteps((prev) => ({
          ...prev,
          [orderId]: orderStatus,
        }));
      }
    } catch (error) {
      console.error("Error fetching tracking status:", error);
      // Set default status if tracking fails
      setTrackingSteps((prev) => ({
        ...prev,
        [orderId]: "Pending",
      }));
    }
  };  

  // Helper functions
  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'accepted':
      case 'approved':
        return 33;
      case 'in progress':
      case 'in_progress':
        return 66;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const progress = getProgressPercentage(currentStatus);
    const stepProgress = (stepIndex + 1) * 33.33;
    
    if (progress >= stepProgress) return 'completed';
    if (progress >= stepProgress - 33.33 && progress < stepProgress) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock />;
      case 'accepted':
      case 'approved':
        return <FaCheckCircle />;
      case 'in progress':
      case 'in_progress':
        return <FaShippingFast />;
      case 'completed':
        return <HiOutlineClipboardCheck />;
      default:
        return <FaClock />;
    }
  };

  const handleFeedback = (orderId: string, feedback: 'positive' | 'negative' | 'neutral') => {
    setFeedbackSubmitted(prev => ({ ...prev, [orderId]: true }));
    // Here you would typically send the feedback to your backend
    console.log(`Feedback for order ${orderId}: ${feedback}`);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => trackingSteps[o._id] === 'Pending').length;
    const inProgress = orders.filter(o => ['Accepted', 'In Progress'].includes(trackingSteps[o._id])).length;
    const completed = orders.filter(o => trackingSteps[o._id] === 'Completed').length;
    return { total, pending, inProgress, completed };
  };

  // Update order status functionality
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      // First, get the tracking record for this order
      const trackingResponse = await axios.get(
        `${baseUrl}/orders/tracking/order/${orderId}`
      );
      
      if (trackingResponse.data && trackingResponse.data.trackingId) {
        // Update tracking status
        await axios.patch(
          `${baseUrl}/orders/tracking/${trackingResponse.data.trackingId}`,
          { status: newStatus }
        );
        
        // Update local state
        setTrackingSteps(prev => ({
          ...prev,
          [orderId]: newStatus
        }));
        
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Contact customer functions
  const handleContactCustomer = (order: Order, method: 'phone' | 'email' | 'message') => {
    setSelectedOrder(order);
    
    switch (method) {
      case 'phone':
        if (order.userId.phone) {
          window.open(`tel:${order.userId.phone}`);
        } else {
          alert('Customer phone number not available');
        }
        break;
      case 'email':
        if (order.userId.email) {
          const subject = `Regarding Order #${order._id.slice(-8).toUpperCase()}`;
          const body = `Dear ${order.userId.firstname},\n\nI hope this message finds you well. I am reaching out regarding your recent order for ${order.serviceId.serviceName}.\n\nBest regards,\nServiceXpress Team`;
          window.open(`mailto:${order.userId.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        } else {
          alert('Customer email not available');
        }
        break;
      case 'message':
        setShowContactModal(true);
        break;
    }
  };

  // View order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Get next possible status
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return 'Accepted';
      case 'accepted':
        return 'In Progress';
      case 'in progress':
      case 'in_progress':
        return 'Completed';
      default:
        return null;
    }
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading tracking information...</p>
      </div>
    );
  }

  return (
    <div className={styles.tracking_page}>
      {/* Tracking Header */}
      <div className={styles.page_header}>
        <div className={styles.header_content}>
          <h1 className={styles.page_title}>
            <MdTrackChanges className={styles.title_icon} />
            Order Tracking
          </h1>
          <p className={styles.page_subtitle}>
            Monitor the progress of your service orders in real-time
          </p>
          <div className={styles.stats_bar}>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{stats.total}</span>
              <span className={styles.stat_label}>Total Orders</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{stats.pending}</span>
              <span className={styles.stat_label}>Pending</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{stats.inProgress}</span>
              <span className={styles.stat_label}>In Progress</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{stats.completed}</span>
              <span className={styles.stat_label}>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Content */}
      <div className={styles.tracking_content}>
        {orders.length === 0 ? (
          <div className={styles.empty_state}>
            <BiPackage className={styles.empty_icon} />
            <h3>No orders to track</h3>
            <p>You don't have any orders to track at the moment.</p>
          </div>
        ) : (
          <div className={styles.tracking_grid}>
            {orders.map((order, index) => {
              const currentStatus = trackingSteps[order._id] || 'Pending';
              const progressPercentage = getProgressPercentage(currentStatus);
              const stepDefinitions = [
                { label: 'Accepted', icon: <FaCheckCircle />, time: '10:30 AM' },
                { label: 'In Progress', icon: <FaShippingFast />, time: '2:15 PM' },
                { label: 'Completed', icon: <HiOutlineClipboardCheck />, time: 'Pending' }
              ];

              return (
                <div key={order._id} className={styles.tracking_card}>
                  {/* Order Header */}
                  <div className={styles.order_header}>
                    <div className={styles.order_info}>
                      <h2 className={styles.order_title}>
                        <BiPackage />
                        Order #{index + 1}
                      </h2>
                      <div className={styles.service_name}>
                        {order.serviceId?.serviceName || 'N/A'}
                      </div>
                      <div className={styles.order_details}>
                        <div className={styles.detail_item}>
                          <FaUser />
                          <span>{order.userId?.firstname} {order.userId?.lastname}</span>
                        </div>
                        <div className={styles.detail_item}>
                          <MdLocationOn />
                          <span>{order.userId?.location || 'N/A'}</span>
                        </div>
                        <div className={styles.detail_item}>
                          <BiPackage />
                          <span>Quantity: {order.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.order_meta}>
                      <div className={styles.tracking_id}>
                        <span className={styles.id_label}>ID:</span>
                        {order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className={`${styles.order_status} ${styles[currentStatus.toLowerCase().replace(' ', '_')]}`}>
                        {getStatusIcon(currentStatus)}
                        <span>{currentStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className={styles.progress_section}>
                    <div className={styles.progress_header}>
                      <h3>Progress Timeline</h3>
                      <span className={styles.progress_percentage}>{progressPercentage}%</span>
                    </div>
                    
                    <div className={styles.progress_container}>
                      <div className={styles.progress_bar}>
                        <div 
                          className={styles.progress_fill} 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      
                      <div className={styles.progress_steps}>
                        {stepDefinitions.map((step, stepIndex) => {
                          const stepStatus = getStepStatus(stepIndex, currentStatus);
                          return (
                            <div key={stepIndex} className={styles.progress_step}>
                              <div className={`${styles.step_circle} ${styles[stepStatus]}`}>
                                {step.icon}
                              </div>
                              <div className={`${styles.step_label} ${styles[stepStatus]}`}>
                                {step.label}
                              </div>
                              <div className={`${styles.step_time} ${styles[stepStatus]}`}>
                                {stepStatus === 'completed' ? step.time : 'Pending'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Customer Feedback Section */}
                  <div className={styles.feedback_section}>
                    <div className={styles.feedback_header}>
                      <MdFeedback className={styles.feedback_icon} />
                      <h4>Service Feedback</h4>
                    </div>
                    <p className={styles.feedback_question}>
                      How would you rate this order experience?
                    </p>
                    
                    {!feedbackSubmitted[order._id] ? (
                      <div className={styles.feedback_actions}>
                        <button
                          className={`${styles.feedback_btn} ${styles.positive}`}
                          onClick={() => handleFeedback(order._id, 'positive')}
                        >
                          <FaThumbsUp />
                          Excellent
                        </button>
                        <button
                          className={`${styles.feedback_btn} ${styles.neutral}`}
                          onClick={() => handleFeedback(order._id, 'neutral')}
                        >
                          <FaHandPaper />
                          Good
                        </button>
                        <button
                          className={`${styles.feedback_btn} ${styles.negative}`}
                          onClick={() => handleFeedback(order._id, 'negative')}
                        >
                          <FaThumbsDown />
                          Needs Improvement
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>
                        ✓ Thank you for your feedback!
                      </div>
                    )}
                  </div>

                  {/* Status Update Section */}
                  {getNextStatus(currentStatus) && (
                    <div className={styles.status_update}>
                      <p className={styles.status_text}>
                        Ready to move to next stage?
                      </p>
                      <button
                        className={`${styles.status_btn} ${styles.next_status}`}
                        onClick={() => updateOrderStatus(order._id, getNextStatus(currentStatus)!)}
                        disabled={updatingStatus[order._id]}
                      >
                        {updatingStatus[order._id] ? (
                          <div className={styles.mini_spinner}></div>
                        ) : (
                          <>
                            <MdCheckCircle />
                            Mark as {getNextStatus(currentStatus)}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={styles.action_buttons}>
                    <button 
                      className={`${styles.action_btn} ${styles.primary}`}
                      onClick={() => handleViewDetails(order)}
                    >
                      <MdVisibility />
                      View Details
                    </button>
                    <button 
                      className={`${styles.action_btn} ${styles.secondary}`}
                      onClick={() => handleContactCustomer(order, 'phone')}
                    >
                      <MdPhone />
                      Call Customer
                    </button>
                    <button 
                      className={`${styles.action_btn} ${styles.secondary}`}
                      onClick={() => handleContactCustomer(order, 'email')}
                    >
                      <MdEmail />
                      Email Customer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className={styles.modal_overlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>Order Details</h2>
              <button 
                className={styles.close_btn}
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modal_body}>
              <div className={styles.details_grid}>
                <div className={styles.detail_section}>
                  <h3>Order Information</h3>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Order ID:</span>
                    <span className={styles.value}>{selectedOrder._id}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Service:</span>
                    <span className={styles.value}>{selectedOrder.serviceId.serviceName}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Quantity:</span>
                    <span className={styles.value}>{selectedOrder.quantity}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${styles.status}`}>
                      {trackingSteps[selectedOrder._id] || 'Pending'}
                    </span>
                  </div>
                  {selectedOrder.serviceId.price && (
                    <div className={styles.detail_row}>
                      <span className={styles.label}>Price:</span>
                      <span className={styles.value}>₦{selectedOrder.serviceId.price}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.detail_section}>
                  <h3>Customer Information</h3>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Name:</span>
                    <span className={styles.value}>
                      {selectedOrder.userId.firstname} {selectedOrder.userId.lastname}
                    </span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>{selectedOrder.userId.email}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>{selectedOrder.userId.phone}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Location:</span>
                    <span className={styles.value}>{selectedOrder.userId.location}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.modal_actions}>
                <button 
                  className={`${styles.modal_btn} ${styles.primary}`}
                  onClick={() => handleContactCustomer(selectedOrder, 'phone')}
                >
                  <MdPhone /> Call Customer
                </button>
                <button 
                  className={`${styles.modal_btn} ${styles.secondary}`}
                  onClick={() => handleContactCustomer(selectedOrder, 'email')}
                >
                  <MdEmail /> Send Email
                </button>
                <button 
                  className={`${styles.modal_btn} ${styles.tertiary}`}
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleContactCustomer(selectedOrder, 'message');
                  }}
                >
                  <MdFeedback /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedOrder && (
        <div className={styles.modal_overlay} onClick={() => setShowContactModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>Contact Customer</h2>
              <button 
                className={styles.close_btn}
                onClick={() => setShowContactModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modal_body}>
              <div className={styles.contact_info}>
                <h3>{selectedOrder.userId.firstname} {selectedOrder.userId.lastname}</h3>
                <p>Order: {selectedOrder.serviceId.serviceName}</p>
              </div>
              
              <div className={styles.contact_methods}>
                <button 
                  className={`${styles.contact_btn} ${styles.phone}`}
                  onClick={() => {
                    setShowContactModal(false);
                    handleContactCustomer(selectedOrder, 'phone');
                  }}
                >
                  <MdPhone />
                  <div>
                    <span>Call Customer</span>
                    <small>{selectedOrder.userId.phone}</small>
                  </div>
                </button>
                
                <button 
                  className={`${styles.contact_btn} ${styles.email}`}
                  onClick={() => {
                    setShowContactModal(false);
                    handleContactCustomer(selectedOrder, 'email');
                  }}
                >
                  <MdEmail />
                  <div>
                    <span>Send Email</span>
                    <small>{selectedOrder.userId.email}</small>
                  </div>
                </button>
                
                <button 
                  className={`${styles.contact_btn} ${styles.location}`}
                  onClick={() => {
                    const location = encodeURIComponent(selectedOrder.userId.location);
                    window.open(`https://maps.google.com/maps?q=${location}`, '_blank');
                    setShowContactModal(false);
                  }}
                >
                  <MdLocationOn />
                  <div>
                    <span>View Location</span>
                    <small>{selectedOrder.userId.location}</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
