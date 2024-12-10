import React from "react";
import Image from "next/image";
import { BiPencil } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import styles from "../../../sass/userprofile/userprofile.module.scss";
import { BsThreeDots } from "react-icons/bs";
import AdminLayout from '@/app/_layoutcomponents/AdminLayout'




const users = [
    {
      id: '1',
      image: "/users/Ellipse 24.svg",
      name:'Tosin Gabriel',
      location:'Ojo, Lagos',
      profession: 'Car repairer',
      gender: 'M'
    },
    {
      id: '1',
      image: '/users/Ellipse 24.svg',
      name:'Tosin Joy',
      location:'Ojo, Lagos',
      profession: 'hair dresser',
      gender: 'F'
    },
    {
      id: '1',
      image: '/users/Ellipse 24.svg',
      name:'Ann Gabriel',
      location:'Ojo, Lagos',
      profession: 'Fast food',
      gender: 'F'
    }
  ]
  
const page = () => {
  return (
    <AdminLayout>    
 <div className={styles.profile_container}>
        <div className={styles.rightContainer}>
          <Image src="/users/Ellipse 24.svg" alt="img" width={80} height={70} />
          <p className={styles.name}>Gabriel Tosin</p>
          <p className={styles.usercode}>Admin</p>
        </div>
        <div className={styles.leftContainer}>
          <div className={styles.Basic}>
            <p  className={styles.name}>Basic Info</p>
            <BiPencil size={18} />
          </div>
          <div className={styles.info}>
            <div>
              <p>Email</p>
              <p>tosingab8@gmail.com</p>
              <p className={styles.verified}>verified</p>
            </div>

            <div>
              <p>Password</p>
              <p>xxxxxxxx</p>
              <p>Change Password</p>
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
          <p  className={styles.name}>Registered Vendors</p>
        {users.map((user, id) =>{
          return(
            <div key={id} className={styles.adminOrderbox}>
              <div className={styles.imgbox}>
              <Image src={user.image} alt="img" width={40} height={40}/>
              <div>
                <p>{user.name}</p>
                <p className={styles.location_text}>{user.location}</p>
              </div>
              </div>
              <p>{user.profession}</p>
              <p>{user.gender}</p>
              <BsThreeDots size={16}/>
            </div>
          )
        })}
        <div className={styles.viewbox}>
        <button className={styles.viewbtn}>View More</button>
        </div>
      </div>
    </AdminLayout>

  )
}

export default page