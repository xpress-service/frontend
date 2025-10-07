'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import ProfileAvatar from '../../_components/ProfileAvatar';
import { MdClose, MdVisibility } from 'react-icons/md';
import { BiPackage } from 'react-icons/bi';
import styles from './orders.module.scss';
import { useSearch } from "../../_layoutcomponents/searchContext";

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

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { searchQuery } = useSearch();

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

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      setUpdating(true);
      const response = await axios.patch(
        `${baseUrl}/orders/${orderId}`, 
        { status });
      if (response.status === 200) {
        // Update the order status locally
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
        setShowModal(false); // Close the modal
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating order status:', error.message);
      } else {
        console.error('Unknown error occurred while updating order status.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'completed':
        return '#06b6d4';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <FaCheck />;
      case 'pending':
        return <FaClock />;
      case 'rejected':
        return <FaTimes />;
      case 'completed':
        return <FaCheck />;
      default:
        return <FaClock />;
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

 const filteredOrders = orders.filter((order) =>
  order?.serviceId?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
);

  if (loading) {
    return (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.orders_page}>
      {/* Header Section */}
      <div className={styles.page_header}>
        <div className={styles.header_content}>
          <h1 className={styles.page_title}>
            <BiPackage className={styles.title_icon} />
            Orders Management
          </h1>
          <p className={styles.page_subtitle}>
            Manage and track all your service orders
          </p>
          <div className={styles.stats_bar}>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>{orders.length}</span>
              <span className={styles.stat_label}>Total Orders</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>
                {orders.filter(o => o.status.toLowerCase() === 'pending').length}
              </span>
              <span className={styles.stat_label}>Pending</span>
            </div>
            <div className={styles.stat_item}>
              <span className={styles.stat_number}>
                {orders.filter(o => o.status.toLowerCase() === 'approved').length}
              </span>
              <span className={styles.stat_label}>Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className={styles.orders_container}>
        {(searchQuery ? filteredOrders : orders).length === 0 ? (
          <div className={styles.empty_state}>
            <BiPackage className={styles.empty_icon} />
            <h3>No orders found</h3>
            <p>You don't have any orders yet. Check back later!</p>
          </div>
        ) : (
          <div className={styles.orders_grid}>
            {(searchQuery ? filteredOrders : orders).map((order) => (
              <div key={order._id} className={styles.order_card}>
                {/* Order Header */}
                <div className={styles.order_header}>
                  <div className={styles.service_info}>
                    <h3 className={styles.service_name}>{order.serviceId.serviceName}</h3>
                    <div className={styles.order_meta}>
                      <span className={styles.quantity}>
                        <BiPackage size={14} />
                        Qty: {order.quantity}
                      </span>
                      {order.serviceId.price && (
                        <span className={styles.price}>${order.serviceId.price}</span>
                      )}
                    </div>
                  </div>
                  <div 
                    className={styles.status_badge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className={styles.customer_section}>
                  <div className={styles.customer_header}>
                    <div className={styles.customer_avatar}>
                      <ProfileAvatar
                        src={order.userId.profileImage}
                        firstname={order.userId.firstname}
                        lastname={order.userId.lastname}
                        width={40}
                        height={40}
                        className={styles.avatar_img}
                      />
                    </div>
                    <div className={styles.customer_info}>
                      <h4 className={styles.customer_name}>
                        {order.userId.firstname} {order.userId.lastname}
                      </h4>
                      <div className={styles.customer_details}>
                        <span className={styles.detail_item}>
                          <FaMapMarkerAlt size={12} />
                          {order.userId.location}
                        </span>
                        <span className={styles.detail_item}>
                          <FaPhone size={12} />
                          {order.userId.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className={styles.order_actions}>
                  <button
                    className={styles.view_button}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                  >
                    <MdVisibility size={16} />
                    View Details
                  </button>
                  {order.status.toLowerCase() === 'pending' && (
                    <div className={styles.quick_actions}>
                      <button
                        className={`${styles.action_btn} ${styles.approve_btn}`}
                        onClick={() => handleOrderStatusChange(order._id, 'Approved')}
                      >
                        <FaCheck size={14} />
                        Approve
                      </button>
                      <button
                        className={`${styles.action_btn} ${styles.reject_btn}`}
                        onClick={() => handleOrderStatusChange(order._id, 'Rejected')}
                      >
                        <FaTimes size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedOrder && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <div className={styles.modal_header}>
              <h2>Order Details</h2>
              <button 
                className={styles.close_button}
                onClick={() => setShowModal(false)}
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className={styles.modal_content}>
              {/* Service Details */}
              <div className={styles.modal_section}>
                <h3>Service Information</h3>
                <div className={styles.service_details}>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Service:</span>
                    <span className={styles.value}>{selectedOrder.serviceId.serviceName}</span>
                  </div>
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Quantity:</span>
                    <span className={styles.value}>{selectedOrder.quantity}</span>
                  </div>
                  {selectedOrder.serviceId.price && (
                    <div className={styles.detail_row}>
                      <span className={styles.label}>Price:</span>
                      <span className={styles.value}>${selectedOrder.serviceId.price}</span>
                    </div>
                  )}
                  <div className={styles.detail_row}>
                    <span className={styles.label}>Status:</span>
                    <span 
                      className={styles.status_tag}
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className={styles.modal_section}>
                <h3>Customer Information</h3>
                <div className={styles.customer_details_modal}>
                  <div className={styles.customer_avatar_large}>
                    <ProfileAvatar
                      src={selectedOrder.userId.profileImage}
                      firstname={selectedOrder.userId.firstname}
                      lastname={selectedOrder.userId.lastname}
                      width={60}
                      height={60}
                      className={styles.avatar_img_large}
                    />
                  </div>
                  <div className={styles.customer_info_modal}>
                    <div className={styles.detail_row}>
                      <FaUser className={styles.detail_icon} />
                      <span>{selectedOrder.userId.firstname} {selectedOrder.userId.lastname}</span>
                    </div>
                    <div className={styles.detail_row}>
                      <FaMapMarkerAlt className={styles.detail_icon} />
                      <span>{selectedOrder.userId.location}</span>
                    </div>
                    <div className={styles.detail_row}>
                      <FaPhone className={styles.detail_icon} />
                      <span>{selectedOrder.userId.phone}</span>
                    </div>
                    <div className={styles.detail_row}>
                      <FaEnvelope className={styles.detail_icon} />
                      <span>{selectedOrder.userId.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={styles.modal_actions}>
              {selectedOrder.status.toLowerCase() === 'pending' && (
                <>
                  <button
                    className={`${styles.modal_btn} ${styles.approve_btn}`}
                    onClick={() => handleOrderStatusChange(selectedOrder._id, 'Approved')}
                    disabled={updating}
                  >
                    <FaCheck size={16} />
                    {updating ? 'Processing...' : 'Approve Order'}
                  </button>
                  <button
                    className={`${styles.modal_btn} ${styles.reject_btn}`}
                    onClick={() => handleOrderStatusChange(selectedOrder._id, 'Rejected')}
                    disabled={updating}
                  >
                    <FaTimes size={16} />
                    {updating ? 'Processing...' : 'Reject Order'}
                  </button>
                </>
              )}
              <button
                className={`${styles.modal_btn} ${styles.close_btn}`}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
