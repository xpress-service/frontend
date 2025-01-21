import { MdOutlineDashboard } from "react-icons/md";
import { BiAnalyse } from "react-icons/bi";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineTrackChanges } from "react-icons/md";
import styles from '../../sass/layout/layout.module.scss'
import Link from "next/link";

const Sidebar = () => {
    return(
        <div className={styles.sidebarItems}>
             <Link href='/dashboard'>
            <div className={styles.icons}>
           
            <MdOutlineDashboard size={26} className={styles.iconsActive}/>
            <p>DASHBOARD</p>
           
            </div>
            </Link>

            <Link href='/servicelist'>
            <div className={styles.icons}>
           
            <MdOutlineDashboard size={26} className={styles.iconsActive}/>
            <p>HOME</p>
           
            </div>
            </Link>

            <Link href='/orders'>
            <div className={styles.icons}>
           
            <MdOutlineDashboard size={26} className={styles.iconsActive}/>
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
            <BiAnalyse size={26} className={styles.iconsActive}/>
            <p>TRANSACTION</p>
            </div>
            </Link>
        </div>
    )
}
export default Sidebar