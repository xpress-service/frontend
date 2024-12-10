import React from "react";
import AdminLayout from "@/app/_layoutcomponents/AdminLayout";
import styles from "../../../sass/layout/admin/manage.module.scss";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { PiPencil } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";

const vendor = [
  {
    id: "1",
    image: "/users/Ellipse 24.svg",
    name: "Joseph John",
    location: "Ojo, Lagos",
    service: "Laundry",
    gender: "M",
  },
  {
    id: "2",
    image: "/users/Ellipse 24.svg",
    name: "John Doe",
    location: "Ojo, Lagos",
    service: "car repairs",
    gender: "F",
  },
];

const locations = [
  {
    id: "1",
    location: "Lagos",
    icon: <AiFillDelete />,
  },
  {
    id: "2",
    location: "Abuja",
    icon: <AiFillDelete />,
  },
  {
    id: "3",
    location: "Benue",
    icon: <AiFillDelete />,
  },
  {
    id: "4",
    location: "Abia",
    icon: <AiFillDelete />,
  },
  {
    id: "5",
    location: "Delta",
    icon: <AiFillDelete />,
  },
  {
    id: "6",
    location: "Kwara",
    icon: <AiFillDelete />,
  },
];

const Manage = () => {
  return (
    <AdminLayout>
      <div className={styles.manageContainer}>
        <section className={styles.locationbox}>
          <div className={styles.locationItem}>
            <p className={styles.title_text}>Recognize location</p>
            <PiPencil size={16} />
          </div>
          <div className={styles.location_container}>
            {locations.map((location, id) => {
              return (
                <div key={id} className={styles.places}>
                  <p>{location.location}</p>
                  <p>{location.icon}</p>
                </div>
              );
            })}
          </div>
          <div className={styles.btn_container}>
            <button>View More</button>
          </div>
        </section>

        <section>
          <div className={styles.ven_container}>
            <p className={styles.title_text}>Vendors</p>
            <PiPencil size={16} />
          </div>
          {vendor.map((item, id) => {
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
                <p>{item.gender}</p>
                <AiFillDelete size={16} />
                <BsThreeDots size={16} />
              </div>
            );
          })}
          <div className={styles.btn_container}>
            <button>View More</button>
          </div>
        </section>
        <section>
          <div className={styles.ven_container}>
            <p className={styles.title_text}>Users/ Bookings</p>
            <PiPencil size={16} />
          </div>
          {vendor.map((item, id) => {
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
                <p>{item.gender}</p>
                <AiFillDelete size={16} />
                <BsThreeDots size={16} />
              </div>
            );
          })}

          <div className={styles.btn_container}>
            <button>View More</button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Manage;
