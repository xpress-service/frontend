import React from "react";
import DefaultLayout from "@/app/_layoutcomponents/DefaultLayout";
import Image from "next/image";
import { BiPencil } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import styles from "../../sass/userprofile/userprofile.module.scss";
import { BsThreeDots } from "react-icons/bs";

const users = [
  {
    id: '1',
    image: "/users/Ellipse 24.svg",
    name:'Tosin Gabriel',
    location:'Ojo, Lagos',
    status:'Completed',
    profession: 'Car repairer',
    amount: '7,500'
  },
  {
    id: '1',
    image: '/users/Ellipse 24.svg',
    name:'Tosin Gabriel',
    location:'Ojo, Lagos',
    status:'Pending',
    profession: 'hair dresser',
    amount: '11,500'
  },
  {
    id: '1',
    image: '/users/Ellipse 24.svg',
    name:'Tosin Gabriel',
    location:'Ojo, Lagos',
    status:'Cancel',
    profession: 'Fast food',
    amount: '8,500'
  }
]


const UserProfile = () => {
  
  return (
    <DefaultLayout>
      <div className={styles.profile_container}>
        <div className={styles.rightContainer}>
          <Image src="/users/Ellipse 24.svg" alt="img" width={80} height={70} />
          <p className={styles.name}>Gabriel Tosin</p>
          <p className={styles.usercode}>SX8674584</p>
          <p>Joined: 25/10/2023 </p>
        </div>
        <div className={styles.leftContainer}>
          <div className={styles.Basic}>
            <p  className={styles.basic_info}>Basic Info</p>
            <BiPencil size={18} />
          </div>
          <div className={styles.info}>
            <div>
              <p>Email</p>
              <p>tosingab8@gmail.com</p>
              <p className={styles.verified}>verified</p>
            </div>

            <div>
              <p>NIN</p>
              <p>xxxxxxxx</p>
            </div>

            <div>
              <p>Mobile Number</p>
              <p>081 5462 5841</p>
            </div>
          </div>
          <div className={styles.infobox}>
            <div>
              <p>Birthday</p>
              <p>21/01/1989</p>
            </div>
            <div>
              <p>Location</p>
              <p className={styles.locationbox}>
                <GrLocation />
                Lagos, Nigeria
              </p>
            </div>
            <div>
              <p>Gender</p>
              <p>Male</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.orderContainer}>
        
          <p  className={styles.name}>Your order summary</p>
          <div className={styles.summary}>
            <div className={styles.statusbox}>
            <p className={styles.orderComplete}>Completed</p>
            <p>122</p>
          </div>
          <div className={styles.statusbox}>
            <p className={styles.orderPending}>Pending</p>
            <p>15</p>
          </div>
          <div className={styles.statusbox}>
            <p className={styles.orderCancel}>Cancel</p>
            <p>45</p>
          </div>
          </div>
        
        {users.map((user, id) =>{
           let statusClass = "";
           switch (user.status) {
             case "Completed":
               statusClass = styles.statusCompleted;
               break;
             case "Pending":
               statusClass = styles.statusPending;
               break;
             case "Cancel":
               statusClass = styles.statusCanceled;
               break;
             default:
               statusClass = "";
           }
          return(
            <div key={id} className={styles.userOrderbox}>
              <div className={styles.imgContainer}>
              <Image src={user.image} alt="img" width={40} height={40}/>
              <div>
                <p>{user.name}</p>
                <p className={styles.location_text}>{user.location}</p>
              </div>
              </div>
              <p className={`${styles.status} ${statusClass}`}>
                    {user.status}
                  </p>
              <p>{user.profession}</p>
              <p>${user.amount}</p>
              <BsThreeDots size={16}/>
            </div>
          )
        })}
        <div className={styles.viewbox}>
        <button className={styles.viewbtn}>View More</button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserProfile;
