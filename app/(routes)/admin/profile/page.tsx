'use client'
import React, { useState, useEffect} from "react";
import Image from "next/image";
import { BiPencil } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import styles from "../../../sass/userprofile/userprofile.module.scss";
import { BsThreeDots } from "react-icons/bs";
import AdminLayout from '@/app/_layoutcomponents/AdminLayout'
import axios from 'axios'
import * as jwt_decode from "jwt-decode";



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

  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);  // Log the token to see if it's there
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        console.log("Decoded user:", decodedUser);  // Log the decoded token to ensure it's valid
        try {
          const response = await axios.get(`http://localhost:5000/api/adminProfile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200){
            console.log('This is my response:', response)
            setProfile(response.data)
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      } else {
        console.log("No token found");
      }
    };
    fetchUserData();
  }, []);

  return (
    <AdminLayout>    
 <div className={styles.profile_container}>
        <div className={styles.rightContainer}>
        <Image src={profile?.profileImage} alt="img" width={80} height={70} className={styles.profileimg}/>
          <p className={styles.name}>{`${profile?.firstname} ${profile?.lastname}`}</p>
          <p className={styles.usercode}>{profile?.usercode}</p>
        </div>
        <div className={styles.leftContainer}>
          <div className={styles.Basic}>
            <p  className={styles.name}>Basic Info</p>
            <BiPencil size={18} />
          </div>
          <div className={styles.info}>
            <div>
              <p className={styles.heading}>Email</p>
              <p>{profile?.email}</p>
              <p className={styles.verified}>verified</p>
            </div>

            <div>
            <p className={styles.heading}>NIN</p>
            <p>{profile?.nin}</p>
            </div>

            <div>
              <p className={styles.heading}>Mobile Number</p>
              <p>{profile?.phone}</p>
            </div>
          </div>
          <div className={styles.infobox}>
            <div>
              <p className={styles.heading}>Birthday</p>
              <p>{profile?.birthdate}</p>
            </div>
            <div>
              <p className={styles.heading}>Location</p>
              <p className={styles.locationbox}>
                <GrLocation />
                {profile?.location}
              </p>
            </div>
            <div>
              <p className={styles.heading}>Gender</p>
              <p>{profile?.gender}</p>
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