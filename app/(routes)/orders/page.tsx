'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DefaultLayout from '@/app/_layoutcomponents/DefaultLayout';
import styles from '../../sass/postservice/service.module.scss';

interface Order {
  _id: string;
  serviceId: { serviceName: string };
  quantity: number;
  status: string;
  userId: {
    firstname: string;
    lastname: string;
    location: string;
    phone: string;
    email: string;
  };
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null);

  const fetchVendorOrders = async () => {
    const serviceOwnerId = localStorage.getItem('userId');
    if (serviceOwnerId) {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/vendor/${serviceOwnerId}`);
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

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}`, { status });
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
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  return (
    <DefaultLayout serviceOwnerId={serviceOwnerId || ''}>
    <div className={styles.order_container}>
      {orders.map((order) => (
        <div
          key={order._id}
          className={styles.order_card}
          onClick={() => {
            setSelectedOrder(order);
            setShowModal(true);
          }}
        >
          <h3>Order: {order.serviceId.serviceName}</h3>
          <p>Quantity: {order.quantity}</p>
          <p>Status: {order.status}</p>

          <div className={styles.order_detail}>
            <h4>User Details</h4>
            <p>Username: {`${order.userId.firstname}  ${order.userId.lastname}`}</p>
            <p>Location: {order.userId.location}</p>
            <p>Phone: {order.userId.phone}</p>
            <p>Email: {order.userId.email}</p>
          </div>
        </div>
      ))}

      {showModal && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modal_content}>
            <h3>Order: {selectedOrder.serviceId.serviceName}</h3>
            <p>Quantity: {selectedOrder.quantity}</p>
            <p>Status: {selectedOrder.status}</p>

            <div className={styles.modal_actions}>
              <button onClick={() => handleOrderStatusChange(selectedOrder._id, 'Approved')}>
                Accept
              </button>
              <button onClick={() => handleOrderStatusChange(selectedOrder._id, 'Rejected')}>
                Reject
              </button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DefaultLayout>
  );
};

export default OrderList;
