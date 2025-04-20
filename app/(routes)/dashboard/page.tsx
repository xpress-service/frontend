'use client'
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DefaultLayout from "@/app/_layoutcomponents/DefaultLayout";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import styles from "../../sass/layout/dashboard.module.scss";
import axios from 'axios'


const orders = [
  {
    id: "1",
    task: "car repair",
    orderIndex: "1",
    progress: "78%",
  },

  {
    id: "2",
    task: "food delivery",
    orderIndex: "2",
    progress: "62%",
  },
];

const ordersDetails = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    fullname: "John Doe",
    location: "Ojo, Lagos",
    status: "completed",
    service: "car repair",
    amount: "7,500",
  },

  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    fullname: "Susan Doe",
    location: "Ojota, Lagos",
    status: "pending",
    service: "Laundry service",
    amount: "5000",
  },
  {
    id: "3",
    image: "/users/Ellipse 24.svg",
    fullname: "Chris Joe",
    location: "Makurdi, Benue",
    status: "completed",
    service: "Food delivery",
    amount: "2,500",
  },
  {
    id: "4",
    image: "/users/Ellipse 24.svg",
    fullname: "Mike Jane",
    location: "Abuja, Nigeria",
    status: "cancel",
    service: "Vert",
    amount: "15000",
  },
];
const Dashboard = ({serviceOwnerId}:any) => {

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/sign-in'); // Redirect to sign-in page if not authenticated
    return null;
  }
  return (
    <DefaultLayout serviceOwnerId={serviceOwnerId}>
      <div className={styles.dashboard_container}>
        <div className={styles.order_wrapper}>
          {orders.map((order, id) => {
            return (
              <div key={id} className={styles.order_container}>
                <div>
                  <p className={styles.item_name}>Order {order.orderIndex}</p>
                  <p className={styles.item_name}>task: {order.task}</p>
                </div>
                <div>
                  <p>{order.progress}</p>
                  <div className={styles.progressbar}></div>
                </div>
                <button>view</button>
              </div>
            );
          })}
        </div>

        <div className={styles.orderDetails}>
          <h3>ORDER DETAILS</h3>
          {ordersDetails.map((item, id) => {
            let statusClass = "";
            switch (item.status) {
              case "completed":
                statusClass = styles.statusCompleted;
                break;
              case "pending":
                statusClass = styles.statusPending;
                break;
              case "cancel":
                statusClass = styles.statusCanceled;
                break;
              default:
                statusClass = "";
            }
            return (
              <div key={id} className={styles.details_wrapper}>
                <div className={styles.userbox}>
                  <Image src={item.image} alt="img" width={30} height={30} />
                  <div>
                    <p className={styles.item_name}>{item.fullname}</p>
                    <p className={styles.location}>{item.location}</p>
                  </div>
                </div>

                <div className={styles.itembox}>
                  <p className={`${styles.status} ${statusClass}`}>
                    {item.status}
                  </p>
                </div>

                <div className={styles.itembox}>
                  <p className={styles.item_name}>{item.service}</p>
                </div>
                <div className={styles.itembox}>
                  <p className={styles.item_name}>${item.amount}</p>
                </div>
                <BsThreeDots className={styles.dots}/>
              </div>
            );
          })}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
