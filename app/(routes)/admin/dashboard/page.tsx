import React from "react";
import AdminLayout from "@/app/_layoutcomponents/AdminLayout";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import styles from "../../../sass/layout/admin/dashboard.module.scss";

const pending = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    name: "Joseph John",
    location: "Ojo, Lagos",
    status: "pending",
    service: "Laundry",
    price: "2,500",
  },
  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    name: "John Doe",
    location: "Ojo, Lagos",
    status: "pending",
    service: "car repairs",
    price: "2,500",
  },
];
const cancel = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    name: "Joseph John",
    location: "Ojo, Lagos",
    status: "cancel",
    service: "Laundry",
    price: "2,500",
  },
  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    name: "John Doe",
    location: "Ojo, Lagos",
    status: "cancel",
    service: "food delivery",
    price: "2,500",
  },
];

const confirmed = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    name: "Joseph John",
    location: "Ojo, Lagos",
    status: "confirmed",
    service: "Laundry",
    price: "2,500",
  },
  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    name: "John Doe",
    location: "Ojo, Lagos",
    status: "confirmed",
    service: "Hair dresser",
    price: "2,500",
  },
];

const finished = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    name: "Joseph John",
    location: "Ojo, Lagos",
    status: "finished",
    service: "Laundry",
    price: "2,500",
  },
  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    name: "John Doe",
    location: "Ojo, Lagos",
    status: "confirmed",
    service: "car repairs",
    price: "2,500",
  },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <main className={styles.booking_container}>
        <section className={styles.pendingsection}>
          <div className={styles.pending}>
            <p className={styles.title}>Bookings Pending</p>
            {pending.map((item, id) => {
              return (
                <div key={id} className={styles.pendingItems}>
                  <div className={styles.user}>
                    <Image src={item.image} alt="img" width={30} height={30} />
                    <div>
                      <p>{item.name}</p>
                      <p className={styles.location}>{item.location}</p>
                    </div>
                  </div>
                  <p className={styles.statusPending}>{item.status}</p>
                  <p>{item.service}</p>
                  <p>{item.price}</p>
                  <BsThreeDots />
                </div>
              );
            })}
          </div>

          <div className={styles.cancelContainer}>
            <p className={styles.title}>Bookings cancel</p>
            {cancel.map((item, id) => {
              return (
                <div key={id} className={styles.pendingItems}>
                  <div className={styles.user}>
                    <Image src={item.image} alt="img" width={30} height={30} />
                    <div>
                      <p>{item.name}</p>
                      <p className={styles.location}>{item.location}</p>
                    </div>
                  </div>
                  <p>{item.service}</p>
                  <p className={styles.statuscancel}>{item.status}</p>
                  <p>{item.price}</p>
                  <BsThreeDots />
                </div>
              );
            })}
          </div>
        </section>
        <section className={styles.pendingsection}>
          <div className={styles.pending}>
            <p className={styles.title}>Bookings Comfired</p>
            {confirmed.map((item, id) => {
              return (
                <div key={id} className={styles.pendingItems}>
                  <div className={styles.user}>
                    <Image src={item.image} alt="img" width={30} height={30} />
                    <div>
                      <p>{item.name}</p>
                      <p className={styles.location}>{item.location}</p>
                    </div>
                  </div>
                  <p>{item.service}</p>
                  <p className={styles.statusConfirm}>{item.status}</p>
                  <p>{item.price}</p>
                  <BsThreeDots />
                </div>
              );
            })}
          </div>

          <div className={styles.cancelContainer}>
            <p className={styles.title}>Bookings Finished</p>
            {finished.map((item, id) => {
              return (
                <div key={id} className={styles.pendingItems}>
                  <div className={styles.user}>
                    <Image src={item.image} alt="img" width={30} height={30} />
                    <div>
                      <p>{item.name}</p>
                      <p className={styles.location}>{item.location}</p>
                    </div>
                  </div>
                  <p className={styles.statusConfirm}>{item.status}</p>
                  <p>{item.service}</p>
                  <p>{item.price}</p>
                  <BsThreeDots />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
