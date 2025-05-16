"use client";
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/app/_layoutcomponents/DefaultLayout";
import styles from "../../sass/tracking/tracking.module.scss";
import { MdInsertLink } from "react-icons/md";
import { GrCompliance, GrLocation } from "react-icons/gr";
import { SlLink } from "react-icons/sl";
import axios from "axios";

interface Steps {
  [key: string]: string; // Store actual tracking status
}

const Tracking = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [steps, setSteps] = useState<Steps>({});
  const [serviceOwnerId, setServiceOwnerId] = useState<string | null>(null);

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
      const response = await axios.get(
        `https://backend-production-d818.up.railway.app/api/orders/vendor/${ownerId}`,
        // `http://localhost:5000/api/orders/vendor/${ownerId}`,
      );
      setOrders(response.data);
      response.data.forEach((order: any) => fetchTracking(order._id));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchTracking = async (orderId: string) => {
    try {
      console.log("Fetching tracking for order:", orderId); // Debugging line
      const response = await axios.get(
        `https://backend-production-d818.up.railway.app/api/orders/tracking/order/${orderId}`,
        // `http://localhost:5000/api/orders/tracting/order/${orderId}`,
      );
  
      if (response.status === 200) {
        const orderStatus = response.data?.status || "Pending";
        console.log("API Response for tracking:", response); // Debugging line
        setSteps((prev) => ({
          ...prev,
          [orderId]: orderStatus,
        }));
      } else {
        console.error("Error fetching tracking status: Invalid response", response);
      }
    } catch (error) {
      console.error("Error fetching tracking status:", error);
    }
  };  

  // Debugging: Log the steps state to ensure it's updated correctly
  useEffect(() => {
    console.log("Current tracking steps:", steps);
  }, [steps]);

  return (
    <DefaultLayout serviceOwnerId={serviceOwnerId || ""}>
      <div className={styles.tracking_container}>
      <h2>Order Tracking</h2>
      {orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className={styles.trackContainer}>
            <div className={styles.Order}>
              <div className={styles.leftOrder}>
                <h3>Order {orders.indexOf(order) + 1}</h3>
                <p>Vendor: {order.serviceId?.serviceName || "N/A"}</p>
                <p>Request: {order.quantity}</p>
              </div>
              <div className={styles.rightOrder}>
                <div className={styles.icon_par}>
                  <GrLocation size={12} />
                  <p>{order.userId?.location || "N/A"}</p>
                </div>
                <p>Tracking ID: {order._id}</p>
              </div>
            </div>
            <div className={styles.progress_container}>
              <div className={styles.progress_bar}>
                <div
                  className={styles.progress}
                  style={{
                    width: `${
                      steps[order._id] === "Accepted"
                        ? 33
                        : steps[order._id] === "In Progress"
                        ? 66
                        : steps[order._id] === "Completed"
                        ? 100
                        : 0
                    }%`,
                  }}
                ></div>
                <div className={styles.steps}>
                  {[
                    { label: "Accepted", icon: <SlLink size={14} /> },
                    { label: "In Progress", icon: <MdInsertLink size={14} /> },
                    { label: "Completed", icon: <GrCompliance size={14} /> },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={`step ${
                        steps[order._id] === step.label ? "active" : ""
                      }`}
                    >
                      <div className={styles.circle}>{step.icon}</div>
                      <div className={styles.label}>{step.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.complainbox}>
              <p>Do you have any complaints?</p>
              <div className={styles.complainbtns}>
                <button>Yes</button>
                <button>No</button>
              </div>
            </div>
          </div>
        ))
      )}
      </div>
    </DefaultLayout>
  );
};

export default Tracking;
