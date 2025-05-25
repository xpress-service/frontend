import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineTrackChanges } from "react-icons/md";
import { CiHome } from "react-icons/ci"; 
import { FaFirstOrder } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import styles from '../../sass/layout/layout.module.scss'
import Link from "next/link";
import Image from "next/image";




const Sidebar = () => {
    return(
        <div className={styles.sidebarItems}>
             <Link href="/">
            <div className={styles.logo_box}>
           
        <Image 
        src='/logo.jpg'
        alt="logo"
        width={50}
        height={50}
        />
       
            </div>
             </Link>
             <Link href='/dashboard'>
            <div className={styles.icons}>
           
            <MdOutlineDashboard size={26} className={styles.iconsActive}/>
            <p>DASHBOARD</p>
           
            </div>
            </Link>

            <Link href='/servicelist'>
            <div className={styles.icons}>
           
            <CiHome size={26} className={styles.iconsActive}/>
            <p>HOME</p>
           
            </div>
            </Link>

            <Link href='/orders'>
            <div className={styles.icons}>
           
            <FaFirstOrder size={26} className={styles.iconsActive}/>
            <p>ORDERS</p>
           
            </div>
            </Link>
            <Link href='/ordertracking'>
            <div className={styles.icons}>
            
            <MdOutlineTrackChanges size={26} className={styles.iconsActive}/>
            <p>TRACKING</p>
           
            </div>
            </Link>
            <Link href='userprofile'>
            <div className={styles.icons}>
            <MdOutlinePerson size={26} className={styles.iconsActive}/>
            <p>PROFILE</p>
            </div>
            </Link>
            <Link href='transaction'>
            <div className={styles.icons}>
            <GrTransaction size={26} className={styles.iconsActive}/>
            <p>TRANSACTION</p>
            </div>
            </Link>
        </div>
    )
}
export default Sidebar