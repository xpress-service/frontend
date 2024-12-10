import { MdOutlineDashboard } from "react-icons/md";
import { BiAnalyse } from "react-icons/bi";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineTrackChanges } from "react-icons/md";
import styles from '../../sass/layout/admin/admin.module.scss'
import Link from "next/link";

const AdminSidebar = () => {
    return(
        <div className={styles.sidebarItems}>
             <Link href='/admin/dashboard'>
            <div className={styles.icons}>
           
            <MdOutlineDashboard size={26} className={styles.iconsActive}/>
            <p>DASHBOARD</p>
           
            </div>
            </Link>
            <Link href='/admin/manage'>
            <div className={styles.icons}>
            
            <MdOutlineTrackChanges size={26} className={styles.iconsActive}/>
            <p>MANAGE</p>
           
            </div>
            </Link>
            <Link href='/admin/profile'>
            <div className={styles.icons}>
            <MdOutlinePerson size={26} className={styles.iconsActive}/>
            <p>PROFILE</p>
            </div>
            </Link>
        </div>
    )
}
export default AdminSidebar