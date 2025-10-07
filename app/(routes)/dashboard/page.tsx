'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from "next/image";
import { 
  MdDashboard, 
  MdTrendingUp, 
  MdPeople, 
  MdClose, 
  MdVisibility,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdEdit,
  MdCheck,
  MdCancel 
} from "react-icons/md";
import { 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaUser,
  FaChartLine 
} from "react-icons/fa";
import { BiPackage, BiTrendingUp } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";
import styles from "./dashboard.module.scss";
import axios from 'axios';
import { useSearch } from "../../_layoutcomponents/searchContext";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface Order {
  _id: string;
  serviceId: {
    serviceName: string;
    price: number;
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
    profileImage: string | null;
  };
}

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '25%';
      case 'approved':
        return '75%';
      case 'completed':  
        return '100%';
      case 'rejected':
        return '0%';
      default:
        return '0%';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock />;
      case 'approved':
        return <FaCheckCircle />;
      case 'completed':
        return <FaCheckCircle />;
      case 'rejected':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#22c55e';
      case 'completed':
        return '#06b6d4';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status.toLowerCase() === 'pending').length;
    const approved = orders.filter(o => o.status.toLowerCase() === 'approved').length;
    const completed = orders.filter(o => o.status.toLowerCase() === 'completed').length;
    return { total, pending, approved, completed };
  };

  // Dropdown action handlers
  const handleViewFullDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleContactCustomer = (order: Order) => {
    const phoneNumber = order.userId.phone.replace(/\D/g, ''); // Remove non-digits
    window.open(`tel:${phoneNumber}`, '_blank');
    setActiveDropdown(null);
  };

  const handleEmailCustomer = (order: Order) => {
    const subject = encodeURIComponent(`Regarding your ${order.serviceId.serviceName} order`);
    const body = encodeURIComponent(`Hello ${order.userId.firstname},\n\nI hope this message finds you well. I'm writing regarding your recent order for ${order.serviceId.serviceName}.\n\nBest regards`);
    window.open(`mailto:${order.userId.email}?subject=${subject}&body=${body}`, '_blank');
    setActiveDropdown(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await axios.patch(`${baseUrl}/orders/${orderId}`, { status: newStatus });
      if (response.status === 200) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
    setActiveDropdown(null);
  };

  const handleViewCustomerLocation = (order: Order) => {
    const location = encodeURIComponent(order.userId.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${location}`, '_blank');
    setActiveDropdown(null);
  };

  const toggleDropdown = (orderId: string) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  const filteredOrders = orders.filter((order) =>
    order?.serviceId?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayOrders = searchQuery ? filteredOrders : orders;
  const stats = getOrderStats();

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard_page}>
      {/* Dashboard Header */}
      <div className={styles.page_header}>
        <div className={styles.header_content}>
          <h1 className={styles.page_title}>
            <MdDashboard className={styles.title_icon} />
            Dashboard Overview
          </h1>
          <p className={styles.page_subtitle}>
            Monitor your orders and business performance
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
              <span className={styles.stat_number}>{stats.approved}</span>
              <span className={styles.stat_label}>Approved</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{stats.completed}</span>
              <span className={styles.stat_label}>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className={styles.dashboard_content}>
        {/* Order Progress Section */}
        <div className={styles.progress_section}>
          <div className={styles.section_header}>
            <BiTrendingUp className={styles.section_icon} />
            <h2>Order Progress</h2>
          </div>
          
          {displayOrders.length === 0 ? (
            <div className={styles.empty_state}>
              <BiPackage className={styles.empty_icon} />
              <h3>No orders found</h3>
              <p>You don't have any orders yet.</p>
            </div>
          ) : (
            <div className={styles.orders_progress}>
              {displayOrders.map((order, index) => {
                const progress = calculateProgress(order.status);
                return (
                  <div key={order._id} className={styles.progress_card}>
                    <div className={styles.progress_header}>
                      <div className={styles.progress_info}>
                        <h4>Order #{index + 1}</h4>
                        <p>{order.serviceId.serviceName}</p>
                      </div>
                      <div className={`${styles.progress_status} ${styles[order.status.toLowerCase()]}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                    </div>
                    
                    <div className={styles.progress_bar_container}>
                      <div className={styles.progress_label}>
                        <span>Progress</span>
                        <span>{progress}</span>
                      </div>
                      <div className={styles.progress_bar}>
                        <div 
                          className={`${styles.progress_fill} ${styles[order.status.toLowerCase()]}`}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.progress_actions}>
                      <button
                        className={`${styles.action_btn} ${styles.view_btn}`}
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                      >
                        <MdVisibility size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details Section */}
        <div className={styles.details_section}>
          <div className={styles.section_header}>
            <MdPeople className={styles.section_icon} />
            <h2>Customer Details</h2>
          </div>
          
          {displayOrders.length === 0 ? (
            <div className={styles.empty_state}>
              <MdPeople className={styles.empty_icon} />
              <h3>No customer data</h3>
              <p>Customer information will appear here.</p>
            </div>
          ) : (
            <div className={styles.order_details_list}>
              {displayOrders.map((order) => {
                const fullName = `${order.userId.firstname} ${order.userId.lastname}`;
                return (
                  <div key={order._id} className={styles.detail_card}>
                    <div className={styles.detail_header}>
                      <div className={styles.customer_avatar}>
                        {order.userId.profileImage ? (
                          <Image
                            src={order.userId.profileImage}
                            alt={fullName}
                            width={40}
                            height={40}
                            className={styles.avatar_img}
                            onError={(e) => {
                              e.currentTarget.src = "/users/Ellipse 24.svg";
                            }}
                          />
                        ) : (
                          <Image
                            src="/users/Ellipse 24.svg"
                            alt={fullName}
                            width={40}
                            height={40}
                            className={styles.avatar_img}
                          />
                        )}
                      </div>
                      <div className={styles.customer_info}>
                        <h4>{fullName}</h4>
                        <p>
                          <MdLocationOn size={14} />
                          {order.userId.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.detail_content}>
                      <div className={styles.detail_item}>
                        <span className={styles.label}>Service</span>
                        <span className={styles.value}>{order.serviceId.serviceName}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.label}>Price</span>
                        <span className={styles.value + ' ' + styles.price}>${order.serviceId.price}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.label}>Quantity</span>
                        <span className={styles.value}>{order.quantity}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.label}>Status</span>
                        <span className={styles.value}>{order.status}</span>
                      </div>
                    </div>
                    
                    <div className={styles.detail_actions}>
                      <div className="dropdown-container" style={{ position: 'relative' }}>
                        <button 
                          className={styles.more_btn}
                          onClick={() => toggleDropdown(order._id)}
                        >
                          <BsThreeDots size={16} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === order._id && (
                          <div className={styles.dropdown_menu}>
                            <button 
                              className={styles.dropdown_item}
                              onClick={() => handleViewFullDetails(order)}
                            >
                              <MdVisibility size={16} />
                              <span>View Full Details</span>
                            </button>
                            
                            <button 
                              className={styles.dropdown_item}
                              onClick={() => handleContactCustomer(order)}
                            >
                              <MdPhone size={16} />
                              <span>Call Customer</span>
                            </button>
                            
                            <button 
                              className={styles.dropdown_item}
                              onClick={() => handleEmailCustomer(order)}
                            >
                              <MdEmail size={16} />
                              <span>Email Customer</span>
                            </button>
                            
                            <button 
                              className={styles.dropdown_item}
                              onClick={() => handleViewCustomerLocation(order)}
                            >
                              <MdLocationOn size={16} />
                              <span>View on Map</span>
                            </button>
                            
                            <div className={styles.dropdown_divider} />
                            
                            {order.status.toLowerCase() === 'pending' && (
                              <>
                                <button 
                                  className={`${styles.dropdown_item} ${styles.approve_action}`}
                                  onClick={() => handleUpdateOrderStatus(order._id, 'Approved')}
                                >
                                  <MdCheck size={16} />
                                  <span>Mark as Approved</span>
                                </button>
                                
                                <button 
                                  className={`${styles.dropdown_item} ${styles.reject_action}`}
                                  onClick={() => handleUpdateOrderStatus(order._id, 'Rejected')}
                                >
                                  <MdCancel size={16} />
                                  <span>Mark as Rejected</span>
                                </button>
                              </>
                            )}
                            
                            {order.status.toLowerCase() === 'approved' && (
                              <button 
                                className={`${styles.dropdown_item} ${styles.complete_action}`}
                                onClick={() => handleUpdateOrderStatus(order._id, 'Completed')}
                              >
                                <MdCheck size={16} />
                                <span>Mark as Completed</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && selectedOrder && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <div className={styles.modal_header}>
              <h2>Order Details</h2>
              <button 
                className={styles.close_button}
                onClick={() => setIsModalOpen(false)}
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className={styles.modal_content}>
              {/* Customer Information */}
              <div className={styles.modal_section}>
                <div className={styles.modal_customer_info}>
                  <div className={styles.customer_avatar_large}>
                    {selectedOrder.userId.profileImage ? (
                      <Image
                        src={selectedOrder.userId.profileImage}
                        alt={selectedOrder.userId.firstname + ' ' + selectedOrder.userId.lastname}
                        width={60}
                        height={60}
                        className={styles.avatar_img_large}
                        onError={(e) => {
                          e.currentTarget.src = "/users/Ellipse 24.svg";
                        }}
                      />
                    ) : (
                      <Image
                        src="/users/Ellipse 24.svg"
                        alt={selectedOrder.userId.firstname + ' ' + selectedOrder.userId.lastname}
                        width={60}
                        height={60}
                        className={styles.avatar_img_large}
                      />
                    )}
                  </div>
                  <div className={styles.customer_details}>
                    <h3>{selectedOrder.userId.firstname} {selectedOrder.userId.lastname}</h3>
                    <div className={styles.detail_row}>
                      <MdLocationOn size={16} />
                      <span>{selectedOrder.userId.location}</span>
                    </div>
                    <div className={styles.detail_row}>
                      <MdPhone size={16} />
                      <span>{selectedOrder.userId.phone}</span>
                    </div>
                    <div className={styles.detail_row}>
                      <MdEmail size={16} />
                      <span>{selectedOrder.userId.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className={styles.modal_section}>
                <div className={styles.service_details}>
                  <div className={styles.detail_item}>
                    <div className={styles.label}>Service Name</div>
                    <div className={styles.value}>{selectedOrder.serviceId.serviceName}</div>
                  </div>
                  <div className={styles.detail_item}>
                    <div className={styles.label}>Price</div>
                    <div className={styles.value}>${selectedOrder.serviceId.price}</div>
                  </div>
                  <div className={styles.detail_item}>
                    <div className={styles.label}>Quantity</div>
                    <div className={styles.value}>{selectedOrder.quantity}</div>
                  </div>
                  <div className={styles.detail_item}>
                    <div className={styles.label}>Status</div>
                    <div className={styles.value + ' ' + styles.status + ' ' + styles[selectedOrder.status.toLowerCase()]}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
