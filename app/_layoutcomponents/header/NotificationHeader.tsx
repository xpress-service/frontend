import React from "react";
import { TbNotification } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import styles from "../../sass/transaction/notification.module.scss"

const NotificationHeader = () => {
  return (
    <div className={styles.note_header}>
      <div className={styles.searchbox}>
        <CiSearch size={24}/>
        <input />
      </div>
      <div className={styles.userbox}>
        <TbNotification size={26}/>
        <Image src="/users/Ellipse 34.svg" alt="img" width={40} height={40} />
      </div>
    </div>
  );
};

export default NotificationHeader;
