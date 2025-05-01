'use client'
import React, {useState, useEffect} from "react";
import DefaultLayout from "@/app/_layoutcomponents/DefaultLayout";
import Image from "next/image";
import { BiPencil } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import styles from "../../sass/userprofile/userprofile.module.scss";
import { BsThreeDots } from "react-icons/bs";
import * as jwt_decode from "jwt-decode";
import axios from 'axios';

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
  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);  // Log the token to see if it's there
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        console.log("Decoded user:", decodedUser);  // Log the decoded token to ensure it's valid
        try {
          const response = await axios.get(
            `https://backend-production-d818.up.railway.app/api/profile`, 
            // 'http://localhost:5000/api/profile',
            {
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
    <DefaultLayout serviceOwnerId="">
      <div className={styles.profile_box}>
      <div className={styles.profile_container}>
        <div className={styles.rightContainer}>
          <Image src={profile?.profileImage} alt="img" width={80} height={70} className={styles.profileimg}/>
          <p className={styles.name}>{`${profile?.firstname} ${profile?.lastname}`}</p>
          <p className={styles.usercode}>{profile?.usercode}</p>
          <p>Joined: {new Date(profile?.dateJoined).toLocaleDateString()}</p>
        </div>
        <div className={styles.leftContainer}>
          <div className={styles.Basic}>
            <p  className={styles.basic_info}>Basic Info</p>
            <BiPencil size={16} />
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
          <p className={styles.name}>Your order summary</p>
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
              <div className={styles.orders_info_box}>
              <p className={`${styles.status} ${statusClass}`}>
                    {user.status}
                  </p>
              <p>{user.profession}</p>
              <p>${user.amount}</p>
              <BsThreeDots size={16}/>
              </div>
            </div>
          
          )
        })}
        <div className={styles.viewbox}>
        <button className={styles.viewbtn}>View More</button>
        </div>
      </div>
      </div>
    </DefaultLayout>
  );
};

export default UserProfile;
